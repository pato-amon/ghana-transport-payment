// backend/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { Server } = require('socket.io');

const db = require('./src/config/database');
const logger = require('./src/config/logger');
const routes = require('./src/routes/index');
const errorHandler = require('./src/middleware/errorHandler');
const socketHandler = require('./src/socket/socketHandler');
const { rateLimiter } = require('./src/middleware/rateLimiter');
// 🔌 IMPORT NEW DB TELEMETRY ENGINE
const { initDbNotificationListener } = require('./src/services/dbLiveStream');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
    }
});

// ================================
// MIDDLEWARE
// ================================
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) }
}));

// Rate limiting
app.use('/api/', rateLimiter);

// Make io accessible in routes
app.set('io', io);

// ================================
// ROUTES
// ================================
app.use(`/api/${process.env.API_VERSION}`, routes);

app.get('/', (req, res) => {
    res.send('Welcome to the TransportGH API Gateway!');
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'TransportGH API',
        version: process.env.API_VERSION,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

// ================================
// SOCKET.IO
// ================================
socketHandler(io);

// ================================
// ERROR HANDLER (must be last)
// ================================
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// ================================
// DATABASE + SERVER START
// ================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test DB connection
        await db.authenticate();
        logger.info('✅ Database connected successfully');

        // 🔥 ARMED POSTGRESQL MUTATION CHANNEL CAPTURING LOGIC
        // Spin this up right after database connectivity is confirmed
        await initDbNotificationListener(io);

        // Sync models (use migrations in production)
        if (process.env.NODE_ENV === 'development') {
            await db.sync({ alter: true });
            logger.info('✅ Database synced');
        }

        server.listen(PORT, () => {
            logger.info(`🚀 TransportGH Server running on port ${PORT}`);
            logger.info(`📡 Environment: ${process.env.NODE_ENV}`);
            logger.info(`🌐 API: http://localhost:${PORT}/api/${process.env.API_VERSION}`);
        });

    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    await db.close();
    server.close(() => process.exit(0));
});

module.exports = { app, io };