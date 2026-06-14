// backend/src/models/Route.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Route = sequelize.define('Route', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    origin: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    destination: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    fareAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0.50 },
    },
    distanceKm: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
    },
    estimatedMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    operatorId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    tableName: 'routes',
});

module.exports = Route;