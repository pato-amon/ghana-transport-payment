// frontend/src/pages/auth/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { ROLES, CURRENCY } from '../../utils/constants';

const LoginPage = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
    const setToken = useAuthStore((state) => state.setToken);

    // Form states
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(ROLES.PASSENGER); // Default to passenger
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Basic formatting validation for local numbers
        let formattedPhone = phoneNumber.trim();
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '+233' + formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith('+233')) {
            setError('Please enter a valid Ghana phone number');
            setIsLoading(false);
            return;
        }

        try {
            // Mock API Call - Replace this with your actual fetch/axios call to services/api
            // const response = await authService.login({ phone: formattedPhone, password, role });

            // Simulating a minor network latency delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Mock Data Output simulating a database response
            const mockUser = {
                id: 'usr_abc123',
                fullName: 'Kwame Mensah',
                phone: formattedPhone,
                role: role,
                walletBalance: 45.50 // Pre-populating balance in GHS
            };
            const mockToken = 'mock-jwt-token-xyz789';

            // Save credentials to Zustand global store
            setToken(mockToken);
            setUser(mockUser);

            // Redirect dynamically based on the role logging in
            if (role === ROLES.CONDUCTOR) {
                navigate('/conductor');
            } else if (role === ROLES.OPERATOR) {
                navigate('/operator');
            } else {
                navigate('/passenger'); // Standard passenger home
            }

        } catch (err) {
            setError(err.message || 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Ghana Transit Pay</h2>
                    <p style={styles.subtitle}>Secure Bus & Trotro Digital Payments</p>
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Role Selection Tabs */}
                    <div style={styles.roleGroup}>
                        <label style={styles.label}>Are you a Passenger or Crew?</label>
                        <div style={styles.tabContainer}>
                            <button
                                type="button"
                                style={{ ...styles.tab, ...(role === ROLES.PASSENGER ? styles.activeTab : {}) }}
                                onClick={() => setRole(ROLES.PASSENGER)}
                            >
                                Passenger
                            </button>
                            <button
                                type="button"
                                style={{ ...styles.tab, ...(role === ROLES.CONDUCTOR ? styles.activeTab : {}) }}
                                onClick={() => setRole(ROLES.CONDUCTOR)}
                            >
                                Conductor
                            </button>
                        </div>
                    </div>

                    {/* Phone Input */}
                    <div style={styles.inputGroup}>
                        <label htmlFor="phone" style={styles.label}>Phone Number</label>
                        <div style={styles.phoneInputWrapper}>
                            <span style={styles.prefix}>+233</span>
                            <input
                                id="phone"
                                type="tel"
                                placeholder="24XXXXXXX"
                                required
                                value={phoneNumber.replace('+233', '')}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                style={styles.phoneInput}
                            />
                        </div>
                        <small style={styles.hint}>Enter your registered MoMo mobile number</small>
                    </div>

                    {/* Password Input */}
                    <div style={styles.inputGroup}>
                        <label htmlFor="password" style={styles.label}>Password / PIN</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    {/* Submit Button */}
                    <button type="submit" disabled={isLoading} style={styles.submitBtn}>
                        {isLoading ? 'Verifying Credentials...' : 'Login to Account'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p>Don't have an account? <Link to="/register" style={styles.link}>Register here</Link></p>
                </div>
            </div>
        </div>
    );
};

// Inline styles to guarantee code compiles nicely without extra CSS files
const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f6f8', padding: '20px', fontFamily: 'system-ui, sans-serif' },
    card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' },
    header: { textAlign: 'center', marginBottom: '30px' },
    title: { color: '#1a365d', margin: '0 0 5px 0', fontSize: '28px', fontWeight: 'bold' },
    subtitle: { color: '#718096', margin: '0', fontSize: '14px' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '14px', fontWeight: '600', color: '#4a5568' },
    input: { padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '16px', outline: 'none' },
    phoneInputWrapper: { display: 'flex', border: '1px solid #cbd5e0', borderRadius: '6px', overflow: 'hidden', fontSize: '16px' },
    prefix: { backgroundColor: '#edf2f7', padding: '12px', borderRight: '1px solid #cbd5e0', color: '#4a5568', fontWeight: 'bold' },
    phoneInput: { padding: '12px', border: 'none', outline: 'none', flex: 1, fontSize: '16px' },
    hint: { fontSize: '11px', color: '#a0aec0', marginTop: '2px' },
    roleGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    tabContainer: { display: 'flex', gap: '10px', backgroundColor: '#edf2f7', padding: '4px', borderRadius: '8px' },
    tab: { flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', backgroundColor: 'transparent', color: '#718096', transition: 'all 0.2s' },
    activeTab: { backgroundColor: '#ffffff', color: '#1a365d', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    submitBtn: { backgroundColor: '#1a365d', color: '#ffffff', padding: '14px', borderRadius: '6px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s', marginTop: '10px' },
    errorBox: { backgroundColor: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '6px', fontSize: '14px', border: '1px solid #fed7d7', textAlign: 'center' },
    footer: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#718096' },
    link: { color: '#3182ce', textDecoration: 'none', fontWeight: '600' }
};

export default LoginPage;