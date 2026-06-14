// backend/src/config/database.js
const { Sequelize } = require('sequelize');
const logger = require('./logger');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: (msg) => {
            if (process.env.NODE_ENV === 'development') {
                logger.debug(msg);
            }
        },
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000,
        },
        dialectOptions: {
            ssl: process.env.DB_SSL === 'true' ? {
                require: true,
                rejectUnauthorized: false,
            } : false,
        },
        define: {
            timestamps: true,
            underscored: true,
            paranoid: true, // soft deletes
        }
    }
);

module.exports = sequelize;