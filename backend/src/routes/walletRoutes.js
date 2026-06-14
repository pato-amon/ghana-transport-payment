// backend/src/routes/walletRoutes.js
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
// const { protect } = require('../middleware/authMiddleware'); // Uncomment when auth middleware is ready

// router.use(protect); // Secure these endpoints

router.get('/', walletController.getWallet);
router.get('/transactions', walletController.getTransactions);
router.post('/claim', walletController.claimBalance);

module.exports = router;