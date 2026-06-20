// backend/src/config/db.js
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20 // Maximum clients in the pool
});

// Explicit event logging
pool.on('connect', () => {
    console.log('✨ New database client allocated in the pool.');
});

pool.on('acquire', (client) => {
    // Fires every time a route takes a connection to run a query
    // Useful for tracking active usage spikes
    console.log('🔑 Client checked out from pool');
});

pool.on('error', (err) => {
    console.error('🚨 Idle database client encountered unexpected exception:', err);
});

