// backend/src/utils/db.js
import { pool } from '../config/db.js';

export const monitorQuery = async (text, params) => {
    const start = performance.now();
    try {
        const res = await pool.query(text, params);
        const duration = performance.now() - start;

        console.log(`⏱️ Query executed in ${duration.toFixed(2)}ms | Command: ${text.split(' ')[0]}`);

        if (duration > 80) {
            console.warn(`🚨 SLOW QUERY WARNING: "${text}" took ${duration.toFixed(2)}ms. Add an index?`);
        }

        return res;
    } catch (error) {
        throw error;
    }
};