const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const controller = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const fareRules = [
    body('busId').isUUID().withMessage('Invalid bus ID'),
    body('amountPaid')
        .isFloat({ min: 0.5 })
        .withMessage('Invalid amount'),
    body('phone')
        .matches(/^0[2345][0-9]{8}$/)
        .withMessage('Invalid phone'),
    body('network')
        .isIn(['MTN', 'VODAFONE', 'AIRTELTIGO'])
        .withMessage('Invalid network'),
];

// Passenger payment
router.post(
    '/fare',
    authenticate,
    validate(fareRules),
    controller.initiateFarePayment
);

// Verify payment
router.get(
    '/verify/:reference',
    authenticate,
    controller.verifyPayment
);

// Lookup bus
router.get(
    '/bus/:busNumber',
    authenticate,
    controller.getBusByNumber
);

// MoolRe webhook (NO authentication)
router.post(
    '/callback',
    controller.paymentCallback
);

module.exports = router;