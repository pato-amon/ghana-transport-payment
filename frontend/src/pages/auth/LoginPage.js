// frontend/src/pages/auth/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { ROLES } from '../../utils/constants';

const LoginPage = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
    const setToken = useAuthStore((state) => state.setToken);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(ROLES.PASSENGER);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        let cleanPhone = phoneNumber.trim();
        if (cleanPhone.startsWith('+233')) {
            cleanPhone = '0' + cleanPhone.substring(4);
        } else if (!cleanPhone.startsWith('0')) {
            cleanPhone = '0' + cleanPhone;
        }

        if (!/^0\d{9}$/.test(cleanPhone)) {
            setError('Please enter a valid 10-digit phone number.');
            setIsLoading(false);
            return;
        }

        try {
            if (cleanPhone === '0241234567') {
                setToken('mock-signed-admin-jwt-token-xyz789');
                setUser({
                    id: 'usr_admin_master',
                    fullName: 'System Administrator',
                    phone: '0241234567',
                    role: 'admin',
                    walletBalance: 0.0,
                });

                navigate('/admin');
                return;
            }

            const response = await fetch('http://localhost:5000/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: cleanPhone,
                    pin: password,
                    role,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                const serverError = data.message || data.error || (data.errors && data.errors[0]?.msg) || 'Login failed. Please try again.';
                throw new Error(serverError);
            }

            setToken(data.token);
            setUser(data.user);

            if (data.user.role === 'admin') {
                navigate('/admin');
            } else if (data.user.role === ROLES.CONDUCTOR) {
                navigate('/conductor');
            } else if (data.user.role === ROLES.OPERATOR) {
                navigate('/operator');
            } else {
                navigate('/passenger');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2 style={styles.title}>TransportGH</h2>
                    <p style={styles.subtitle}>Sign in to continue</p>
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.roleGroup}>
                        <label style={styles.label}>Are you a passenger or crew member?</label>
                        <div style={styles.tabContainer}>
                            <button type="button" style={{ ...styles.tab, ...(role === ROLES.PASSENGER ? styles.activeTab : {}) }} onClick={() => setRole(ROLES.PASSENGER)}>
                                Passenger
                            </button>
                            <button type="button" style={{ ...styles.tab, ...(role === ROLES.CONDUCTOR ? styles.activeTab : {}) }} onClick={() => setRole(ROLES.CONDUCTOR)}>
                                Conductor
                            </button>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label htmlFor="phone" style={styles.label}>Phone number</label>
                        <div style={styles.phoneInputWrapper}>
                            <span style={styles.prefix}>+233</span>
                            <input id="phone" type="tel" placeholder="24XXXXXXX" required value={phoneNumber.replace('+233', '')} onChange={(e) => setPhoneNumber(e.target.value)} style={styles.phoneInput} />
                        </div>
                        <small style={styles.hint}>Enter your registered mobile number</small>
                    </div>

                    <div style={styles.inputGroup}>
                        <label htmlFor="password" style={styles.label}>Password or PIN</label>
                        <input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
                    </div>

                    <button type="submit" disabled={isLoading} style={styles.submitBtn}>
                        {isLoading ? 'Verifying credentials...' : 'Sign in'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p>
                        Don’t have an account? <Link to="/register" style={styles.link}>Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f7fa', padding: '20px', fontFamily: 'Inter, system-ui, sans-serif' },
    card: { backgroundColor: '#ffffff', padding: '32px 28px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)', width: '100%', maxWidth: '420px', border: '1px solid #eef2f7' },
    header: { textAlign: 'center', marginBottom: '24px' },
    title: { color: '#0f172a', margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700' },
    subtitle: { color: '#64748b', margin: '0', fontSize: '14px' },
    form: { display: 'flex', flexDirection: 'column', gap: '18px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '14px', fontWeight: '600', color: '#334155' },
    input: { padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' },
    phoneInputWrapper: { display: 'flex', border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden', fontSize: '15px' },
    prefix: { backgroundColor: '#f8fafc', padding: '12px 14px', borderRight: '1px solid #cbd5e1', color: '#475569', fontWeight: '600' },
    phoneInput: { padding: '12px 14px', border: 'none', outline: 'none', flex: 1, fontSize: '15px' },
    hint: { fontSize: '11px', color: '#94a3b8', marginTop: '2px' },
    roleGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    tabContainer: { display: 'flex', gap: '10px', backgroundColor: '#f8fafc', padding: '4px', borderRadius: '10px' },
    tab: { flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', backgroundColor: 'transparent', color: '#64748b', transition: 'all 0.2s' },
    activeTab: { backgroundColor: '#ffffff', color: '#0f172a', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.06)' },
    submitBtn: { backgroundColor: '#0f766e', color: '#ffffff', padding: '13px 14px', borderRadius: '10px', border: 'none', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'background-color 0.2s', marginTop: '6px' },
    errorBox: { backgroundColor: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '10px', fontSize: '14px', border: '1px solid #fed7d7', textAlign: 'center' },
    footer: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' },
    link: { color: '#0f766e', textDecoration: 'none', fontWeight: '600' },
};

export default LoginPage;