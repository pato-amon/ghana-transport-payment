// frontend/src/pages/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BusIcon, ShieldCheckIcon,
    BoltIcon, SmartphoneIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: '💰',
            title: 'Instant Balance Return',
            desc: 'Never lose your change again. Balance sent to your wallet automatically.',
            color: 'bg-green-50 border-green-200'
        },
        {
            icon: '📱',
            title: 'Pay with MoMo',
            desc: 'MTN, Vodafone, AirtelTigo — all networks supported.',
            color: 'bg-yellow-50 border-yellow-200'
        },
        {
            icon: '📲',
            title: 'Works on Any Phone',
            desc: 'No smartphone? Dial *713# to pay and check balance.',
            color: 'bg-blue-50 border-blue-200'
        },
        {
            icon: '🔒',
            title: 'Secure & Trusted',
            desc: 'Every pesewa tracked and secured by MoolRe.',
            color: 'bg-red-50 border-red-200'
        }
    ];

    const stats = [
        { value: '500K+', label: 'Daily Passengers' },
        { value: 'GHS 0', label: 'Balance Lost' },
        { value: '3 Sec', label: 'Payment Speed' },
        { value: '24/7', label: 'Available' },
    ];

    return (
        <div className="min-h-screen bg-white">

            {/* Header */}
            <header className="flex items-center justify-between px-5 py-4 border-b">
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
                    className="text-sm font-semibold text-ghana-green border border-ghana-green 
                     px-4 py-2 rounded-lg hover:bg-ghana-green hover:text-white 
                     transition-all duration-200"
                >
                    Login
                </button>
            </header>

            {/* Hero Section */}
            <section className="px-5 pt-10 pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    {/* Ghana Flag Strip */}
                    <div className="flex justify-center mb-6">
                        <div className="flex rounded-full overflow-hidden h-2 w-32">
                            <div className="flex-1 bg-ghana-red" />
                            <div className="flex-1 bg-ghana-gold" />
                            <div className="flex-1 bg-ghana-green" />
                        </div>
                    </div>

                    <h1 className="font-display text-3xl font-bold text-gray-900 leading-tight mb-4">
                        Pay Your Bus Fare{' '}
                        <span className="text-ghana-green">Smartly</span>
                        <br />in Ghana 🇬🇭
                    </h1>

                    <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                        No more arguments over change. Pay exact fare via Mobile Money
                        and get your balance back instantly — automatically.
                    </p>

                    {/* CTA Buttons */}
                    <div className="space-y-3 max-w-xs mx-auto">
                        <button
                            onClick={() => navigate('/register')}
                            className="btn-primary text-base py-4"
                        >
                            🚌 Get Started — It's Free
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="btn-outline"
                        >
                            I already have an account
                        </button>
                    </div>

                    {/* USSD hint */}
                    <p className="mt-4 text-xs text-gray-400">
                        No smartphone? Dial <span className="font-bold text-ghana-green">*203#</span> to get started
                    </p>
                </motion.div>

                {/* Animated Bus Illustration */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-10 flex justify-center"
                >
                    <div className="relative w-72 h-44 bg-gradient-to-br from-ghana-green to-green-700 
                          rounded-3xl overflow-hidden shadow-2xl">
                        {/* Bus card design */}
                        <div className="absolute inset-0 p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-green-200 text-xs">TransportGH</p>
                                    <p className="text-white font-display font-bold text-lg">Digital Pass</p>
                                </div>
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center 
                                justify-center text-xl">
                                    🚌
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="text-green-200 text-xs mb-1">Route</p>
                                <p className="text-white font-semibold text-sm">Accra → Tema</p>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-green-200 text-xs">Wallet Balance</p>
                                    <p className="text-white font-display font-bold text-2xl">GHS 23.50</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-green-200 text-xs">Last Balance</p>
                                    <p className="text-ghana-gold font-bold text-sm">+GHS 1.50</p>
                                </div>
                            </div>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* Stats */}
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
                            <p className="font-display font-bold text-ghana-green text-lg">
                                {stat.value}
                            </p>
                            <p className="text-gray-500 text-xs">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="px-5 py-8">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-5 text-center">
                    Why TransportGH?
                </h2>
                <div className="space-y-3">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 * i }}
                            className={`flex items-start gap-4 p-4 rounded-2xl border ${feature.color}`}
                        >
                            <span className="text-2xl">{feature.icon}</span>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className="px-5 py-8 bg-gray-900 text-white">
                <h2 className="font-display font-bold text-xl mb-6 text-center">
                    How It Works 🚀
                </h2>
                <div className="space-y-4">
                    {[
                        { step: '01', title: 'Board the bus', desc: 'Get on any TransportGH registered bus', icon: '🚌' },
                        { step: '02', title: 'Scan or Dial', desc: 'Scan QR code or dial *203# on any phone', icon: '📱' },
                        { step: '03', title: 'Pay fare', desc: 'Pay via MoMo — any network accepted', icon: '💳' },
                        { step: '04', title: 'Get balance back', desc: 'Change sent to your wallet instantly', icon: '💰' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-ghana-green rounded-xl 
                              flex items-center justify-center text-sm font-bold">
                                {item.step}
                            </div>
                            <div className="flex-1 pb-4 border-b border-gray-700 last:border-0">
                                <div className="flex items-center gap-2">
                                    <span>{item.icon}</span>
                                    <h3 className="font-semibold">{item.title}</h3>
                                </div>
                                <p className="text-gray-400 text-xs mt-1">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Bottom */}
            <section className="px-5 py-8 text-center">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-2">
                    Ready to ride smarter? 🇬🇭
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                    Join thousands of Ghanaians already using TransportGH
                </p>
                <button
                    onClick={() => navigate('/register')}
                    className="btn-primary max-w-xs mx-auto"
                >
                    Create Free Account
                </button>

                {/* Powered by */}
                <p className="mt-6 text-xs text-gray-400">
                    Secured & Powered by{' '}
                    <span className="font-bold text-ghana-green">MoolRe</span>
                </p>
            </section>
        </div>
    );
};

export default LandingPage;