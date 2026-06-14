// backend/src/routes/ussdRoutes.js
const express = require('express');
const router = express.Router();
const ussdController = require('../controllers/ussdController');

// This handles the post route callback coming from the USSD gateway aggregator
router.post('/callback', ussdController.handleUssd);

module.exports = router;