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

    const sequelize = new Sequelize(
        process.env.DATABASE_URL,
        {
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
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                }
            },
            define: {
                timestamps: true,
                underscored: true,
                paranoid: true,
            }
        }
    );
}

module.exports = sequelize;