// frontend/src/pages/auth/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    UserCircleIcon,
    TicketIcon,
    BuildingOffice2Icon,
    EyeIcon,
    EyeSlashIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import authService from '../../services/authService';

const schema = yup.object({
    fullName: yup.string()
        .min(2, 'Enter your full name')
        .required('Full name is required'),
    phone: yup.string()
        .matches(/^0[2345][0-9]{8}$/, 'Enter valid Ghana number (e.g. 0244123456)')
        .required('Phone number is required'),
    network: yup.string()
        .oneOf(['MTN', 'VODAFONE', 'AIRTELTIGO'])
        .required('Select your network'),
    role: yup.string()
        .oneOf(['passenger', 'conductor', 'operator'])
        .required('Select your role'),
    pin: yup.string()
        .length(4, 'PIN must be 4 digits')
        .matches(/^[0-9]+$/, 'PIN must be numbers only')
        .required('PIN is required'),
    confirmPin: yup.string()
        .oneOf([yup.ref('pin')], 'PINs do not match')
        .required('Confirm your PIN'),
});

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPin, setShowPin] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { role: 'passenger', network: 'MTN' },
    });

    const selectedRole = watch('role');

    const roleConfig = {
        passenger: {
            icon: UserCircleIcon,
            label: 'Passenger',
            desc: 'Pay fares and receive balance back',
            color: 'border-ghana-green bg-green-50',
        },
        conductor: {
            icon: TicketIcon,
            label: 'Conductor',
            desc: 'Collect fares digitally',
            color: 'border-ghana-gold bg-yellow-50',
        },
        operator: {
            icon: BuildingOffice2Icon,
            label: 'Transport operator',
            desc: 'Manage buses and revenue',
            color: 'border-blue-500 bg-blue-50',
        },
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const response = await authService.register(data);
            if (response?.demoOtp) {
                sessionStorage.setItem(`demoOtp_${response.userId}`, response.demoOtp);
            }
            toast.success('OTP sent to your phone.');
            navigate('/verify', {
                state: {
                    phone: data.phone,
                    userId: response.userId,
                    demoOtp: response.demoOtp,
                },
            });
        } catch (error) {
            toast.error(error.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="px-5 pt-10 pb-6">
                <button onClick={() => navigate(-1)} className="text-gray-500 text-sm mb-6 flex items-center gap-1">
                    ← Back
                </button>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="font-display font-bold text-2xl text-gray-900">Create account</h1>
                    <p className="text-gray-500 text-sm mt-1">Join TransportGH and manage fares with less hassle.</p>
                    <p className="mt-3 text-xs text-ghana-green/90">
                        Demo mode is active: if SMS delivery is unavailable, the OTP will appear on the next screen.
                    </p>
                </motion.div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-5 space-y-5 pb-10">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">I am a...</label>
                    <div className="space-y-2">
                        {Object.entries(roleConfig).map(([value, config]) => {
                            const Icon = config.icon;
                            return (
                                <label
                                    key={value}
                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedRole === value ? config.color : 'border-gray-100'}`}
                                >
                                    <input type="radio" value={value} {...register('role')} className="hidden" />
                                    <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center">
                                        <Icon className="h-5 w-5 text-gray-700" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm text-gray-900">{config.label}</p>
                                        <p className="text-xs text-gray-500">{config.desc}</p>
                                    </div>
                                    {selectedRole === value && <CheckIcon className="h-4 w-4 text-ghana-green" />}
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-5">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Full name</label>
                        <input {...register('fullName')} placeholder="Kwame Mensah" className="input-field" />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Phone number</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+233</span>
                            <input {...register('phone')} placeholder="0244123456" type="tel" className="input-field pl-16" />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Mobile network</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['MTN', 'VODAFONE', 'AIRTELTIGO'].map((net) => (
                                <label
                                    key={net}
                                    className={`text-center py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-xs font-bold ${watch('network') === net ? 'border-ghana-green bg-green-50 text-ghana-green' : 'border-gray-200 text-gray-500'}`}
                                >
                                    <input type="radio" value={net} {...register('network')} className="hidden" />
                                    {net}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Create 4-digit PIN</label>
                        <div className="relative">
                            <input {...register('pin')} type={showPin ? 'text' : 'password'} placeholder="••••" maxLength={4} className="input-field tracking-widest text-center text-2xl" />
                            <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                {showPin ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.pin && <p className="text-red-500 text-xs mt-1">{errors.pin.message}</p>}
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Confirm PIN</label>
                        <input {...register('confirmPin')} type={showPin ? 'text' : 'password'} placeholder="••••" maxLength={4} className="input-field tracking-widest text-center text-2xl" />
                        {errors.confirmPin && <p className="text-red-500 text-xs mt-1">{errors.confirmPin.message}</p>}
                    </div>
                </div>

                <p className="text-xs text-gray-400 text-center leading-relaxed">
                    By creating an account, you agree to our <span className="text-ghana-green font-semibold">Terms of Service</span> and <span className="text-ghana-green font-semibold">Privacy Policy</span>.
                </p>

                <button type="submit" disabled={loading} className="btn-primary py-4 text-base">
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Creating account...
                        </span>
                    ) : (
                        'Create account'
                    )}
                </button>

                <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-ghana-green font-semibold">Login</Link>
                </p>
            </form>
        </div>
    );
};

export default RegisterPage;
