// backend/src/routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const walletRoutes = require('./walletRoutes');
const ussdRoutes = require('./ussdRoutes');
const conductorRoutes = require('./conductorRoutes');
const operatorRoutes = require('./operatorRoutes');
const adminRoutes = require('./admin.routes');

// Mounting Sub-Routers
router.use('/auth', authRoutes);
router.use('/wallet', walletRoutes);
router.use('/ussd', ussdRoutes);
router.use('/conductor', conductorRoutes);
router.use('/operator', operatorRoutes);
router.use('/admin', adminRoutes);

module.exports = router;