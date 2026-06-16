// frontend/src/pages/passenger/ProfilePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <div className="pb-24 bg-gray-50 min-h-screen">
            <div className="bg-ghana-green px-5 pt-14 pb-20">
                <h1 className="font-display font-bold text-xl text-white">Profile</h1>
            </div>

            <div className="px-5 -mt-14">
                {/* Avatar Card */}
                <div className="card mb-5 text-center">
                    <div className="w-20 h-20 bg-ghana-green rounded-full flex items-center 
                          justify-center text-white text-3xl font-bold mx-auto mb-3">
                        {user?.fullName?.[0] || 'U'}
                    </div>
                    <h2 className="font-bold text-xl text-gray-900">{user?.fullName}</h2>
                    <p className="text-gray-500 text-sm">{user?.phone}</p>
                    <span className="inline-block mt-2 bg-green-100 text-ghana-green 
                           text-xs font-bold px-3 py-1 rounded-full capitalize">
                        {user?.role}
                    </span>
                </div>

                {/* Info */}
                <div className="card mb-5 space-y-4">
                    {[
                        { label: 'Full Name', value: user?.fullName },
                        { label: 'Phone', value: user?.phone },
                        { label: 'Network', value: user?.network },
                        { label: 'Role', value: user?.role },
                        { label: 'Member Since', value: new Date(user?.createdAt).toLocaleDateString() },
                    ].map((item, i) => (
                        <div key={i} className="flex justify-between py-1 border-b last:border-0">
                            <span className="text-gray-500 text-sm">{item.label}</span>
                            <span className="font-semibold text-gray-900 text-sm capitalize">
                                {item.value || '—'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Logout */}
                <button onClick={handleLogout} className="btn-danger">
                    🚪 Logout
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;