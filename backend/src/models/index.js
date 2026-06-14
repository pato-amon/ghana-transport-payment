// backend/src/models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Direct connection instance

// Import factory functions
const UserModel = require('./User');
const WalletModel = require('./Wallet');
const BusModel = require('./Bus');
const RouteModel = require('./Route');
const TransactionModel = require('./Transaction');

// Initialize models by executing their factories
const User = UserModel(sequelize, DataTypes);
const Wallet = WalletModel(sequelize, DataTypes);
const Bus = BusModel(sequelize, DataTypes);
const Route = RouteModel(sequelize, DataTypes);
const Transaction = TransactionModel(sequelize, DataTypes);

// ================================
// ASSOCIATIONS
// ================================

// User <-> Wallet (1:1)
User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User (Operator) <-> Bus (1:Many)
User.hasMany(Bus, { foreignKey: 'operatorId', as: 'buses' });
Bus.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });

// User (Conductor) <-> Bus (1:Many)
User.hasMany(Bus, { foreignKey: 'conductorId', as: 'assignedBuses' });
Bus.belongsTo(User, { foreignKey: 'conductorId', as: 'conductor' });

// Route <-> Bus (1:Many)
Route.hasMany(Bus, { foreignKey: 'routeId', as: 'buses' });
Bus.belongsTo(Route, { foreignKey: 'routeId', as: 'route' });

// User (Operator) <-> Route (1:Many)
User.hasMany(Route, { foreignKey: 'operatorId', as: 'routes' });
Route.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });

// User <-> Transactions (1:Many)
User.hasMany(Transaction, { foreignKey: 'senderId', as: 'sentTransactions' });
User.hasMany(Transaction, { foreignKey: 'receiverId', as: 'receivedTransactions' });

// Wallet <-> Transactions
Wallet.hasMany(Transaction, { foreignKey: 'walletId', as: 'transactions' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' });

// Bus <-> Transactions
Bus.hasMany(Transaction, { foreignKey: 'busId', as: 'transactions' });
Transaction.belongsTo(Bus, { foreignKey: 'busId', as: 'bus' });

module.exports = {
    sequelize,
    Sequelize,
    User,
    Wallet,
    Bus,
    Route,
    Transaction,
};