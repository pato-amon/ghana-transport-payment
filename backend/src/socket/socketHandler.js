// backend/src/socket/socketHandler.js
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

module.exports = (io) => {
    // Store io globally for use in controllers
    global.io = io;

    // Auth middleware for socket
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication required'));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            socket.role = decoded.role;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`🔌 Socket client connected: ${socket.id}`);

        // Catch the admin-dashboard request to hop into the administrative feed
        socket.on('join-admin-panel', () => {
            socket.join('admin-room');
            logger.info(`🛡️ Client ${socket.id} joined secure channel: [admin-room]`);
        });

        socket.on('disconnect', () => {
            logger.info(`❌ Socket client disconnected: ${socket.id}`);
        });
    });

    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.userId} [${socket.role}]`);

        // Join personal room
        socket.join(`user:${socket.userId}`);

        // Conductor joins bus room
        socket.on('join:bus', (busId) => {
            socket.join(`bus:${busId}`);
            logger.info(`Conductor ${socket.userId} joined bus room: ${busId}`);
        });

        // Operator joins operator room
        socket.on('join:operator', (operatorId) => {
            socket.join(`operator:${operatorId}`);
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.userId}`);
        });
    });
};