// frontend/src/pages/LandingPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    DevicePhoneMobileIcon,
    ShieldCheckIcon,
    BoltIcon,
    PhoneIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: BoltIcon,
            title: 'Instant balance return',
            desc: 'Change is sent back to your wallet automatically, so you never lose a pesewa.',
            color: 'bg-green-50 border-green-200',
        },
        {
            icon: PhoneIcon,
            title: 'Pay with MoMo',
            desc: 'MTN, Vodafone and AirtelTigo are all supported with one simple flow.',
            color: 'bg-yellow-50 border-yellow-200',
        },
        {
            icon: DevicePhoneMobileIcon,
            title: 'Works on any phone',
            desc: 'You can still pay and check your balance using USSD when a smartphone is not available.',
            color: 'bg-blue-50 border-blue-200',
        },
        {
            icon: ShieldCheckIcon,
            title: 'Secure and trusted',
            desc: 'Every payment is tracked and protected through MoolRe.',
            color: 'bg-red-50 border-red-200',
        },
    ];

    const stats = [
        { value: '500K+', label: 'Daily passengers' },
        { value: 'GHS 0', label: 'Balance lost' },
        { value: '3 sec', label: 'Payment speed' },
        { value: '24/7', label: 'Always available' },
    ];

    return (
        <div className="min-h-screen bg-white">
            <header className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 ghana-gradient rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">T</span>
                    </div>
                    <span className="font-display font-bold text-gray-900">
                        Transport<span className="text-ghana-green">GH</span>
                    </span>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="text-sm font-semibold text-ghana-green border border-ghana-green px-4 py-2 rounded-lg hover:bg-ghana-green hover:text-white transition-all duration-200"
                >
                    Login
                </button>
            </header>

            <section className="px-5 pt-10 pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className="flex justify-center mb-6">
                        <div className="flex rounded-full overflow-hidden h-2 w-28">
                            <div className="flex-1 bg-ghana-red" />
                            <div className="flex-1 bg-ghana-gold" />
                            <div className="flex-1 bg-ghana-green" />
                        </div>
                    </div>

                    <h1 className="font-display text-3xl font-bold text-gray-900 leading-tight mb-4">
                        Pay your bus fare
                        <span className="text-ghana-green block">with less friction</span>
                    </h1>

                    <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                        Skip the hassle of loose change and pay your fare in seconds through Mobile Money.
                    </p>

                    <div className="space-y-3 max-w-xs mx-auto">
                        <button onClick={() => navigate('/register')} className="btn-primary text-base py-4">
                            Get started
                        </button>
                        <button onClick={() => navigate('/login')} className="btn-outline">
                            I already have an account
                        </button>
                    </div>

                    <p className="mt-4 text-xs text-gray-400">
                        No smartphone? Dial <span className="font-bold text-ghana-green">*203#</span> to get started.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mt-10 flex justify-center"
                >
                    <div className="relative w-72 h-44 bg-gradient-to-br from-ghana-green to-green-700 rounded-3xl overflow-hidden shadow-xl">
                        <div className="absolute inset-0 p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-green-200 text-xs">TransportGH</p>
                                    <p className="text-white font-display font-bold text-lg">Digital pass</p>
                                </div>
                                <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center">
                                    <DevicePhoneMobileIcon className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="text-green-200 text-xs mb-1">Route</p>
                                <p className="text-white font-semibold text-sm">Accra → Tema</p>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-green-200 text-xs">Wallet balance</p>
                                    <p className="text-white font-display font-bold text-2xl">GHS 23.50</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-green-200 text-xs">Last balance</p>
                                    <p className="text-ghana-gold font-bold text-sm">+GHS 1.50</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
                    </div>
                </motion.div>
            </section>

            <section className="px-5 py-6 bg-gray-50">
                <div className="grid grid-cols-4 gap-2">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="text-center"
                        >
                            <p className="font-display font-bold text-ghana-green text-lg">{stat.value}</p>
                            <p className="text-gray-500 text-xs">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="px-5 py-8">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5 text-center">
                    Why TransportGH?
                </h2>
                <div className="space-y-3">
                    {features.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 * i }}
                                className={`flex items-start gap-4 p-4 rounded-2xl border ${feature.color}`}
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0">
                                    <Icon className="h-5 w-5 text-gray-700" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                                    <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{feature.desc}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            <section className="px-5 py-8 bg-gray-900 text-white">
                <h2 className="font-display font-bold text-xl mb-6 text-center">How it works</h2>
                <div className="space-y-4">
                    {[
                        { step: '01', title: 'Board the bus', desc: 'Get on any registered TransportGH bus.' },
                        { step: '02', title: 'Scan or dial', desc: 'Use a QR code or dial *203# from any phone.' },
                        { step: '03', title: 'Pay fare', desc: 'Complete payment through MoMo in a few taps.' },
                        { step: '04', title: 'Get balance back', desc: 'Your change is returned to your wallet instantly.' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-ghana-green rounded-xl flex items-center justify-center text-sm font-bold">
                                {item.step}
                            </div>
                            <div className="flex-1 pb-4 border-b border-gray-700 last:border-0">
                                <h3 className="font-semibold">{item.title}</h3>
                                <p className="text-gray-400 text-xs mt-1">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="px-5 py-8 text-center">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-2">Ready to ride smarter?</h2>
                <p className="text-gray-500 text-sm mb-6">Join thousands of Ghanaians already using TransportGH.</p>
                <button onClick={() => navigate('/register')} className="btn-primary max-w-xs mx-auto">
                    Create free account
                    <ArrowRightIcon className="h-4 w-4" />
                </button>

                <p className="mt-6 text-xs text-gray-400">
                    Secured and powered by <span className="font-bold text-ghana-green">MoolRe</span>
                </p>
            </section>
        </div>
    );
};

export default LandingPage;