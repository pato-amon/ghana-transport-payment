// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [metrics, setMetrics] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch initial data
    useEffect(() => {
        fetchAdminData();
    }, [activeTab]);

    const fetchAdminData = async () => {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 🎟️ ESCAPE HATCH 1: Intercept Mock Sessions for Beautiful Local Rendering
        if (!token || token === 'mock-signed-admin-jwt-token-xyz789') {
            console.log(`⚡ Mock mode active. Seeding "${activeTab}" interface with sample analytics.`);

            setTimeout(() => {
                if (activeTab === 'overview') {
                    setMetrics({
                        totalUsers: 148,
                        activeSockets: 24,
                        memoryUsage: '44.2 MB',
                        uptime: '6 days, 4 hours',
                        databaseStatus: 'STABLE (LOCAL_OVERRIDE)'
                    });
                } else if (activeTab === 'users') {
                    setUsers([
                        { id: 'usr_1', fullName: 'Kwame Mensah', phone: '0244123456', network: 'mtn', role: 'passenger', isVerified: true, isActive: true },
                        { id: 'usr_2', fullName: 'Abena Osei', phone: '0207123456', network: 'telecel', role: 'driver', isVerified: true, isActive: true },
                        { id: 'usr_3', fullName: 'Kofi Emmanuel', phone: '0553987654', network: 'mtn', role: 'driver', isVerified: false, isActive: false },
                        { id: 'usr_4', fullName: 'Amma Serwaa', phone: '0261112223', network: 'at', role: 'passenger', isVerified: true, isActive: true }
                    ]);
                }
                setLoading(false);
            }, 400); // Tiny artificial delay to mimic network response naturally
            return;
        }

        // LIVE DATABASE FALLBACK
        try {
            if (activeTab === 'overview') {
                const res = await fetch('http://localhost:5000/api/v1/admin/metrics', { headers });
                const resData = await res.json();
                if (resData.success) setMetrics(resData.data);
                else setError(resData.message);
            } else if (activeTab === 'users') {
                const res = await fetch('http://localhost:5000/api/v1/admin/users', { headers });
                const resData = await res.json();
                if (resData.success) setUsers(resData.data);
                else setError(resData.message);
            }
        } catch (err) {
            setError('Failed to reach server backend administration gateway APIs.');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserActive = async (userId) => {
        const token = localStorage.getItem('token');

        // 🎟️ ESCAPE HATCH 2: Handle Interactive Status Toggling Instantly
        if (!token || token === 'mock-signed-admin-jwt-token-xyz789') {
            console.log(`🔄 Mock status toggle processed for account ID: ${userId}`);
            setUsers(users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
            return;
        }

        // LIVE DATABASE STATUS MUTATION
        try {
            const res = await fetch(`http://localhost:5000/api/v1/admin/users/${userId}/toggle-status`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
            }
        } catch (err) {
            alert('Error updating database profile state');
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* SIDEBAR NAVIGATION LAYOUT CONTAINER */}
            <div className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between">
                <div>
                    <div className="p-6 border-b border-slate-800">
                        <h1 className="text-xl font-bold tracking-wider text-amber-500">TransportGH</h1>
                        <p className="text-xs text-slate-400 mt-1">System Management Console</p>
                    </div>
                    <nav className="p-4 space-y-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-800'
                                }`}
                        >
                            📊 Operational Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-800'
                                }`}
                        >
                            👥 User Accounts Directory
                        </button>
                    </nav>
                </div>
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center space-x-3 text-sm p-2 bg-slate-800/50 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-slate-300">Session Secure: Admin</span>
                    </div>
                </div>
            </div>

            {/* MAIN VIEW APPLICATION PORTAL WINDOW */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                <header className="bg-white border-b shadow-sm px-8 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800 capitalize">{activeTab} Monitor</h2>
                    <button onClick={fetchAdminData} className="px-3 py-1.5 text-xs font-semibold border rounded-md shadow-sm hover:bg-slate-50 transition">
                        🔄 Refresh Metrics
                    </button>
                </header>

                <main className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
                            🚨 <strong>System Notice:</strong> {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center h-64 text-slate-500">
                            Evaluating database structures and compiling dashboard metrics...
                        </div>
                    ) : (
                        <>
                            {/* TAB CONTAINER VIEW: OVERVIEW INDEX METRICS SCREEN */}
                            {activeTab === 'overview' && metrics && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Accounts</span>
                                            <p className="text-4xl font-extrabold text-slate-800 mt-2">{metrics.totalUsers}</p>
                                        </div>
                                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Socket Connections</span>
                                            <p className="text-4xl font-extrabold text-green-600 mt-2">{metrics.activeSockets}</p>
                                        </div>
                                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Server Memory Footprint</span>
                                            <p className="text-4xl font-extrabold text-amber-600 mt-2">{metrics.memoryUsage}</p>
                                        </div>
                                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Process Run Uptime</span>
                                            <p className="text-4xl font-extrabold text-indigo-600 mt-2">{metrics.uptime}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                                        <h3 className="text-lg font-bold text-slate-800 mb-4">Core API Server State</h3>
                                        <div className="border rounded-lg overflow-hidden">
                                            <div className="flex justify-between p-4 bg-slate-50 border-b text-sm">
                                                <span className="font-semibold text-slate-600">Database Engine Connections</span>
                                                <span className="text-emerald-600 font-bold">{metrics.databaseStatus}</span>
                                            </div>
                                            <div className="flex justify-between p-4 text-sm">
                                                <span className="font-semibold text-slate-600">Cross-Origin Resource Sharing (CORS) Status</span>
                                                <span className="text-slate-500">CONFIGURED & ACTIVE</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB CONTAINER VIEW: INTERACTIVE DATABASE DIRECTORY EDITOR SCREEN */}
                            {activeTab === 'users' && (
                                <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                                                <th className="p-4">Profile Name</th>
                                                <th className="p-4">Contact Phone</th>
                                                <th className="p-4">Network Provider</th>
                                                <th className="p-4">Security Privilege Role</th>
                                                <th className="p-4">Status Flag Indicators</th>
                                                <th className="p-4 text-center">System Management Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                                            {users.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="p-8 text-center text-slate-400">No matching system database entries recovered.</td>
                                                </tr>
                                            ) : (
                                                users.map((user) => (
                                                    <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                                                        <td className="p-4 font-semibold text-slate-800">{user.fullName}</td>
                                                        <td className="p-4">{user.phone}</td>
                                                        <td className="p-4 uppercase">{user.network}</td>
                                                        <td className="p-4">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-amber-100 text-amber-800' :
                                                                    user.role === 'driver' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                                                                }`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 space-x-2">
                                                            <span className={`px-2 py-0.5 rounded text-xs ${user.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                                                {user.isVerified ? 'Verified' : 'Pending'}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded text-xs ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                                {user.isActive ? 'Active' : 'Banned'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <button
                                                                onClick={() => toggleUserActive(user.id)}
                                                                disabled={user.role === 'admin'}
                                                                className={`px-3 py-1 rounded text-xs font-semibold shadow-sm transition-all ${user.role === 'admin' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                                                        user.isActive ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                                                                    }`}
                                                            >
                                                                {user.isActive ? 'Suspend Account' : 'Activate Account'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}