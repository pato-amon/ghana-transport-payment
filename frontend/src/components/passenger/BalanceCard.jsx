// frontend/src/components/passenger/BalanceCard.jsx
import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const BalanceCard = ({ balance = 0, pendingBalance = 0, loading = false }) => {
    const [show, setShow] = useState(true);

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 
                    rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
            {/* Ghana flag top strip */}
            <div className="absolute top-0 left-0 right-0 flex h-1">
                <div className="flex-1 bg-ghana-red" />
                <div className="flex-1 bg-ghana-gold" />
                <div className="flex-1 bg-ghana-green" />
            </div>

            {/* Background bus */}
            <div className="absolute right-4 bottom-4 text-6xl opacity-5">🚌</div>

            <div className="relative">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-400 text-xs uppercase tracking-widest">
                        Wallet Balance
                    </p>
                    <button
                        onClick={() => setShow(!show)}
                        className="w-8 h-8 bg-white/10 rounded-lg 
                       flex items-center justify-center"
                    >
                        {show
                            ? <EyeIcon className="w-4 h-4" />
                            : <EyeSlashIcon className="w-4 h-4" />
                        }
                    </button>
                </div>

                {/* Balance */}
                {loading ? (
                    <div className="h-10 w-40 bg-white/10 rounded-xl animate-pulse mb-4" />
                ) : (
                    <div className="mb-4">
                        <span className="text-gray-400 text-sm">GHS </span>
                        <span className="text-4xl font-bold font-display">
                            {show ? balance.toFixed(2) : '••••'}
                        </span>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                        <p className="text-gray-400 text-xs">Pending Balance</p>
                        <p className="text-ghana-gold font-bold text-sm mt-0.5">
                            GHS {pendingBalance.toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">Status</p>
                        <div className="flex items-center gap-1 mt-0.5">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-green-400 text-sm font-medium">Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BalanceCard;