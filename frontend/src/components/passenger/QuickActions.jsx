// frontend/src/components/passenger/QuickActions.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BanknotesIcon,
    ClockIcon,
    WalletIcon,
    UserIcon,
} from '@heroicons/react/24/outline';

const QuickActions = () => {
    const navigate = useNavigate();

    const actions = [
        {
            icon: BanknotesIcon,
            label: 'Pay Fare',
            path: '/passenger/pay',
            bg: 'bg-ghana-green',
            text: 'text-white',
            primary: true,
        },
        {
            icon: WalletIcon,
            label: 'Wallet',
            path: '/passenger/wallet',
            bg: 'bg-blue-50',
            text: 'text-blue-600',
        },
        {
            icon: ClockIcon,
            label: 'History',
            path: '/passenger/history',
            bg: 'bg-purple-50',
            text: 'text-purple-600',
        },
        {
            icon: UserIcon,
            label: 'Profile',
            path: '/passenger/profile',
            bg: 'bg-orange-50',
            text: 'text-orange-600',
        },
    ];

    return (
        <div className="grid grid-cols-4 gap-3">
            {actions.map((action) => (
                <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className={`${action.bg} rounded-2xl p-3 flex flex-col 
                     items-center gap-2 active:scale-95 transition-transform
                     ${action.primary ? 'shadow-lg shadow-green-200' : ''}`}
                >
                    <action.icon className={`w-6 h-6 ${action.text}`} />
                    <span className={`text-xs font-semibold ${action.text}`}>
                        {action.label}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default QuickActions;