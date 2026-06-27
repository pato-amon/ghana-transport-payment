// frontend/src/pages/auth/OTPVerifyPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import authService from '../../services/authService';
import useAuthStore from '../../store/authStore';

const OTPVerifyPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const setUser = useAuthStore((state) => state.setUser);

    const { phone, userId, demoOtp: initialDemoOtp } = location.state || {};

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [demoOtp, setDemoOtp] = useState(initialDemoOtp || '');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    // Countdown timer
    useEffect(() => {
        if (resendTimer > 0) {
            const interval = setInterval(() => {
                setTimer((t) => {
                    if (t <= 1) { setCanResend(true); clearInterval(interval); return 0; }
                    return t - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, []);

    const handleChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        // Auto-focus next
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').slice(0, 6);
        if (/^[0-9]+$/.test(pasted)) {
            setOtp(pasted.split('').concat(Array(6 - pasted.length).fill('')));
            inputRefs.current[Math.min(pasted.length, 5)]?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length < 6) {
            toast.error('Enter the 6-digit OTP');
            return;
        }

        try {
            setLoading(true);
            const response = await authService.verifyOTP({ userId, otp: code });
            setUser(response.user);
            toast.success('Phone verified! Welcome 🎉');
            // Redirect by role
            navigate(`/${response.user.role}`);
        } catch (error) {
            toast.error('Invalid or expired OTP. Try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!demoOtp && userId) {
            const storedDemoOtp = sessionStorage.getItem(`demoOtp_${userId}`);
            if (storedDemoOtp) {
                setDemoOtp(storedDemoOtp);
            }
        }
    }, [demoOtp, userId]);

    const handleResend = async () => {
        try {
            const response = await authService.resendOTP({ userId, phone });
            if (response?.demoOtp) {
                setDemoOtp(response.demoOtp);
                sessionStorage.setItem(`demoOtp_${userId}`, response.demoOtp);
                toast.success(`Demo OTP generated: ${response.demoOtp}`);
            } else {
                toast.success('New OTP sent!');
            }
            setTimer(60);
            setCanResend(false);
        } catch {
            toast.error('Failed to resend. Try again.');
        }
    };

    return (
        <div className="min-h-screen bg-white px-5 pt-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-sm mx-auto"
            >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center 
                          justify-center text-4xl animate-bounce-slow">
                        📱
                    </div>
                </div>

                <h1 className="font-display font-bold text-2xl text-gray-900 text-center mb-2">
                    Verify Your Phone
                </h1>
                <p className="text-gray-500 text-sm text-center mb-8">
                    We sent a 6-digit code to{' '}
                    <span className="font-bold text-gray-700">{phone}</span>
                </p>

                {demoOtp && (
                    <div className="mb-6 rounded-2xl border border-dashed border-ghana-green/40 bg-green-50 p-4 text-center">
                        <p className="text-ghana-green text-sm font-semibold">Demo OTP Active</p>
                        <p className="text-gray-700 text-lg font-bold mt-1">{demoOtp}</p>
                        <p className="text-gray-500 text-xs mt-1">
                            Use this code during the hackathon demo since SMS delivery is disabled.
                        </p>
                    </div>
                )}

                {/* OTP Input */}
                <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => (inputRefs.current[i] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2
                         transition-all duration-200 outline-none
                         ${digit
                                    ? 'border-ghana-green bg-green-50 text-ghana-green'
                                    : 'border-gray-200 bg-gray-50 text-gray-900'}
                         focus:border-ghana-green focus:bg-green-50`}
                        />
                    ))}
                </div>

                {/* Verify Button */}
                <button
                    onClick={handleVerify}
                    disabled={loading || otp.join('').length < 6}
                    className="btn-primary py-4 text-base mb-6"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent 
                              rounded-full animate-spin" />
                            Verifying...
                        </span>
                    ) : (
                        '✅ Verify & Continue'
                    )}
                </button>

                {/* Resend */}
                <p className="text-center text-sm text-gray-500">
                    Didn't get the code?{' '}
                    {canResend ? (
                        <button
                            onClick={handleResend}
                            className="text-ghana-green font-semibold"
                        >
                            Resend OTP
                        </button>
                    ) : (
                        <span className="text-gray-400">
                            Resend in <span className="font-bold text-gray-600">{resendTimer}s</span>
                        </span>
                    )}
                </p>
            </motion.div>
        </div>
    );
};

export default OTPVerifyPage;