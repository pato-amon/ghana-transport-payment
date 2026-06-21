// backend/src/controllers/ticketController.js
const db = require('../config/database');
const logger = require('../config/logger');
// 🔌 Utilize the exported object instance directly
const moolreService = require('../services/moolreService');
const { v4: uuidv4 } = require('uuid'); // Assumes standard uuid package is available

const processTicketCheckout = async (req, res, next) => {
    try {
        const { routeId, totalPrice, customerPhone, networkSelection, customerEmail } = req.body;

        // Generate a distinct payment tracking reference string
        const uniqueReference = `TGH-${uuidv4().substring(0, 8).toUpperCase()}`;

        // 1. Log entry row to tracking state as PENDING
        const pendingTicket = await db.models.Ticket.create({
            referenceId: uniqueReference,
            routeId,
            totalPrice,
            customerPhone,
            customerEmail,
            status: 'PENDING'
        });

        logger.info(`🎟️ Pending Ticket ${uniqueReference} logged. Prompting customer MoMo terminal...`);

        // 2. Execute direct MoMo Debit Prompt Collection using your exact class method layout
        const moolreResponse = await moolreService.collectPayment({
            amount: parseFloat(totalPrice),
            phone: customerPhone,
            network: networkSelection, // e.g. 'mtn'
            reference: uniqueReference,
            description: `TransportGH Bus Ticket Booking Fare Payment`,
            customerId: customerEmail || customerPhone,
            callbackUrl: process.env.MOOLRE_CALLBACK_URL
        });

        // 3. Return status validation parameters directly back to frontend layout
        return res.status(201).json({
            success: true,
            message: 'Mobile Money prompt request pushed to carrier gateway successfully.',
            reference: uniqueReference,
            serviceDetails: moolreResponse
        });

    } catch (error) {
        logger.error('❌ Direct checkout initialization sequence collapsed:', error);
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || 'Payment initiation failure'
        });
    }
};

module.exports = { processTicketCheckout };