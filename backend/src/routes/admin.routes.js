// backend/src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const isAdmin = require('../middleware/isAdmin');
// const protect = require('../middleware/auth'); // Swap this in for your real token auth middleware

// 1. Fetch live system metrics (Overview)
router.get('/metrics', [/* protect, */ isAdmin], async (req, res, next) => {
    try {
        // Query database configurations dynamically using Sequelize
        const totalUsers = await db.models.User?.count() || 0;

        // Fetch running application resource tracking
        const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // Convert to MB

        // Pull down Socket.io instance from our express app instance configurations
        const io = req.app.get('io');
        const activeSockets = io ? io.engine.clientsCount : 0;

        res.json({
            success: true,
            data: {
                totalUsers,
                activeSockets,
                memoryUsage: `${memoryUsage.toFixed(2)} MB`,
                databaseStatus: 'CONNECTED',
                uptime: `${process.uptime().toFixed(0)}s`
            }
        });
    } catch (error) {
        next(error);
    }
});

// 2. Fetch list of users for administration management
router.get('/users', [/* protect, */ isAdmin], async (req, res, next) => {
    try {
        const users = await db.models.User?.findAll({
            attributes: ['id', 'fullName', 'phone', 'network', 'role', 'isActive', 'isVerified', 'createdAt']
        }) || [];

        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
});

// 3. Toggle a user's active account state (Ban/Unban)
router.patch('/users/:id/toggle-status', [/* protect, */ isAdmin], async (req, res, next) => {
    try {
        const user = await db.models.User?.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({ success: true, message: `User account status updated`, data: user });
    } catch (error) {
        next(error);
    }
});

module.exports = router;