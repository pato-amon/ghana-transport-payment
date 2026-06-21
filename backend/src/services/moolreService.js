// backend/src/services/moolreService.js
const axios = require('axios');
const logger = require('../config/logger');
/**
 * Communicates with Moolre to generate a hosted payment link
 * @param {Object} ticketDetails - Metadata representing the transaction
 * @returns {Promise<Object>} - Contains authorization_url and tracking references
 */

const initiateMoolreCheckout = async (ticketDetails) => {
    try {
        // Construct standard payload structural layout aligned to Moolre specs
        const moolrePayload = {
            type: 1, // Required by Moolre for link generation
            amount: parseFloat(ticketDetails.totalPrice).toFixed(2), // Force standard decimal strings
            currency: "GHS",
            email: ticketDetails.customerEmail,
            externalref: ticketDetails.id, // Your internal DB Primary Key UUID/ID string
            accountnumber: process.env.MOOLRE_MERCHANT_ID,
            callback: process.env.MOOLRE_CALLBACK_URL,
            redirect: process.env.MOOLRE_REDIRECT_URL,
            reusable: "0"
        };

        const headers = {
            'Content-Type': 'application/json',
            'X-API-USER': process.env.DB_USER, // If your username matches or replace with a dedicated username var
            'X-API-PUBKEY': process.env.MOOLRE_PUBLIC_KEY,
            'X-API-KEY': process.env.MOOLRE_SECRET_KEY
        };

        logger.info(`📡 Requesting payment authorization from Moolre for Ref: ${ticketDetails.id}`);

        // Construct target endpoint mapping cleanly
        // Note: Moolre endpoints use /embed/link. We handle base formatting dynamically here.
        const targetUrl = `${process.env.MOOLRE_BASE_URL.replace('/v1', '')}/embed/link`;

        const response = await axios.post(targetUrl, moolrePayload, { headers });

        // Moolre returns { status: 1, data: { authorization_url: '...' } } on clean validation
        if (response.data && response.data.status === 1) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Moolre failed processing checkout configuration');
        }

    } catch (error) {
        logger.error(`❌ Moolre Checkout Initiation Failed for Ref: ${ticketDetails.id}:`, error.message);
        throw error;
    }
};

class MoolReService {
    constructor() {
        this.client = axios.create({
            baseURL: process.env.MOOLRE_BASE_URL,
            timeout: 30000,
            headers: {
                'Authorization': `Bearer ${process.env.MOOLRE_SECRET_KEY}`,
                'Content-Type': 'application/json',
                'x-merchant-id': process.env.MOOLRE_MERCHANT_ID,
            },
        });

        // Log all requests
        this.client.interceptors.request.use((config) => {
            logger.info(`MoolRe API Request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        });

        // Log all responses
        this.client.interceptors.response.use(
            (response) => {
                logger.info(`MoolRe API Response: ${response.status} ${response.config.url}`);
                return response.data;
            },
            (error) => {
                logger.error('MoolRe API Error:', {
                    url: error.config?.url,
                    status: error.response?.status,
                    message: error.response?.data?.message,
                });
                throw {
                    message: error.response?.data?.message || 'Payment service error',
                    code: error.response?.data?.code || 'PAYMENT_ERROR',
                    status: error.response?.status || 500,
                };
            }
        );
    }

    // ================================
    // PAYMENTS API — Collect Money
    // ================================
    async collectPayment({
        amount,
        phone,
        network,
        reference,
        description,
        customerId,
        callbackUrl,
    }) {
        try {
            const response = await this.client.post('/payments/collect', {
                amount,
                currency: 'GHS',
                reference,
                description,
                customer: {
                    phone,
                    network,
                    id: customerId,
                },
                payment_method: 'mobile_money',
                callback_url: callbackUrl || process.env.MOOLRE_CALLBACK_URL,
                redirect_url: process.env.MOOLRE_REDIRECT_URL,
                metadata: {
                    source: 'transportgh',
                    purpose: 'bus_fare',
                },
            });

            logger.info(`Payment initiated: ${reference} - GHS ${amount} from ${phone}`);
            return response;
        } catch (error) {
            logger.error(`Payment initiation failed: ${reference}`, error);
            throw error;
        }
    }

    // ================================
    // PAYMENTS API — Verify Payment
    // ================================
    async verifyPayment(reference) {
        try {
            const response = await this.client.get(`/payments/verify/${reference}`);
            return response;
        } catch (error) {
            logger.error(`Payment verification failed: ${reference}`, error);
            throw error;
        }
    }

    // ================================
    // TRANSFERS API — Send Balance Back
    // ================================
    async sendBalance({
        amount,
        phone,
        network,
        reference,
        reason,
        sourceAccountId,
    }) {
        try {
            const response = await this.client.post('/transfers/send', {
                amount,
                currency: 'GHS',
                reference,
                reason,
                destination: {
                    type: 'mobile_money',
                    phone,
                    network,
                },
                source_account_id: sourceAccountId,
                metadata: {
                    source: 'transportgh',
                    purpose: 'balance_return',
                },
            });

            logger.info(`Balance transfer initiated: GHS ${amount} to ${phone} [${reference}]`);
            return response;
        } catch (error) {
            logger.error(`Balance transfer failed: ${reference}`, error);
            throw error;
        }
    }

    // ================================
    // ACCOUNT API — Create Sub-Account
    // ================================
    async createSubAccount({
        name,
        phone,
        email,
        accountType,
        metadata,
    }) {
        try {
            const response = await this.client.post('/accounts/sub-accounts', {
                business_name: name,
                phone,
                email,
                account_type: accountType,
                settlement_bank: null,
                metadata,
            });

            logger.info(`Sub-account created for: ${name} (${phone})`);
            return response;
        } catch (error) {
            logger.error(`Sub-account creation failed for: ${name}`, error);
            throw error;
        }
    }

    // ================================
    // ACCOUNT API — Get Balance
    // ================================
    async getAccountBalance(subAccountId) {
        try {
            const response = await this.client.get(
                `/accounts/sub-accounts/${subAccountId}/balance`
            );
            return response;
        } catch (error) {
            logger.error(`Balance fetch failed for: ${subAccountId}`, error);
            throw error;
        }
    }

    // ================================
    // SMS API — Send SMS
    // ================================
    async sendSMS({ to, message, senderId }) {
        try {
            const response = await axios.post(
                `${process.env.MOOLRE_SMS_BASE_URL}/sms/send`,
                {
                    to: Array.isArray(to) ? to : [to],
                    message,
                    sender_id: senderId || process.env.MOOLRE_SMS_SENDER_ID,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.MOOLRE_SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            logger.info(`SMS sent to: ${to}`);
            return response.data;
        } catch (error) {
            // Don't throw — SMS failure shouldn't break payment flow
            logger.error(`SMS sending failed to: ${to}`, error.message);
            return null;
        }
    }

    // ================================
    // Validate MoolRe Webhook
    // ================================
    validateWebhookSignature(payload, signature) {
        const crypto = require('crypto');
        const expected = crypto
            .createHmac('sha256', process.env.MOOLRE_SECRET_KEY)
            .update(JSON.stringify(payload))
            .digest('hex');

        return expected === signature;
    }
}

module.exports = new MoolReService();