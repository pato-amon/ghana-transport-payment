// backend/src/socket/socketHandler.js
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

module.exports = (io) => {
    // Store io globally for usage across decoupled transactional backend controllers
    global.io = io;

    // =======================================
    // SECURE AUTHENTICATION MIDDLEWARE
    // =======================================
    io.use((socket, next) => {
        // Safe access check using optional chaining to prevent crash states
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded?.userId) {
                return next(new Error('Invalid token payload'));
            }
            socket.userId = decoded.userId;
            socket.role = decoded.role || 'user';
            next();
        } catch (err) {
            logger.warn(`⚠️ WebSocket connection rejected. Bad Token Hash. ID: ${socket.id}`);
            next(new Error('Invalid token'));
        }
    });

    // =======================================
    // STATEFUL NETWORK TRAFFIC LINKS
    // =======================================
    io.on('connection', (socket) => {
        logger.info(`🔌 Socket verified & connected: User ${socket.userId} [Role: ${socket.role}] | SocketID: ${socket.id}`);

        // Automatically drop client into their unique isolated private notification room
        socket.join(`user:${socket.userId}`);

        // 🛡️ Admin Panel Channel Subscription Handler
        // Matches up with the `dbLiveStream.js` listener payload target 'admin-room'
        socket.on('join-admin-panel', () => {
            socket.join('admin-room');
            logger.info(`🛡️ Administrative socket client [${socket.id}] joined secure channel: [admin-room]`);
        });

        // 🚌 Conductor Transport Infrastructure Matching
        socket.on('join:bus', (busId) => {
            socket.join(`bus:${busId}`);
            logger.info(`🚍 Conductor ${socket.userId} successfully bound to real-time bus channel: ${busId}`);
        });

        // 🏢 Transit Operator Channel Subscriptions
        socket.on('join:operator', (operatorId) => {
            socket.join(`operator:${operatorId}`);
            logger.info(`🏢 Corporate Operator ${socket.userId} scaled into agency feed: ${operatorId}`);
        });

        // =======================================
        // CONNECTION CLEANING LIFECYCLES
        // =======================================
        socket.on('disconnect', (reason) => {
            logger.info(`❌ Socket client link disconnected: User ${socket.userId} | Reason: ${reason}`);
        });
        socket.on('reconnect_attempt', () => {
            logger.warn(`🔄 Reconnect attempt: User ${socket.userId}`);
        });
    });
};