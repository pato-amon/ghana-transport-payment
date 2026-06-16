// frontend/src/pages/passenger/WalletPage.jsx
import React from 'react';
import { useQuery } from 'react-query';
import paymentService from '../../services/paymentService';
import TransactionCard from '../../components/shared/TransactionCard';
import BalanceCard from '../../components/passenger/BalanceCard';

const WalletPage = () => {
    const { data: wallet, isLoading } = useQuery('wallet', paymentService.getWallet);
    const { data: txData } = useQuery('transactions',
        () => paymentService.getTransactions({ limit: 20 })
    );

    return (
        <div className="pb-24 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white px-5 pt-14 pb-4 border-b">
                <h1 className="font-display font-bold text-xl text-gray-900">My Wallet</h1>
            </div>

            <div className="px-5 py-5 space-y-5">
                {/* Balance */}
                <BalanceCard
                    balance={wallet?.data?.balance || 0}
                    pendingBalance={wallet?.data?.pendingBalance || 0}
                    loading={isLoading}
                />

                {/* Claim Balance Button */}
                {wallet?.data?.pendingBalance > 0 && (
                    <button className="btn-secondary">
                        💰 Claim GHS {wallet.data.pendingBalance.toFixed(2)} Balance
                    </button>
                )}

                {/* Transactions */}
                <div>
                    <h2 className="font-bold text-gray-900 mb-3">All Transactions</h2>
                    <div className="space-y-3">
                        {txData?.data?.map((tx) => (
                            <TransactionCard key={tx.id} transaction={tx} />
                        ))}
                        {!txData?.data?.length && (
                            <div className="card text-center py-10">
                                <p className="text-4xl mb-2">💳</p>
                                <p className="text-gray-500">No transactions yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;