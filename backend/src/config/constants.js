// backend/src/config/constants.js
module.exports = {
    // Roles
    ROLES: {
        PASSENGER: 'passenger',
        CONDUCTOR: 'conductor',
        OPERATOR: 'operator',
        ADMIN: 'admin',
    },

    // Networks
    NETWORKS: {
        MTN: 'MTN',
        VODAFONE: 'VODAFONE',
        AIRTELTIGO: 'AIRTELTIGO',
    },

    // Transaction Types
    TRANSACTION_TYPES: {
        FARE_PAYMENT: 'FARE_PAYMENT',
        BALANCE_RETURN: 'BALANCE_RETURN',
        WALLET_TOPUP: 'WALLET_TOPUP',
        WITHDRAWAL: 'WITHDRAWAL',
        REFUND: 'REFUND',
    },

    // Transaction Status
    TRANSACTION_STATUS: {
        PENDING: 'PENDING',
        SUCCESS: 'SUCCESS',
        FAILED: 'FAILED',
        REVERSED: 'REVERSED',
        CANCELLED: 'CANCELLED',
    },

    // Payment Status
    PAYMENT_STATUS: {
        INITIATED: 'INITIATED',
        PENDING: 'PENDING',
        SUCCESS: 'SUCCESS',
        FAILED: 'FAILED',
        TIMEOUT: 'TIMEOUT',
    },

    // Trip Status
    TRIP_STATUS: {
        ACTIVE: 'ACTIVE',
        COMPLETED: 'COMPLETED',
        CANCELLED: 'CANCELLED',
    },

    // SMS Templates
    SMS_TEMPLATES: {
        OTP: (otp) =>
            `Your TransportGH OTP is: ${otp}. Valid for ${process.env.OTP_EXPIRES_MINUTES} minutes. Do not share this code.`,

        FARE_SUCCESS: (fare, balance, ref) =>
            `TransportGH: Fare GHS${fare} paid. Balance GHS${balance} returned to your wallet. Ref: ${ref}. Safe journey!`,

        BALANCE_RETURNED: (amount, newBal, ref) =>
            `TransportGH: GHS${amount} balance credited to your wallet. New balance: GHS${newBal}. Ref: ${ref}`,

        PAYMENT_FAILED: (amount) =>
            `TransportGH: Payment of GHS${amount} failed. Please check your MoMo balance and try again.`,

        BALANCE_REMINDER: (amount) =>
            `TransportGH: You have GHS${amount} unclaimed balance. Dial *713# or open the app to claim. Valid for 24hrs.`,

        CONDUCTOR_FARE: (amount, passenger, bus) =>
            `TransportGH: GHS${amount} fare received from ${passenger}. Bus: ${bus}. Balance auto-returned to passenger.`,

        WALLET_TOPUP: (amount, newBal) =>
            `TransportGH: GHS${amount} added to your wallet. New balance: GHS${newBal}`,
    },
};