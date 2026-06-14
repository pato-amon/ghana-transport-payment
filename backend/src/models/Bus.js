// backend/src/models/Bus.js
module.exports = (sequelize, DataTypes) => {
    const Bus = sequelize.define('Bus', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        busNumber: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            set(value) { this.setDataValue('busNumber', value.toUpperCase().trim()); }
        },
        operatorId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        conductorId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        routeId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        capacity: {
            type: DataTypes.INTEGER,
            defaultValue: 30,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        isOnTrip: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        plateNumber: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        model: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        qrCode: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: 'buses',
        underscored: true, // Converts camelCase JS associations into clean snake_case DB columns (e.g. operatorId -> operator_id)
    });

    return Bus;
};