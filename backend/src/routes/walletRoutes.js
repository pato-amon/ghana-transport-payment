// backend/src/routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/walletController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, controller.getWallet);
router.get('/transactions', authenticate, controller.getTransactions);
router.post('/claim', authenticate, controller.claimBalance);

module.exports = router;