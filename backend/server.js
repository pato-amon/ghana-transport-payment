// backend/server.js
require('dotenv').config();

app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));

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
const { initDbNotificationListener } = require('./src/services/dbLiveStream');

const app = express();

// Required when running behind Render/Railway reverse proxy
app.set('trust proxy', 1);

const server = http.createServer(app);

// =======================================
// SOCKET.IO SETUP
// =======================================
const io = new Server(server, {
    cors: {
        origin: [
            process.env.FRONTEND_URL,
            'http://localhost:3000',
            'http://localhost:5173',
            'https://transport-gh.vercel.app'
        ],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// =======================================
// SECURITY + PERFORMANCE MIDDLEWARE
// =======================================
app.use(helmet());
app.use(compression());

// =======================================
// GLOBAL CORS CONFIGURATION
// =======================================
app.use(
    cors({
        origin: [
            process.env.FRONTEND_URL,
            'http://localhost:3000',
            'http://localhost:5173',
            'https://transport-gh.vercel.app'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
    })
);

// =======================================
// BODY PARSERS
// =======================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =======================================
// HTTP REQUEST LOGGING
// =======================================
app.use(
    morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim())
        }
    })
);

// =======================================
// RATE LIMITER
// =======================================
app.use('/api/', rateLimiter);

// Make Socket.IO available globally across components
app.set('io', io);

// =======================================
// ROUTES DECLARATION
// =======================================
const paymentRoutes = require('./src/routes/paymentRoutes');
app.use(`/api/${process.env.API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${process.env.API_VERSION}`, routes);

// =======================================
// ROOT ROUTE
// =======================================
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the TransportGH API Gateway',
        version: process.env.API_VERSION,
        environment: process.env.NODE_ENV
    });
});

// =======================================
// HEALTH CHECK
// =======================================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'TransportGH API',
        version: process.env.API_VERSION,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// =======================================
// SOCKET HANDLERS BINDING
// =======================================
socketHandler(io);

// =======================================
// ERROR PROFILING MIDDLEWARES
// =======================================
app.use(errorHandler);

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// =======================================
// APPLICATION ENGINE BOOTSTRAPPER
// =======================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await db.authenticate();
        logger.info('✅ Database connected successfully');

        // Initialize real-time PostgreSQL listeners
        await initDbNotificationListener(io);

        if (process.env.NODE_ENV === 'development') {
            await db.sync({ alter: true });
            logger.info('✅ Database synced schema updates cleanly');
        }

        server.listen(PORT, () => {
            logger.info('===================================');
            logger.info('🚀 TransportGH Server Started');
            logger.info(`📡 Environment: ${process.env.NODE_ENV}`);
            logger.info(`🌐 Port: ${PORT}`);
            logger.info(`🔗 API Base: /api/${process.env.API_VERSION}`);
            logger.info('===================================');
        });
    } catch (error) {
        logger.error('❌ Failed to start server');
        logger.error(error);
        process.exit(1);
    }
};

startServer();

// =======================================
// GRACEFUL RECOVERY SHUTDOWNS
// =======================================
const handleGracefulShutdown = async (signal) => {
    logger.info(`${signal} received. Closing connections...`);
    try {
        await db.close();
        server.close(() => {
            logger.info('✅ Server shut down gracefully');
            process.exit(0);
        });
    } catch (error) {
        logger.error('Shutdown error:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

module.exports = { app, io };