// backend/src/models/Wallet.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wallet = sequelize.define('Wallet', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: { min: 0 },
    },
    pendingBalance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    totalEarned: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
    },
    totalSpent: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
    },
    todayTrips: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    todayFare: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
    },
    totalSaved: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
    },
    isLocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    moolreSubAccountId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'wallets',
});

module.exports = Wallet;