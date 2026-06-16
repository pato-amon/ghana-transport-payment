// frontend/src/services/paymentService.js
import api from './api';

const paymentService = {
    /**
     * Initialize Moolre Fare Payment / Top-up
     * @param {Object} paymentData 
     * @param {number} paymentData.amount - The fare or top-up amount
     * @param {string} paymentData.phoneNumber - Passenger phone (e.g. 024XXXXXXX)
     * @param {string} paymentData.provider - 'mtn', 'telecel', or 'at'
     */
    initializePayment: async (paymentData) => {
        // Your backend route handles masking/forwarding this to Moolre's API keys securely
        return await api.post('/payments/initialize', paymentData);
    },

    // 2. Verify dynamic transaction status
    verifyTransaction: async (transactionId) => {
        return await api.get(`/payments/verify/${transactionId}`);
    },

    // 3. Fetch user transit ride and funding history 
    getPaymentHistory: async () => {
        return await api.get('/payments/history');
    }
};

export default paymentService;