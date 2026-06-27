/**
 * Manual test helper to debug OTP sending via Moolre
 * Usage: node test-otp-send.js <phone-number>
 * Example: node test-otp-send.js 233554000000
 */

require('dotenv').config();
const moolreService = require('./src/services/moolreService');
const logger = require('./src/config/logger');

const testPhone = process.argv[2] || '233554000000';

(async () => {
    try {
        console.log('\n🧪 Testing OTP send to:', testPhone);
        console.log('Using Sender ID:', process.env.MOOLRE_SMS_SENDER_ID);
        console.log('Using Endpoint:', `${process.env.MOOLRE_SMS_BASE_URL}/open/sms/send`);
        console.log('\n---\n');

        const otp = moolreService.generateOTP();
        const message = moolreService.buildOtpMessage(otp);

        console.log('Generated OTP:', otp);
        console.log('Message:', message);
        console.log('\n--- Sending via Moolre ---\n');

        const result = await moolreService.sendOTP({
            to: testPhone,
            otp,
            expiresMinutes: process.env.OTP_EXPIRES_MINUTES || 10,
        });

        if (result) {
            console.log('\n✅ Success! Moolre Response:');
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log('\n⚠️  SMS send returned null (likely an error occurred)');
            console.log('Check logs above for details');
        }
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    }
})();
