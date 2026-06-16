// frontend/src/pages/passenger/PayFarePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import usePaymentStore from '../../store/paymentStore';
import paymentService from '../../services/paymentService';
import { MOMO_PROVIDERS, CURRENCY } from '../../utils/constants';
import toast from 'react-hot-toast';

const PayFarePage = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const updateBalance = useAuthStore((state) => state.updateBalance);
    const setPendingPayment = usePaymentStore((state) => state.setPendingPayment);

    // Form States
    const [amount, setAmount] = useState('');
    const [momoNumber, setMomoNumber] = useState(user?.phone || '');
    const [provider, setProvider] = useState(MOMO_PROVIDERS.MTN.id);
    const [vehicleCode, setVehicleCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async (e) => {
        e.preventDefault();

        // Validation
        const fareAmount = parseFloat(amount);
        if (isNaN(fareAmount) || fareAmount <= 0) {
            return toast.error('Please enter a valid fare amount');
        }

        let formattedPhone = momoNumber.trim();
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '+233' + formattedPhone.substring(1);
        }

        setIsLoading(true);
        const loadingToast = toast.loading('Sending MoMo prompt to your phone...');

        try {
            // 1. Send request to your backend -> Moolre API
            const payload = {
                amount: fareAmount,
                phoneNumber: formattedPhone,
                provider: provider,
                vehicleCode: vehicleCode.trim().toUpperCase()
            };

            const response = await paymentService.initializePayment(payload);

            // 2. Save tracking info to Zustand payment store
            setPendingPayment({
                transactionId: response.transactionId,
                amount: fareAmount,
                vehicleCode: payload.vehicleCode
            });

            toast.success('Prompt sent! Enter your PIN on your phone to authorize.', { id: loadingToast });

            // 3. Poll for status or redirect passenger to a processing/success screen
            // For now, let's simulate a successful response and update the local store balance
            if (user?.walletBalance !== undefined) {
                // If they are topping up or deducting, adjust accordingly. 
                // Let's assume this example is paying a fare from their MoMo wallet directly.
                updateBalance(user.walletBalance - fareAmount);
            }

            navigate('/passenger/history');

        } catch (error) {
            toast.error(error.message || 'Payment initiation failed. Try again.', { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Pay Transit Fare</h2>
                <p style={styles.subtitle}>Instant mobile money checkout via Moolre</p>

                <form onSubmit={handlePayment} style={styles.form}>
                    {/* Vehicle/Trotro Code */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Vehicle / Conductor Code</label>
                        <input
                            type="text"
                            placeholder="e.g. GR-203-26"
                            required
                            value={vehicleCode}
                            onChange={(e) => setVehicleCode(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    {/* Fare Amount */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Fare Amount (GHS)</label>
                        <div style={styles.amountWrapper}>
                            <span style={styles.currencySymbol}>{CURRENCY.symbol}</span>
                            <input
                                type="number"
                                step="0.10"
                                placeholder="0.00"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                style={styles.amountInput}
                            />
                        </div>
                    </div>

                    {/* Network Provider Selector */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Select MoMo Network</label>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            style={styles.select}
                        >
                            <option value={MOMO_PROVIDERS.MTN.id}>{MOMO_PROVIDERS.MTN.name}</option>
                            <option value={MOMO_PROVIDERS.VODAFONE.id}>{MOMO_PROVIDERS.VODAFONE.name}</option>
                            <option value={MOMO_PROVIDERS.AIRTELTIGO.id}>{MOMO_PROVIDERS.AIRTELTIGO.name}</option>
                        </select>
                    </div>

                    {/* Phone Number Field */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>MoMo Phone Number</label>
                        <input
                            type="tel"
                            placeholder="024XXXXXXX"
                            required
                            value={momoNumber}
                            onChange={(e) => setMomoNumber(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    {/* Pay Button */}
                    <button type="submit" disabled={isLoading} style={styles.button}>
                        {isLoading ? 'Processing...' : `Pay ${amount ? CURRENCY.format(amount) : ''}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', padding: '40px 20px', minHeight: '80vh', backgroundColor: '#f7fafc', fontFamily: 'system-ui, sans-serif' },
    card: { backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '100%', maxWidth: '460px', height: 'fit-content' },
    title: { margin: '0 0 4px 0', color: '#1a202c', fontSize: '24px', fontWeight: 'bold' },
    subtitle: { margin: '0 0 24px 0', color: '#718096', fontSize: '14px' },
    form: { display: 'flex', flexDirection: 'column', gap: '18px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '14px', fontWeight: '600', color: '#4a5568' },
    input: { padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '16px', outline: 'none' },
    select: { padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '16px', backgroundColor: '#fff', outline: 'none' },
    amountWrapper: { display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' },
    currencySymbol: { padding: '12px', backgroundColor: '#edf2f7', color: '#4a5568', fontWeight: 'bold' },
    amountInput: { padding: '12px', border: 'none', flex: 1, fontSize: '16px', outline: 'none' },
    button: { backgroundColor: '#006643', color: '#ffffff', padding: '14px', borderRadius: '6px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s', marginTop: '10px' }
};

export default PayFarePage;