// backend/src/jobs/scheduledJobs.js
const cron = require('node-cron');
const { Op } = require('sequelize');
const { User, Wallet, Transaction } = require('../models');
const moolreService = require('../services/moolreService');
const logger = require('../config/logger');
const { SMS_TEMPLATES, TRANSACTION_STATUS } = require('../config/constants');

// ================================
// Reset Daily Stats — Midnight
// ================================
cron.schedule('0 0 * * *', async () => {
    try {
        await Wallet.update(
            { todayTrips: 0, todayFare: 0.00 },
            { where: {} }
        );
        logger.info('✅ Daily wallet stats reset');
    } catch (error) {
        logger.error('Daily reset error:', error);
    }
});

// ================================
// Remind Unclaimed Balance — Every 6hrs
// ================================
cron.schedule('0 */6 * * *', async () => {
    try {
        const wallets = await Wallet.findAll({
            where: { pendingBalance: { [Op.gt]: 0 } },
            include: [{ model: User, as: 'user' }],
        });

        for (const wallet of wallets) {
            if (wallet.user?.phone) {
                await moolreService.sendSMS({
                    to: wallet.user.phone,
                    message: SMS_TEMPLATES.BALANCE_REMINDER(
                        parseFloat(wallet.pendingBalance).toFixed(2)
                    ),
                });
            }
        }

        logger.info(`✅ Balance reminders sent to ${wallets.length} users`);
    } catch (error) {
        logger.error('Balance reminder error:', error);
    }
});

// ================================
// Timeout Stale Pending Payments — Every 5 mins
// ================================
cron.schedule('*/5 * * * *', async () => {
    try {
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        const stale = await Transaction.update(
            {
                status: TRANSACTION_STATUS.FAILED,
                failureReason: 'Payment timeout — no response from MoMo',
            },
            {
                where: {
                    status: TRANSACTION_STATUS.PENDING,
                    createdAt: { [Op.lt]: thirtyMinsAgo },
                },
            }
        );
        if (stale[0] > 0) {
            logger.info(`✅ Timed out ${stale[0]} stale pending transactions`);
        }
    } catch (error) {
        logger.error('Timeout job error:', error);
    }
});

logger.info('✅ Scheduled jobs initialized');