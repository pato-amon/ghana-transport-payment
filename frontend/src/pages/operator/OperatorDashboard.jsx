// frontend/src/pages/operator/OperatorDashboard.jsx
import React from 'react';
import useAuthStore from '../../store/authStore';

const OperatorDashboard = () => {
    const user = useAuthStore((s) => s.user);
    return (
        <div className="pb-24 bg-gray-50 min-h-screen">
            <div className="bg-blue-600 px-5 pt-14 pb-6">
                <p className="text-blue-200 text-sm">Operator Dashboard</p>
                <h1 className="font-display font-bold text-2xl text-white">
                    {user?.fullName?.split(' ')[0]} 🏢
                </h1>
            </div>
            <div className="px-5 py-5">
                <div className="card text-center py-10">
                    <p className="text-4xl mb-2">📊</p>
                    <p className="font-bold text-gray-900">Operator Dashboard</p>
                    <p className="text-gray-500 text-sm mt-1">Manage buses and revenue</p>
                </div>
            </div>
        </div>
    );
};

export default OperatorDashboard;

// Placeholder pages for operator
export const BusManagement = () => (
    <div className="pb-24 min-h-screen bg-gray-50">
        <div className="bg-white px-5 pt-14 pb-4 border-b">
            <h1 className="font-display font-bold text-xl">Manage Buses</h1>
        </div>
        <div className="px-5 py-10 text-center">
            <p className="text-4xl mb-2">🚌</p>
            <p className="text-gray-500">Bus fleet management</p>
        </div>
    </div>
);

export const RevenueReport = () => (
    <div className="pb-24 min-h-screen bg-gray-50">
        <div className="bg-white px-5 pt-14 pb-4 border-b">
            <h1 className="font-display font-bold text-xl">Revenue Report</h1>
        </div>
        <div className="px-5 py-10 text-center">
            <p className="text-4xl mb-2">💹</p>
            <p className="text-gray-500">Revenue analytics</p>
        </div>
    </div>
);

export const RoutesPage = () => (
    <div className="pb-24 min-h-screen bg-gray-50">
        <div className="bg-white px-5 pt-14 pb-4 border-b">
            <h1 className="font-display font-bold text-xl">Routes</h1>
        </div>
        <div className="px-5 py-10 text-center">
            <p className="text-4xl mb-2">🗺️</p>
            <p className="text-gray-500">Manage transport routes</p>
        </div>
    </div>
);