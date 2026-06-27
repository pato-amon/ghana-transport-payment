// backend/src/controllers/authController.js
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Wallet } = require('../models');
const moolreService = require('../services/moolreService');
const logger = require('../config/logger');
const { SMS_TEMPLATES, ROLES } = require('../config/constants');

// ================================
// Helper: Generate OTP
// ================================
const generateOTP = () => moolreService.generateOTP();

// ================================
// Helper: Generate JWT
// ================================
const generateTokens = (userId, role) => {
    const accessToken = jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );
    return { accessToken, refreshToken };
};

// ================================
// REGISTER
// POST /api/v1/auth/register
// ================================
exports.register = async (req, res) => {
    try {
        const { fullName, phone, network, role, pin } = req.body;

        // Check existing user
        const existingUser = await User.findOne({ where: { phone } });
        if (existingUser) {
            if (existingUser.isVerified) {
                return res.status(409).json({
                    success: false,
                    message: 'Phone number already registered. Please login.',
                });
            }
            // Resend OTP if not verified
            const otp = generateOTP();
            await existingUser.update({
                otp,
                otpExpiresAt: new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_MINUTES) * 60000),
            });

            await moolreService.sendOTP({
                to: phone,
                otp,
                expiresMinutes: process.env.OTP_EXPIRES_MINUTES,
            });

            return res.status(200).json({
                success: true,
                message: 'OTP resent to your phone',
                userId: existingUser.id,
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiresAt = new Date(
            Date.now() + parseInt(process.env.OTP_EXPIRES_MINUTES) * 60000
        );

        // Create user
        const user = await User.create({
            fullName,
            phone,
            network,
            role: role || ROLES.PASSENGER,
            pin,
            otp,
            otpExpiresAt,
            isVerified: false,
        });

        // Send OTP via MoolRe SMS
        await moolreService.sendOTP({
            to: phone,
            otp,
            expiresMinutes: process.env.OTP_EXPIRES_MINUTES,
        });

        logger.info(`New user registered: ${phone} [${role}]`);

        res.status(201).json({
            success: true,
            message: `OTP sent to ${phone}. Valid for ${process.env.OTP_EXPIRES_MINUTES} minutes.`,
            userId: user.id,
        });

    } catch (error) {
        logger.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.',
        });
    }
};

// ================================
// VERIFY OTP
// POST /api/v1/auth/verify-otp
// ================================
exports.verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Check OTP
        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP. Check your phone and try again.',
            });
        }

        // Check expiry
        if (new Date() > user.otpExpiresAt) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Request a new one.',
            });
        }

        // Create MoolRe sub-account
        let moolreSubAccountId = null;
        try {
            const subAccount = await moolreService.createSubAccount({
                name: user.fullName,
                phone: user.phone,
                accountType: user.role,
                metadata: {
                    userId: user.id,
                    platform: 'transportgh',
                },
            });
            moolreSubAccountId = subAccount?.id;
        } catch (err) {
            logger.warn(`MoolRe sub-account creation failed for ${user.phone}:`, err.message);
        }

        // Mark verified & clear OTP
        await user.update({
            isVerified: true,
            otp: null,
            otpExpiresAt: null,
            moolreWalletId: moolreSubAccountId,
            lastLoginAt: new Date(),
        });

        // Create wallet
        const wallet = await Wallet.create({
            userId: user.id,
            balance: 0.00,
            pendingBalance: 0.00,
            moolreSubAccountId,
        });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user.id, user.role);

        logger.info(`User verified: ${user.phone} [${user.role}]`);

        // Welcome SMS
        await moolreService.sendSMS({
            to: user.phone,
            message: `Welcome to TransportGH ${user.fullName.split(' ')[0]}! 🚌 Your account is ready. Pay bus fare & get change back automatically. Dial *713# or use the app.`,
        });

        res.status(200).json({
            success: true,
            message: 'Phone verified successfully!',
            token: accessToken,
            refreshToken,
            user: {
                ...user.toSafeObject(),
                walletBalance: wallet.balance,
            },
        });

    } catch (error) {
        logger.error('OTP verify error:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed. Please try again.',
        });
    }
};

// ================================
// LOGIN
// POST /api/v1/auth/login
// ================================
exports.login = async (req, res) => {
    try {
        const { phone, pin } = req.body;

        // Find user with wallet
        const user = await User.findOne({
            where: { phone },
            include: [{
                model: Wallet,
                as: 'wallet',
                attributes: ['balance', 'pendingBalance'],
            }],
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Phone number not registered.',
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your phone number first.',
                userId: user.id,
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account suspended. Contact support.',
            });
        }

        // Verify PIN
        const isPinCorrect = await user.comparePin(pin);
        if (!isPinCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect PIN. Try again.',
            });
        }

        // Update last login
        await user.update({ lastLoginAt: new Date() });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user.id, user.role);

        logger.info(`User logged in: ${user.phone} [${user.role}]`);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: accessToken,
            refreshToken,
            user: {
                ...user.toSafeObject(),
                walletBalance: parseFloat(user.wallet?.balance || 0),
                pendingBalance: parseFloat(user.wallet?.pendingBalance || 0),
            },
        });

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.',
        });
    }
};

// ================================
// RESEND OTP
// POST /api/v1/auth/resend-otp
// ================================
exports.resendOTP = async (req, res) => {
    try {
        const { userId, phone } = req.body;

        const user = await User.findOne({
            where: { [Op.or]: [{ id: userId }, { phone }] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const otp = generateOTP();
        await user.update({
            otp,
            otpExpiresAt: new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_MINUTES) * 60000),
        });

        await moolreService.sendOTP({
            to: user.phone,
            otp,
            expiresMinutes: process.env.OTP_EXPIRES_MINUTES,
        });

        res.status(200).json({
            success: true,
            message: 'New OTP sent to your phone',
        });

    } catch (error) {
        logger.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend OTP',
        });
    }
};

// ================================
// GET PROFILE
// GET /api/v1/auth/me
// ================================
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId, {
            include: [{ model: Wallet, as: 'wallet' }],
        });

        res.status(200).json({
            success: true,
            user: {
                ...user.toSafeObject(),
                walletBalance: parseFloat(user.wallet?.balance || 0),
                pendingBalance: parseFloat(user.wallet?.pendingBalance || 0),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get profile' });
    }
};