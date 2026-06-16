// frontend/src/pages/conductor/ConductorHome.jsx
import React from 'react';
import useAuthStore from '../../store/authStore';

const ConductorHome = () => {
    const user = useAuthStore((s) => s.user);
    return (
        <div className="pb-24 bg-gray-50 min-h-screen">
            <div className="bg-ghana-gold px-5 pt-14 pb-6">
                <p className="text-yellow-800 text-sm">Welcome back,</p>
                <h1 className="font-display font-bold text-2xl text-gray-900">
                    {user?.fullName?.split(' ')[0]} 🎫
                </h1>
            </div>
            <div className="px-5 py-5">
                <div className="card text-center py-10">
                    <p className="text-4xl mb-2">🎫</p>
                    <p className="font-bold text-gray-900">Conductor Dashboard</p>
                    <p className="text-gray-500 text-sm mt-1">
                        Go to Collect to receive fares
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConductorHome;