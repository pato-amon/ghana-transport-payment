// frontend/src/layouts/PassengerLayout.jsx
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    BanknotesIcon,
    ClockIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    BanknotesIcon as BanknotesIconSolid,
    ClockIcon as ClockIconSolid,
    UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid';

const PassengerLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        {
            label: 'Home',
            path: '/passenger',
            icon: HomeIcon,
            iconSolid: HomeIconSolid,
        },
        {
            label: 'Pay Fare',
            path: '/passenger/pay',
            icon: BanknotesIcon,
            iconSolid: BanknotesIconSolid,
        },
        {
            label: 'History',
            path: '/passenger/history',
            icon: ClockIcon,
            iconSolid: ClockIconSolid,
        },
        {
            label: 'Profile',
            path: '/passenger/profile',
            icon: UserIcon,
            iconSolid: UserIconSolid,
        },
    ];

    const isActive = (path) => {
        if (path === '/passenger') return location.pathname === '/passenger';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
            {/* Page Content */}
            <main className="pb-20">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full 
                      max-w-md bg-white border-t border-gray-100 
                      shadow-lg z-50">
                <div className="flex items-center justify-around px-2 py-2">
                    {tabs.map((tab) => {
                        const active = isActive(tab.path);
                        const Icon = active ? tab.iconSolid : tab.icon;

                        return (
                            <button
                                key={tab.path}
                                onClick={() => navigate(tab.path)}
                                className={`flex flex-col items-center gap-1 px-4 py-2 
                           rounded-xl transition-all duration-200
                           ${active
                                        ? 'text-ghana-green'
                                        : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Icon className="w-6 h-6" />
                                <span className={`text-xs font-medium ${active ? 'font-bold' : ''}`}>
                                    {tab.label}
                                </span>
                                {active && (
                                    <div className="w-1 h-1 bg-ghana-green rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default PassengerLayout;