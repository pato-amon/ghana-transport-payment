// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { body } = require('express-validator');

const registerRules = [
    body('fullName').trim().isLength({ min: 2 }).withMessage('Enter full name'),
    body('phone').matches(/^0[2345][0-9]{8}$/).withMessage('Enter valid Ghana number'),
    body('network').isIn(['MTN', 'VODAFONE', 'AIRTELTIGO']).withMessage('Select network'),
    body('role').isIn(['passenger', 'conductor', 'operator']).withMessage('Select role'),
    body('pin').isLength({ min: 4, max: 4 }).isNumeric().withMessage('PIN must be 4 digits'),
];

const loginRules = [
    body('phone').matches(/^0[2345][0-9]{8}$/).withMessage('Enter valid phone'),
    body('pin').isLength({ min: 4, max: 4 }).isNumeric().withMessage('Enter 4-digit PIN'),
];

router.post('/register', validate(registerRules), controller.register);
router.post('/login', validate(loginRules), controller.login);
router.post('/verify-otp', controller.verifyOTP);
router.post('/resend-otp', controller.resendOTP);
router.get('/me', authenticate, controller.getProfile);

module.exports = router;