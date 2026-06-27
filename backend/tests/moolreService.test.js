const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const moolreService = require('../src/services/moolreService');

test('generateOTP returns a 6-digit code', () => {
    const otp = moolreService.generateOTP();

    assert.match(otp, /^\d{6}$/);
});

test('buildOtpMessage includes the OTP and expiry info', () => {
    const message = moolreService.buildOtpMessage('123456', 10);

    assert.match(message, /123456/);
    assert.match(message, /10 minutes/);
});

test('sendSMS returns null when Moolre reports insufficient balance', async () => {
    const originalPost = axios.post;
    axios.post = async () => ({
        status: 200,
        data: {
            status: 0,
            code: 'ASMS06',
            message: 'SMS Bundle Balance Insufficient, Please login on app.moolre.com to top up your balance.',
            data: 'messages',
            go: null,
        },
    });

    try {
        const result = await moolreService.sendSMS({
            to: '233554000000',
            message: 'Test OTP message',
            senderId: 'TransportGH',
        });

        assert.equal(result, null);
    } finally {
        axios.post = originalPost;
    }
});

test('sendSMS uses a demo fallback when demo mode is enabled', async () => {
    process.env.MOOLRE_SMS_DEMO_MODE = 'true';

    const result = await moolreService.sendSMS({
        to: '233554000000',
        message: 'Test OTP message',
        senderId: 'TransportGH',
    });

    assert.equal(result?.code, 'DEMO_FALLBACK');
    assert.equal(result?.data?.mode, 'demo');
});
