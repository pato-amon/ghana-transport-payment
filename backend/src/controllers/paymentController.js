// backend/src/controllers/paymentController.js
const { v4: uuidv4 } = require('uuid');
const { Op, literal } = require('sequelize');
const sequelize = require('../config/database');

const { User, Wallet, Bus, Route, Transaction } = require('../models');
const moolreService = require('../services/moolreService');
const logger = require('../config/logger');
const {
    TRANSACTION_TYPES,
    TRANSACTION_STATUS,
    SMS_TEMPLATES,
} = require('../config/constants');

// ================================
// Helper: Generate Reference
// ================================
const generateRef = (prefix = 'TGH') => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
};

// ================================
// INITIATE FARE PAYMENT
// POST /api/v1/payments/fare
// ================================
exports.initiateFarePayment = async (req, res) => {
    const dbTransaction = await sequelize.transaction();

    try {
        const { busId, amountPaid, phone, network } = req.body;
        const passengerId = req.user.userId;

        // 1. Find bus + route + conductor
        const bus = await Bus.findByPk(busId, {
            include: [
                { model: Route, as: 'route' },
                { model: User, as: 'conductor' },
                { model: User, as: 'operator' },
            ],
            transaction: dbTransaction,
        });

        if (!bus || !bus.isActive) {
            await dbTransaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Bus not found or not active',
            });
        }

        const fareAmount = parseFloat(bus.route?.fareAmount || 0);
        const paid = parseFloat(amountPaid);
        const balance = parseFloat((paid - fareAmount).toFixed(2));

        // 2. Validate amount
        if (paid < fareAmount) {
            await dbTransaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Minimum payment is GHS ${fareAmount.toFixed(2)}`,
            });
        }

        // 3. Get passenger wallet
        const wallet = await Wallet.findOne({
            where: { userId: passengerId },
            lock: true,
            transaction: dbTransaction,
        });

        if (!wallet) {
            await dbTransaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Wallet not found',
            });
        }

        if (wallet.isLocked) {
            await dbTransaction.rollback();
            return res.status(403).json({
                success: false,
                message: 'Wallet is locked. Contact support.',
            });
        }

        // 4. Generate reference
        const paymentRef = generateRef('FARE');

        // 5. Create PENDING transaction
        const transaction = await Transaction.create({
            reference: paymentRef,
            type: TRANSACTION_TYPES.FARE_PAYMENT,
            status: TRANSACTION_STATUS.PENDING,
            amount: paid,
            fareAmount,
            balanceReturned: balance,
            senderId: passengerId,
            receiverId: bus.conductorId,
            walletId: wallet.id,
            busId: bus.id,
            routeId: bus.routeId,
            network,
            phoneUsed: phone,
            paymentMethod: 'mobile_money',
            description: `Bus fare: ${bus.route?.name || bus.busNumber}`,
            balanceBefore: parseFloat(wallet.balance),
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        // 6. Initiate MoolRe Payment (outside transaction)
        const moolreResponse = await moolreService.collectPayment({
            amount: paid,
            phone,
            network,
            reference: paymentRef,
            description: `Bus fare - ${bus.busNumber} - ${bus.route?.name}`,
            customerId: passengerId,
        });

        // Update transaction with MoolRe reference
        await transaction.update({
            moolreReference: moolreResponse.reference || moolreResponse.id,
            moolreStatus: moolreResponse.status,
        });

        logger.info(`Fare payment initiated: ${paymentRef} - GHS ${paid} from ${phone}`);

        res.status(200).json({
            success: true,
            message: 'Payment initiated. Approve on your phone.',
            reference: paymentRef,
            data: {
                busNumber: bus.busNumber,
                route: bus.route?.name,
                fareAmount,
                amountPaid: paid,
                balanceDue: balance,
                conductor: bus.conductor?.fullName,
            },
        });

    } catch (error) {
        await dbTransaction.rollback();
        logger.error('Fare payment initiation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Payment failed. Please try again.',
        });
    }
};

// ================================
// PAYMENT WEBHOOK (MoolRe Callback)
// POST /api/v1/payments/callback
// ================================
exports.paymentCallback = async (req, res) => {
    const dbTransaction = await sequelize.transaction();

    try {
        const signature = req.headers['x-moolre-signature'];
        const payload = req.body;

        // Validate webhook signature
        const isValid = moolreService.validateWebhookSignature(payload, signature);
        if (!isValid) {
            logger.warn('Invalid webhook signature received');
            return res.status(401).json({ message: 'Invalid signature' });
        }

        // Acknowledge immediately
        res.status(200).json({ received: true });
        setImmediate(() => processWebhook(payload));

        const processWebhook = async (payload) => {
            const dbTransaction = await sequelize.transaction();
            try {
                await this.handlePaymentCallback(payload, dbTransaction);
            } catch (err) {
                await dbTransaction.rollback();
                logger.error(err);
            }
        };

        if (transaction.processedAt) return;

        const { reference, status, amount, metadata } = payload;

        // Find transaction
        const transaction = await Transaction.findOne({
            where: { reference },
            include: [
                { model: Wallet, as: 'wallet' },
                {
                    model: Bus, as: 'bus', include: [
                        { model: User, as: 'conductor' },
                        { model: Route, as: 'route' },
                    ]
                },
            ],
            lock: true,
            transaction: dbTransaction,
        });

        if (!transaction) {
            await dbTransaction.rollback();
            logger.warn(`Transaction not found for callback: ${reference}`);
            return;
        }

        // Prevent duplicate processing
        if (transaction.status !== TRANSACTION_STATUS.PENDING) {
            await dbTransaction.rollback();
            logger.info(`Transaction already processed: ${reference}`);
            return;
        }

        if (status === 'SUCCESS' || status === 'SUCCESSFUL') {
            await handleSuccessfulPayment(transaction, dbTransaction, payload);
        } else {
            await handleFailedPayment(transaction, dbTransaction, payload);
        }

    } catch (error) {
        await dbTransaction.rollback();
        logger.error('Payment callback error:', error);
    }
};

// ================================
// Handle Successful Payment
// ================================
const handleSuccessfulPayment = async (transaction, dbTransaction, payload) => {
    try {
        const fareAmount = parseFloat(transaction.fareAmount);
        const paid = parseFloat(transaction.amount);
        const balanceReturn = parseFloat(transaction.balanceReturned);

        // 1. Update wallet balance (+balance, +stats)
        const wallet = transaction.wallet;
        const newBalance = parseFloat(wallet.balance) + balanceReturn;

        await wallet.update({
            balance: newBalance,
            totalSpent: parseFloat(wallet.totalSpent) + fareAmount,
            todayTrips: wallet.todayTrips + 1,
            todayFare: parseFloat(wallet.todayFare) + fareAmount,
        }, { transaction: dbTransaction });

        // 2. Update transaction status
        await transaction.update({
            status: TRANSACTION_STATUS.SUCCESS,
            moolreStatus: payload.status,
            balanceAfter: newBalance,
            processedAt: new Date(),
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        // 3. Get passenger & conductor details
        const [passenger, conductor] = await Promise.all([
            User.findByPk(transaction.senderId),
            User.findByPk(transaction.receiverId),
        ]);

        // 4. Send balance back via MoolRe Transfers API
        if (balanceReturn > 0) {
            const balanceRef = generateRef('BAL');
            try {
                await moolreService.sendBalance({
                    amount: balanceReturn,
                    phone: passenger.phone,
                    network: passenger.network,
                    reference: balanceRef,
                    reason: `Bus fare balance return - ${transaction.reference}`,
                    sourceAccountId: conductor?.moolreWalletId,
                });

                logger.info(`Balance returned: GHS ${balanceReturn} to ${passenger.phone}`);
            } catch (transferError) {
                logger.error('Balance transfer failed:', transferError);
                // Credit wallet internally if MoMo transfer fails
                await wallet.update({
                    pendingBalance: parseFloat(wallet.pendingBalance) + balanceReturn
                });
            }
        }

        // 5. Notify Passenger via SMS
        await moolreService.sendSMS({
            to: passenger.phone,
            message: SMS_TEMPLATES.FARE_SUCCESS(
                fareAmount.toFixed(2),
                balanceReturn.toFixed(2),
                transaction.reference
            ),
        });

        // 6. Notify Conductor via SMS
        if (conductor) {
            await moolreService.sendSMS({
                to: conductor.phone,
                message: SMS_TEMPLATES.CONDUCTOR_FARE(
                    fareAmount.toFixed(2),
                    passenger.fullName,
                    transaction.bus?.busNumber
                ),
            });
        }

        // 7. Emit real-time update via Socket.io
        const io = global.io;
        if (io) {
            io.to(`user:${transaction.senderId}`).emit('payment:success', {
                reference: transaction.reference,
                farePaid: fareAmount,
                balanceReturned: balanceReturn,
                newBalance,
                bus: transaction.bus?.busNumber,
                route: transaction.bus?.route?.name,
            });
        }

        logger.info(`Payment SUCCESS processed: ${transaction.reference}`);

    } catch (error) {
        logger.error('Handle success payment error:', error);
        throw error;
    }
};

// ================================
// Handle Failed Payment
// ================================
const handleFailedPayment = async (transaction, dbTransaction, payload) => {
    try {
        await transaction.update({
            status: TRANSACTION_STATUS.FAILED,
            moolreStatus: payload.status,
            failureReason: payload.reason || payload.message || 'Payment declined',
            processedAt: new Date(),
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        // Notify passenger
        const passenger = await User.findByPk(transaction.senderId);
        if (passenger) {
            await moolreService.sendSMS({
                to: passenger.phone,
                message: SMS_TEMPLATES.PAYMENT_FAILED(
                    parseFloat(transaction.amount).toFixed(2)
                ),
            });

            // Emit real-time update
            const io = global.io;
            if (io) {
                io.to(`user:${transaction.senderId}`).emit('payment:failed', {
                    reference: transaction.reference,
                    reason: payload.reason || 'Payment declined',
                });
            }
        }

        logger.info(`Payment FAILED processed: ${transaction.reference}`);

    } catch (error) {
        logger.error('Handle failed payment error:', error);
        throw error;
    }
};

// ================================
// VERIFY PAYMENT STATUS (Polling)
// GET /api/v1/payments/verify/:reference
// ================================
exports.verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params;

        const transaction = await Transaction.findOne({
            where: { reference, senderId: req.user.userId },
            include: [
                { model: Bus, as: 'bus', include: [{ model: Route, as: 'route' }] },
                { model: Wallet, as: 'wallet', attributes: ['balance'] },
            ],
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found',
            });
        }

        res.status(200).json({
            success: true,
            data: {
                reference: transaction.reference,
                status: transaction.status,
                amount: parseFloat(transaction.amount),
                farePaid: parseFloat(transaction.fareAmount),
                balanceReturned: parseFloat(transaction.balanceReturned),
                newBalance: parseFloat(transaction.wallet?.balance || 0),
                bus: transaction.bus?.busNumber,
                route: transaction.bus?.route?.name,
                processedAt: transaction.processedAt,
            },
        });

    } catch (error) {
        logger.error('Verify payment error:', error);
        res.status(500).json({ success: false, message: 'Verification failed' });
    }
};

// ================================
// GET BUS BY NUMBER
// GET /api/v1/trips/bus/:busNumber
// ================================
exports.getBusByNumber = async (req, res) => {
    try {
        const { busNumber } = req.params;

        const bus = await Bus.findOne({
            where: {
                busNumber: busNumber.toUpperCase(),
                isActive: true,
            },
            include: [
                { model: Route, as: 'route' },
                { model: User, as: 'conductor', attributes: ['fullName', 'phone'] },
            ],
        });

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found. Check the number and try again.',
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: bus.id,
                busNumber: bus.busNumber,
                conductorName: bus.conductor?.fullName,
                route: bus.route?.name,
                origin: bus.route?.origin,
                destination: bus.route?.destination,
                fareAmount: parseFloat(bus.route?.fareAmount || 0),
                isActive: bus.isActive,
            },
        });

    } catch (error) {
        logger.error('Get bus error:', error);
        res.status(500).json({ success: false, message: 'Failed to get bus details' });
    }
};