// backend/src/controllers/walletController.js
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Wallet, Transaction, User } = require('../models');
const moolreService = require('../services/moolreService');
const logger = require('../config/logger');
const {
    TRANSACTION_TYPES,
    TRANSACTION_STATUS,
    SMS_TEMPLATES,
} = require('../config/constants');

// ================================
// GET WALLET
// GET /api/v1/wallet
// ================================
exports.getWallet = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({
            where: { userId: req.user.userId },
        });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found',
            });
        }

        // Today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayStats = await Transaction.findOne({
            where: {
                senderId: req.user.userId,
                status: TRANSACTION_STATUS.SUCCESS,
                type: TRANSACTION_TYPES.FARE_PAYMENT,
                createdAt: { [Op.gte]: today },
            },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('fare_amount')), 'total'],
            ],
            raw: true,
        });

        res.status(200).json({
            success: true,
            data: {
                balance: parseFloat(wallet.balance),
                pendingBalance: parseFloat(wallet.pendingBalance),
                totalSpent: parseFloat(wallet.totalSpent),
                totalSaved: parseFloat(wallet.totalSaved),
                todayTrips: parseInt(todayStats?.count || 0),
                todayFare: parseFloat(todayStats?.total || 0),
            },
        });

    } catch (error) {
        logger.error('Get wallet error:', error);
        res.status(500).json({ success: false, message: 'Failed to get wallet' });
    }
};

// ================================
// GET TRANSACTIONS
// GET /api/v1/wallet/transactions
// ================================
exports.getTransactions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            type,
            status,
            startDate,
            endDate,
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const where = {
            [Op.or]: [
                { senderId: req.user.userId },
                { receiverId: req.user.userId },
            ],
        };

        if (type) where.type = type;
        if (status) where.status = status;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt[Op.gte] = new Date(startDate);
            if (endDate) where.createdAt[Op.lte] = new Date(endDate);
        }

        const { count, rows } = await Transaction.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['fullName', 'phone'],
                },
            ],
        });

        res.status(200).json({
            success: true,
            data: rows.map(tx => ({
                id: tx.id,
                reference: tx.reference,
                type: tx.type,
                status: tx.status,
                amount: parseFloat(tx.amount),
                fareAmount: parseFloat(tx.fareAmount || 0),
                balanceReturned: parseFloat(tx.balanceReturned || 0),
                description: tx.description,
                paymentMethod: tx.paymentMethod,
                network: tx.network,
                processedAt: tx.processedAt,
                createdAt: tx.createdAt,
                isCredit: tx.receiverId === req.user.userId,
            })),
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit)),
            },
        });

    } catch (error) {
        logger.error('Get transactions error:', error);
        res.status(500).json({ success: false, message: 'Failed to get transactions' });
    }
};

// ================================
// CLAIM PENDING BALANCE
// POST /api/v1/wallet/claim
// ================================
exports.claimBalance = async (req, res) => {
    const dbTransaction = await sequelize.transaction();

    try {
        const userId = req.user.userId;

        const [wallet, user] = await Promise.all([
            Wallet.findOne({
                where: { userId },
                lock: true,
                transaction: dbTransaction,
            }),
            User.findByPk(userId),
        ]);

        if (!wallet || parseFloat(wallet.pendingBalance) <= 0) {
            await dbTransaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'No pending balance to claim',
            });
        }

        const pendingAmount = parseFloat(wallet.pendingBalance);
        const newBalance = parseFloat(wallet.balance) + pendingAmount;
        const claimRef = `CLAIM-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        // Transfer to MoMo
        try {
            await moolreService.sendBalance({
                amount: pendingAmount,
                phone: user.phone,
                network: user.network,
                reference: claimRef,
                reason: 'Pending balance withdrawal',
            });
        } catch (transferError) {
            logger.error('Claim transfer failed:', transferError);
            await dbTransaction.rollback();
            return res.status(500).json({
                success: false,
                message: 'Transfer failed. Try again.',
            });
        }

        // Update wallet
        await wallet.update({
            pendingBalance: 0,
            balance: newBalance,
        }, { transaction: dbTransaction });

        // Record transaction
        await Transaction.create({
            reference: claimRef,
            type: TRANSACTION_TYPES.BALANCE_RETURN,
            status: TRANSACTION_STATUS.SUCCESS,
            amount: pendingAmount,
            senderId: userId,
            walletId: wallet.id,
            description: 'Pending balance claimed',
            balanceBefore: parseFloat(wallet.balance),
            balanceAfter: newBalance,
            processedAt: new Date(),
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        // Notify
        await moolreService.sendSMS({
            to: user.phone,
            message: SMS_TEMPLATES.BALANCE_RETURNED(
                pendingAmount.toFixed(2),
                newBalance.toFixed(2),
                claimRef
            ),
        });

        res.status(200).json({
            success: true,
            message: `GHS ${pendingAmount.toFixed(2)} sent to your ${user.network} MoMo`,
            data: {
                amountClaimed: pendingAmount,
                newBalance,
                reference: claimRef,
            },
        });

    } catch (error) {
        await dbTransaction.rollback();
        logger.error('Claim balance error:', error);
        res.status(500).json({ success: false, message: 'Failed to claim balance' });
    }
};