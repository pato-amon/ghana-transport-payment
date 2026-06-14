// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access token required',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.userId, {
            attributes: ['id', 'role', 'isActive', 'isVerified'],
        });

        if (!user || !user.isActive || !user.isVerified) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access',
            });
        }

        req.user = { userId: user.id, role: user.role };
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Session expired. Please login again.',
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
};

exports.authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Insufficient permissions.',
        });
    }
    next();
};