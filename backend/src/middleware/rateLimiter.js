// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

exports.rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // strict for auth
    message: {
        success: false,
        message: 'Too many login attempts. Try again in 15 minutes.',
    },
});

exports.paymentLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5, // 5 payment attempts per minute
    message: {
        success: false,
        message: 'Too many payment attempts. Please wait.',
    },
});