// backend/src/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const paymentRoutes = require('./paymentRoutes');
const walletRoutes = require('./walletRoutes');
const conductorRoutes = require('./conductorRoutes');
const operatorRoutes = require('./operatorRoutes');
const ussdRoutes = require('./ussdRoutes');

router.use('/auth', authRoutes);
router.use('/payments', paymentRoutes);
router.use('/wallet', walletRoutes);
router.use('/conductor', conductorRoutes);
router.use('/operator', operatorRoutes);
router.use('/ussd', ussdRoutes);
router.use('/trips', paymentRoutes); // shared

module.exports = router;