// backend/src/routes/ussdRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/ussdController');

// No auth for USSD (secured by IP whitelist in production)
router.post('/', controller.handleUSSD);

module.exports = router;