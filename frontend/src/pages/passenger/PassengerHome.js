// frontend/src/pages/passenger/PassengerHome.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import paymentService from '../../services/paymentService';
import TransactionCard from '../../components/shared/TransactionCard';
import BalanceCard from '../../components/passenger/BalanceCard';
import QuickActions from '../../components/passenger/QuickActions';

const PassengerHome = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    // Fetch wallet
    const { data: wallet, isLoading: walletLoading } = useQuery(
        ['wallet'],
        paymentService.getWallet,
        { refetchInterval: 30000 } // refresh every 30s
    );

    // Fetch recent transactions
    const { data: transactions } = useQuery(
        ['transactions', 'recent'],
        () => paymentService.getTransactions({ limit: 5 }),
    );

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-ghana-green to-green-800 
                      px-5 pt-14 pb-20 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute top-20 -right-5 w-20 h-20 bg-white/10 rounded-full" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-green-200 text-sm">{greeting()} 👋</p>
                            <h1 className="font-display font-bold text-white text-xl">
                                {user?.fullName?.split(' ')[0]}
                            </h1>
                        </div>
                        <button
                            onClick={() => navigate('/passenger/profile')}
                            className="w-10 h-10 bg-white/20 rounded-full flex items-center 
                         justify-center text-white font-bold"
                        >
                            {user?.fullName?.[0] || 'P'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Wallet Balance Card — overlaps header */}
            <div className="px-5 -mt-14 relative z-20 mb-5">
                <BalanceCard
                    balance={wallet?.balance || 0}
                    pendingBalance={wallet?.pendingBalance || 0}
                    loading={walletLoading}
                />
            </div>

            {/* Pending Balance Alert */}
            {wallet?.pendingBalance > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-5 mb-5 p-4 bg-ghana-gold/10 border border-ghana-gold/30 
                     rounded-2xl flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">💰</span>
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">
                                Unclaimed Balance!
                            </p>
                            <p className="text-gray-500 text-xs">
                                GHS {wallet.pendingBalance.toFixed(2)} waiting for you
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/passenger/wallet')}
                        className="bg-ghana-gold text-gray-900 text-xs font-bold 
                       px-3 py-2 rounded-lg"
                    >
                        Claim →
                    </button>
                </motion.div>
            )}

            {/* Quick Actions */}
            <div className="px-5 mb-6">
                <QuickActions />
            </div>

            {/* Today's Summary */}
            <div className="px-5 mb-6">
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Today's Trips", value: wallet?.todayTrips || 0, icon: '🚌' },
                        { label: 'Fare Paid', value: `GHS ${(wallet?.todayFare || 0).toFixed(2)}`, icon: '💳' },
                        { label: 'Saved', value: `GHS ${(wallet?.totalSaved || 0).toFixed(2)}`, icon: '✅' },
                    ].map((item, i) => (
                        <div key={i} className="card text-center">
                            <span className="text-xl block mb-1">{item.icon}</span>
                            <p className="font-bold text-gray-900 text-sm">{item.value}</p>
                            <p className="text-gray-400 text-xs">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Trips */}
            <div className="px-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-bold text-gray-900">Recent Trips</h2>
                    <button
                        onClick={() => navigate('/passenger/history')}
                        className="text-ghana-green text-sm font-semibold"
                    >
                        See all →
                    </button>
                </div>

                {transactions?.data?.length > 0 ? (
                    <div className="space-y-3">
                        {transactions.data.map((tx) => (
                            <TransactionCard key={tx.id} transaction={tx} />
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-10">
                        <span className="text-4xl block mb-2">🚌</span>
                        <p className="text-gray-500 text-sm">No trips yet</p>
                        <button
                            onClick={() => navigate('/passenger/pay')}
                            className="mt-4 text-ghana-green font-semibold text-sm"
                        >
                            Pay your first fare →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PassengerHome;