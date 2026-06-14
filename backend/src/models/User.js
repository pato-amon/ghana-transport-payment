// backend/src/models/User.js
const bcrypt = require('bcryptjs');
const { ROLES, NETWORKS } = require('../config/constants');

// Change: Wrap the definition in a function that receives (sequelize, DataTypes)
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        fullName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: { len: [2, 100] }
        },
        phone: {
            type: DataTypes.STRING(15),
            allowNull: false,
            unique: true,
            validate: {
                is: /^0[2345][0-9]{8}$/
            }
        },
        network: {
            type: DataTypes.ENUM(...Object.values(NETWORKS)),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM(...Object.values(ROLES)),
            allowNull: false,
            defaultValue: ROLES.PASSENGER,
        },
        pin: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        otp: { type: DataTypes.STRING(6), allowNull: true },
        otpExpiresAt: { type: DataTypes.DATE, allowNull: true },
        lastLoginAt: { type: DataTypes.DATE, allowNull: true },
        deviceToken: { type: DataTypes.STRING, allowNull: true },
        profileImage: { type: DataTypes.STRING, allowNull: true },
        moolreWalletId: { type: DataTypes.STRING, allowNull: true },
    }, {
        tableName: 'users',
        hooks: {
            beforeCreate: async (user) => {
                if (user.pin) {
                    user.pin = await bcrypt.hash(user.pin, 12);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('pin')) {
                    user.pin = await bcrypt.hash(user.pin, 12);
                }
            },
        }
    });

    // Instance methods
    User.prototype.comparePin = async function (pin) {
        return bcrypt.compare(pin, this.pin);
    };

    User.prototype.toSafeObject = function () {
        const { pin, otp, otpExpiresAt, ...safe } = this.toJSON();
        return safe;
    };

    return User; // Change: Return the model instance
};