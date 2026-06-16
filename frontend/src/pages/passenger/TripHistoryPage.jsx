// frontend/src/pages/passenger/TripHistoryPage.jsx
import React from 'react';
import { useQuery } from 'react-query';
import paymentService from '../../services/paymentService';
import TransactionCard from '../../components/shared/TransactionCard';

const TripHistoryPage = () => {
    const { data, isLoading } = useQuery(
        'trip-history',
        () => paymentService.getTransactions({ type: 'FARE_PAYMENT', limit: 50 })
    );

    return (
        <div className="pb-24 bg-gray-50 min-h-screen">
            <div className="bg-white px-5 pt-14 pb-4 border-b">
                <h1 className="font-display font-bold text-xl text-gray-900">Trip History</h1>
            </div>

            <div className="px-5 py-5">
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="card h-20 animate-pulse bg-gray-200" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data?.data?.map((tx) => (
                            <TransactionCard key={tx.id} transaction={tx} />
                        ))}
                        {!data?.data?.length && (
                            <div className="card text-center py-16">
                                <p className="text-5xl mb-3">🚌</p>
                                <p className="font-bold text-gray-900">No trips yet</p>
                                <p className="text-gray-500 text-sm mt-1">
                                    Pay your first fare to see history
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TripHistoryPage;