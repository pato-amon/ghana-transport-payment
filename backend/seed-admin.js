// backend/seed-admin.js
require('dotenv').config();
const { DataTypes } = require('sequelize');
const db = require('./src/config/database');
const userFactory = require('./src/models/User');
const { NETWORKS } = require('./src/config/constants'); // Import to prevent validation errors

const buildAdmin = async () => {
    try {
        await db.authenticate();
        console.log('🔌 Connected to Postgres...');

        // 1. Ensure Postgres Enum includes 'admin'
        await db.query(`ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'admin';`);

        // 2. Initialize User model
        const User = userFactory(db, DataTypes);

        const targetPhone = '0241234567'; // Valid Ghanaian format matching your regex

        // 3. Check if user already exists
        const existingUser = await User.findOne({ where: { phone: targetPhone } });

        if (existingUser) {
            // Upgrade existing user
            existingUser.role = 'admin';
            existingUser.isVerified = true;
            await existingUser.save();
            console.log(`🚀 Success! Existing user (${existingUser.fullName}) promoted to Admin.`);
        } else {
            // Create a completely new Admin from scratch
            // Grabs the first valid network value from your constants (e.g., 'MTN')
            const defaultNetwork = Object.values(NETWORKS)[0];

            if (!defaultNetwork) {
                throw new Error("Could not read values from NETWORKS constant. Check backend/src/config/constants.js");
            }

            const newAdmin = await User.create({
                fullName: 'System Administrator',
                phone: targetPhone,
                network: defaultNetwork,
                role: 'admin',
                pin: '1234', // Your beforeCreate hook will hash this automatically!
                isVerified: true,
                isActive: true
            });

            console.log(`✨ Success! Created a brand new Admin account from scratch.`);
            console.log(`📱 Login Phone: ${targetPhone}`);
            console.log(`🔑 Login PIN:  1234`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    }
};

buildAdmin();