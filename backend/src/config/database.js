// backend/src/config/database.js
const { Sequelize } = require('sequelize');
const logger = require('./logger');

let sequelize;

if (process.env.DATABASE_URL) {
    // Production (Render/Railway)
    logger.info('Using DATABASE_URL for PostgreSQL connection');

    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        logging: process.env.NODE_ENV === 'development'
            ? (msg) => logger.debug(msg)
            : false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            timestamps: true,
            underscored: true,
            paranoid: true,
        },
    });
} else {
    // Local Development
    logger.info('Using DB_* variables for PostgreSQL connection');

    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: 'postgres',
            logging: process.env.NODE_ENV === 'development'
                ? (msg) => logger.debug(msg)
                : false,
            dialectOptions: process.env.DB_SSL === 'true'
                ? {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false,
                    },
                }
                : {},
            pool: {
                max: 10,
                min: 0,
                acquire: 30000,
                idle: 10000,
            },
            define: {
                timestamps: true,
                underscored: true,
                paranoid: true,
            },
        }
    );
}

module.exports = sequelize;