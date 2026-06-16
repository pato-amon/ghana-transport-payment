// frontend/src/layouts/OperatorLayout.jsx
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    ChartBarIcon,
    TruckIcon,
    MapIcon,
    CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import {
    ChartBarIcon as ChartSolid,
    TruckIcon as TruckSolid,
    MapIcon as MapSolid,
    CurrencyDollarIcon as CurrencySolid,
} from '@heroicons/react/24/solid';

const OperatorLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { label: 'Dashboard', path: '/operator', icon: ChartBarIcon, iconSolid: ChartSolid },
        { label: 'Buses', path: '/operator/buses', icon: TruckIcon, iconSolid: TruckSolid },
        { label: 'Routes', path: '/operator/routes', icon: MapIcon, iconSolid: MapSolid },
        { label: 'Revenue', path: '/operator/revenue', icon: CurrencyDollarIcon, iconSolid: CurrencySolid },
    ];

    const isActive = (path) => {
        if (path === '/operator') return location.pathname === '/operator';
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
                           ${active ? 'text-blue-600' : 'text-gray-400'}`}
                            >
                                <Icon className="w-6 h-6" />
                                <span className={`text-xs ${active ? 'font-bold' : 'font-medium'}`}>
                                    {tab.label}
                                </span>
                                {active && <div className="w-1 h-1 bg-blue-600 rounded-full" />}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default OperatorLayout;