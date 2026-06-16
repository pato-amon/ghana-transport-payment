// frontend/src/utils/constants.js

// 1. API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/v1';

// 2. Ghana Mobile Money Providers
export const MOMO_PROVIDERS = {
    MTN: { id: 'mtn', name: 'MTN Mobile Money', shortName: 'MTN' },
    VODAFONE: { id: 'telecel', name: 'Telecel Cash', shortName: 'Telecel' }, // Formerly Vodafone Cash
    AIRTELTIGO: { id: 'at', name: 'AT Money', shortName: 'AT' }              // Formerly AirtelTigo Money
};

// 3. User Roles
export const ROLES = {
    PASSENGER: 'passenger',
    CONDUCTOR: 'conductor',
    OPERATOR: 'operator',
    ADMIN: 'admin'
};

// 4. Ghana Regions & Key Transport Hubs (For Route UI Selectors)
export const GHANA_REGIONS = [
    { code: 'GAR', name: 'Greater Accra' },
    { code: 'ASH', name: 'Ashanti' },
    { code: 'WR', name: 'Western' },
    { code: 'CR', name: 'Central' },
    { code: 'ER', name: 'Eastern' },
    { code: 'NR', name: 'Northern' },
    { code: 'BR', name: 'Bono' },
    { code: 'VR', name: 'Volta' }
];

// 5. Default Currency Settings (Ghana Cedis)
export const CURRENCY = {
    symbol: 'GH₵',
    code: 'GHS',
    format: (amount) => `GH₵${parseFloat(amount).toFixed(2)}`
};

// 6. Transaction Statuses
export const TRANSACTION_STATUS = {
    PENDING: 'pending',
    SUCCESSFUL: 'successful',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
};

// 7. General Application Limits
export const APP_LIMITS = {
    MIN_WALLET_TOPUP: 5.00,       // Minimum MoMo deposit 5 GHS
    MAX_WALLET_TOPUP: 5000.00,    // Maximum single top-up limit
    OTP_EXPIRY_TIME: 300,         // 5 minutes in seconds
};