// frontend/src/services/authService.js
import api from './api';

const authService = {
    // 1. User Login
    login: async (credentials) => {
        // Returns the data object directly because of your interceptor (response => response.data)
        return await api.post('/auth/login', credentials);
    },

    // 2. Register Passenger / Crew
    register: async (userData) => {
        return await api.post('/auth/register', userData);
    },

    // 3. Verify OTP code
    verifyOTP: async (otpData) => {
        return await api.post('/auth/verify-otp', otpData);
    },

    // 4. Resend OTP
    resendOTP: async (payload) => {
        return await api.post('/auth/resend-otp', payload);
    },
};

export default authService;