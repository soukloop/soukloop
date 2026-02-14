"use client";

import { USER_STATUS_COLORS, SELLER_STATUS_COLORS, PRODUCT_STATUS_COLORS, TICKET_STATUS_COLORS, TRANSACTION_STATUS_COLORS, REPORT_STATUS_COLORS, DRESS_STYLE_STATUS_COLORS, ORDER_STATUS_COLORS } from '@/lib/admin/constants';

type StatusType = 'user' | 'seller' | 'product' | 'ticket' | 'transaction' | 'kyc' | 'report' | 'dressStyle' | 'order';

interface StatusBadgeProps {
    status: string;
    type?: StatusType;
    className?: string;
}

export default function StatusBadge({ status, type = 'user', className = '' }: StatusBadgeProps) {
    // Get the appropriate color mapping based on type
    const getColorClass = () => {
        switch (type) {
            case 'user':
                return USER_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
            case 'seller':
                return SELLER_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
            case 'product':
                return PRODUCT_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
            case 'ticket':
                // Ticket badges use solid background colors
                return TICKET_STATUS_COLORS[status] || 'bg-gray-500';
            case 'transaction':
                return TRANSACTION_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
            case 'report':
                return REPORT_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
            case 'dressStyle':
                return DRESS_STYLE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
            case 'order':
                return ORDER_STATUS_COLORS[status.toUpperCase()] || 'bg-gray-100 text-gray-800';
            case 'kyc':
                const kycColors: Record<string, string> = {
                    'incomplete': 'bg-gray-100 text-gray-800',
                    'submitted': 'bg-blue-100 text-blue-800',
                    'approved': 'bg-green-100 text-green-800',
                    'rejected': 'bg-red-100 text-red-800'
                };
                return kycColors[status] || 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Ticket badges have different styling (solid bg, white text)
    if (type === 'ticket') {
        return (
            <span
                className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium text-white ${getColorClass()} ${className}`}
            >
                {status}
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getColorClass()} ${className}`}
        >
            {status}
        </span>
    );
}
