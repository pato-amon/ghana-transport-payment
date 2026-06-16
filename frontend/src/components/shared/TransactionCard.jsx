// frontend/src/components/shared/TransactionCard.jsx
import React from 'react';
import { TRANSACTION_TYPES } from '../../utils/constants';

const TransactionCard = ({ transaction }) => {
    const isCredit = transaction.isCredit;
    const isFare = transaction.type === 'FARE_PAYMENT';

    const icons = {
        FARE_PAYMENT: '🚌',
        BALANCE_RETURN: '💰',
        WALLET_TOPUP: '➕',
        WITHDRAWAL: '💸',
        REFUND: '↩️',
    };

    const statusColors = {
        SUCCESS: 'text-green-600 bg-green-50',
        PENDING: 'text-yellow-600 bg-yellow-50',
        FAILED: 'text-red-600 bg-red-50',
    };

    return (
        <div className="card flex items-center gap-3">
            {/* Icon */}
            <div className="w-10 h-10 bg-gray-100 rounded-full 
                      flex items-center justify-center text-lg flex-shrink-0">
                {icons[transaction.type] || '💳'}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                    {transaction.description || transaction.type.replace('_', ' ')}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                    {transaction.reference} •{' '}
                    {new Date(transaction.createdAt).toLocaleDateString('en-GH', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
                {transaction.balanceReturned > 0 && (
                    <p className="text-green-600 text-xs font-medium mt-0.5">
                        +GHS {transaction.balanceReturned.toFixed(2)} returned to wallet
                    </p>
                )}
            </div>

            {/* Amount + Status */}
            <div className="text-right flex-shrink-0">
                <p className={`font-bold text-sm ${isCredit ? 'text-green-600' : 'text-gray-900'}`}>
                    {isCredit ? '+' : '-'}GHS {transaction.amount?.toFixed(2)}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium 
                         ${statusColors[transaction.status] || 'text-gray-500 bg-gray-100'}`}>
                    {transaction.status}
                </span>
            </div>
        </div>
    );
};

export default TransactionCard;