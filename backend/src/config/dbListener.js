// backend/src/config/dbListener.js
const { Client } = require('pg');
const logger = require('./logger'); // Assumes your winston/morgan logger path

/**
 * Initializes the persistent PostgreSQL LISTEN stream
 * @param {Object} io - The initialized Socket.io server instance
 */
const initDbListener = async (io) => {
    // ✅ FIX 3: Safe, production-fallback configuration string check
    const pgClient = process.env.DATABASE_URL
        ? new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        })
        : new Client({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 5432,
        });

    try {
        await pgClient.connect();
        logger.info('🐘 PostgreSQL structural listener connected successfully.');

        // ✅ FIX 1: Align connection strings to catch the explicit trigger channel
        await pgClient.query('LISTEN db_mutation');

        // ✅ FIX 2: Generic payload processing parser block
        pgClient.on('notification', (msg) => {
            try {
                const payload = JSON.parse(msg.payload);

                logger.info(`🎵 DB Notification Intercepted: [${payload.action}] on table: ${payload.table}`);

                // Broadcast instantly to your administrative room
                io.to('admin-room').emit('db_mutation', payload);

                // Optional target table segregation routines
                if (payload.table === 'transactions' || payload.table === 'Tickets') {
                    io.emit('transaction_update', payload);
                }
            } catch (err) {
                logger.error('❌ Failed parsing pg_notify payload string safely:', err);
            }
        });

        // Handle structural dropped connections gracefully
        pgClient.on('error', async (err) => {
            logger.error('🚨 PG Listener connection dropped. Reconnecting...', err);
            await pgClient.end();
            setTimeout(() => initDbListener(io), 5000); // Retry loop after 5 seconds
        });

    } catch (error) {
        logger.error('❌ Failed to establish standalone PG listener service client:', error);
    }
};

module.exports = { initDbListener };