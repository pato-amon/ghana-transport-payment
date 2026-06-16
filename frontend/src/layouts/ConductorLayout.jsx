// frontend/src/layouts/ConductorLayout.jsx
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    QrCodeIcon,
    DocumentTextIcon,
    BanknotesIcon,
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeSolid,
    QrCodeIcon as QrSolid,
    DocumentTextIcon as DocSolid,
    BanknotesIcon as BankSolid,
} from '@heroicons/react/24/solid';

const ConductorLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { label: 'Home', path: '/conductor', icon: HomeIcon, iconSolid: HomeSolid },
        { label: 'Collect', path: '/conductor/scan', icon: QrCodeIcon, iconSolid: QrSolid },
        { label: 'Manifest', path: '/conductor/manifest', icon: DocumentTextIcon, iconSolid: DocSolid },
        { label: 'Earnings', path: '/conductor/earnings', icon: BanknotesIcon, iconSolid: BankSolid },
    ];

    const isActive = (path) => {
        if (path === '/conductor') return location.pathname === '/conductor';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
            <main className="pb-20">
                <Outlet />
            </main>
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full 
                      max-w-md bg-white border-t border-gray-100 shadow-lg z-50">
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
                           ${active ? 'text-ghana-gold' : 'text-gray-400'}`}
                            >
                                <Icon className="w-6 h-6" />
                                <span className={`text-xs ${active ? 'font-bold' : 'font-medium'}`}>
                                    {tab.label}
                                </span>
                                {active && <div className="w-1 h-1 bg-ghana-gold rounded-full" />}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default ConductorLayout;