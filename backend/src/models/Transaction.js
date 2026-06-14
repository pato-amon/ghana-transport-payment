// backend/src/models/Transaction.js
const {
    TRANSACTION_TYPES,
    TRANSACTION_STATUS
} = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        reference: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        type: {
            type: DataTypes.ENUM(...Object.values(TRANSACTION_TYPES)),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(TRANSACTION_STATUS)),
            allowNull: false,
            defaultValue: TRANSACTION_STATUS.PENDING,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: { min: 0 },
        },
        fareAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        balanceReturned: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
        },
        senderId: { type: DataTypes.UUID, allowNull: true },
        receiverId: { type: DataTypes.UUID, allowNull: true },
        walletId: { type: DataTypes.UUID, allowNull: true },
        busId: { type: DataTypes.UUID, allowNull: true },
        routeId: { type: DataTypes.UUID, allowNull: true },
        tripId: { type: DataTypes.UUID, allowNull: true },

        // MoolRe data
        moolreReference: { type: DataTypes.STRING, allowNull: true },
        moolreStatus: { type: DataTypes.STRING, allowNull: true },
        paymentMethod: { type: DataTypes.STRING, allowNull: true },
        network: { type: DataTypes.STRING, allowNull: true },
        phoneUsed: { type: DataTypes.STRING, allowNull: true },

        // Balance before/after
        balanceBefore: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
        balanceAfter: { type: DataTypes.DECIMAL(10, 2), allowNull: true },

        // Metadata
        description: { type: DataTypes.STRING(255), allowNull: true },
        metadata: { type: DataTypes.JSONB, allowNull: true },
        failureReason: { type: DataTypes.STRING, allowNull: true },
        processedAt: { type: DataTypes.DATE, allowNull: true },
    }, {
        tableName: 'transactions',
        underscored: true, // This automatically maps camelCase model fields to snake_case DB columns (e.g., senderId -> sender_id)
        indexes: [
            { fields: ['reference'] },
            { fields: ['sender_id'] },
            { fields: ['wallet_id'] },
            { fields: ['status'] },
        ],
    });

    Transaction.associate = function (models) {
        // You can establish relationships here later, for example:
        // Transaction.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
    };

    return Transaction;
};