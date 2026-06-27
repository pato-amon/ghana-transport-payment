const test = require('node:test');
const assert = require('node:assert/strict');
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
