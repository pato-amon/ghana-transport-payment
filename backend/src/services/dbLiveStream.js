// backend/src/services/dbLiveStream.js
const { Client } = require('pg');
const logger = require('../config/logger'); // Match your logger path

const initDbNotificationListener = async (io) => {
    // Falls back to individual vars if you aren't using a single connection string
    const clientConfig = process.env.DATABASE_URL || {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
    };

    const pgClient = new Client(clientConfig);

    try {
        await pgClient.connect();
        logger.info('📡 Connected persistent client to PostgreSQL cluster for live telemetry');

        // 1. Tell Postgres to pipe notification triggers to our Node instance
        await pgClient.query('LISTEN user_directory_mutation');
        logger.info('⚡ Active LISTEN initialized on channel: user_directory_mutation');

        // 2. Capture DB events and fire them directly into Socket.io admin rooms
        pgClient.on('notification', (msg) => {
            try {
                const payload = JSON.parse(msg.payload);
                logger.info(`🎵 DB Mutate Event: [${payload.operation}] detected on User ID: ${payload.user_id}`);

                // Broadcast raw payload straight down the wire to your Admin UI hook
                io.to('admin-room').emit('db_mutation', payload);
            } catch (parseErr) {
                logger.error('❌ Failed parsing pg_notify JSON payload string:', parseErr);
            }
        });

        // Error handler for the background client connection dropping unexpectedly
        pgClient.on('error', (err) => {
            logger.error('🚨 Persistent PostgreSQL notification client error:', err);
        });

    } catch (err) {
        logger.error('❌ Failed to establish live database listener pipeline:', err);
    }
};

module.exports = { initDbNotificationListener };