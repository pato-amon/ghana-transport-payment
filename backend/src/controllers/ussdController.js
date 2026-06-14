// backend/src/controllers/ussdController.js
const logger = require('../config/logger');

exports.handleUssd = async (req, res) => {
    try {
        // Basic Aruka / Telco USSD interface placeholder
        const { sessionId, phoneNumber, text } = req.body;

        let response = "";
        if (!text) {
            response = `CON Welcome to TransportGH Payment\n1. Check Balance\n2. Pay Fare`;
        } else if (text === "1") {
            response = `END Your active wallet balance is processing.`;
        } else {
            response = `END Invalid selection.`;
        }

        res.set('Content-Type', 'text/plain');
        res.status(200).send(response);
    } catch (error) {
        logger.error('USSD Callback runtime error:', error);
        res.status(500).send('END System error. Please try again later.');
    }
};