import {
    Package,
    XCircle,
    CreditCard,
    AlertTriangle,
    DollarSign,
    CheckCircle,
    MessageSquare,
    Star,
    User,
    Gift,
    Bell
} from "lucide-react";
import React from "react";

export interface NotificationData {
    id: string;
    type: string;
    title: string;
    message: string;
    data: any;
    actionUrl?: string | null;
    isRead: boolean;
    createdAt: string;
}

// Helper to format time
export function formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

// Get icon and color based on notification type
export function getNotificationStyle(type: string): { icon: React.ReactNode; bgColor: string; iconColor: string } {
    switch (type) {
        // Order notifications
        case "ORDER_PLACED":
        case "ORDER_CONFIRMED":
        case "ORDER_PROCESSING":
        case "ORDER_SHIPPED":
        case "ORDER_DELIVERED":
            return { icon: <Package className="size-5" />, bgColor: "bg-blue-500", iconColor: "text-white" };
        case "ORDER_CANCELLED":
            return { icon: <XCircle className="size-5" />, bgColor: "bg-red-500", iconColor: "text-white" };

        // Payment notifications
        case "PAYMENT_SUCCESS":
            return { icon: <CreditCard className="size-5" />, bgColor: "bg-green-500", iconColor: "text-white" };
        case "PAYMENT_FAILED":
            return { icon: <AlertTriangle className="size-5" />, bgColor: "bg-red-500", iconColor: "text-white" };
        case "REFUND_REQUESTED":
        case "REFUND_PROCESSED":
            return { icon: <DollarSign className="size-5" />, bgColor: "bg-yellow-500", iconColor: "text-white" };
        case "REFUND_DEDUCTED":
            return { icon: <DollarSign className="size-5" />, bgColor: "bg-red-500", iconColor: "text-white" };

        // KYC notifications
        case "KYC_SUBMITTED":
        case "NEW_KYC_SUBMISSION":
            return { icon: <CheckCircle className="size-5" />, bgColor: "bg-purple-500", iconColor: "text-white" };
        case "KYC_APPROVED":
        case "dress_style_approved":
            return { icon: <CheckCircle className="size-5" />, bgColor: "bg-green-600", iconColor: "text-white" };
        case "KYC_REJECTED":
        case "KYC_INFO_NEEDED":
        case "dress_style_rejected":
            return { icon: <AlertTriangle className="size-5" />, bgColor: "bg-orange-500", iconColor: "text-white" };

        // Product notifications
        case "PRODUCT_APPROVED":
            return { icon: <CheckCircle className="size-5" />, bgColor: "bg-green-500", iconColor: "text-white" };
        case "PRODUCT_REJECTED":
        case "LOW_STOCK":
        case "OUT_OF_STOCK":
            return { icon: <AlertTriangle className="size-5" />, bgColor: "bg-orange-500", iconColor: "text-white" };

        // Account Status
        case "ACCOUNT_ACTIVATED":
            return { icon: <CheckCircle className="size-5" />, bgColor: "bg-green-500", iconColor: "text-white" };
        case "ACCOUNT_SUSPENDED":
            return { icon: <XCircle className="size-5" />, bgColor: "bg-red-600", iconColor: "text-white" };

        // Communication
        case "NEW_MESSAGE":
            return { icon: <MessageSquare className="size-5" />, bgColor: "bg-indigo-500", iconColor: "text-white" };
        case "NEW_REVIEW":
            return { icon: <Star className="size-5" />, bgColor: "bg-yellow-500", iconColor: "text-white" };
        case "NEW_FOLLOWER":
            return { icon: <User className="size-5" />, bgColor: "bg-pink-500", iconColor: "text-white" };

        // Points/Rewards
        case "POINTS_EARNED":
            return { icon: <Gift className="size-5" />, bgColor: "bg-purple-500", iconColor: "text-white" };
        case "PAYOUT_PROCESSED":
            return { icon: <DollarSign className="size-5" />, bgColor: "bg-green-600", iconColor: "text-white" };

        // Default
        default:
            return { icon: <Bell className="size-5" />, bgColor: "bg-[#E87A3F]", iconColor: "text-white" };
    }
}

// Helper to determine notification role (Buyer vs Seller)
export function getNotificationRole(notification: NotificationData): 'buyer' | 'seller' {
    const { type, title, actionUrl } = notification;

    // Safety checks for type and title
    const safeType = type || '';
    const safeTitle = title || '';

    // 1. Check strong type indicators
    if (
        safeType.startsWith('KYC_') ||
        safeType.startsWith('PRODUCT_') ||
        safeType.startsWith('dress_style_') ||
        ['LOW_STOCK', 'OUT_OF_STOCK', 'NEW_REVIEW', 'NEW_FOLLOWER', 'PAYOUT_PROCESSED', 'REFUND_DEDUCTED', 'NEW_KYC_SUBMISSION'].includes(safeType)
    ) {
        return 'seller';
    }

    // 2. Check actionUrl - Seller URLs usually contain /seller/
    if (actionUrl?.includes('/seller/')) {
        return 'seller';
    }

    // 3. Check title/message hints (for shared types like ORDER_PLACED or generic titles)
    const lowerTitle = safeTitle.toLowerCase();

    // "New Order Received!" -> Seller
    if (lowerTitle.includes('new order') || lowerTitle.includes('received') || lowerTitle.includes('process it')) {
        if (safeType === 'ORDER_PLACED') return 'seller';
    }

    // "Refund Deducted" -> Seller (Buyer gets "Refund Processed" or "Refunded")
    if (lowerTitle.includes('deducted') || safeType === 'REFUND_DEDUCTED') {
        return 'seller';
    }

    return 'buyer';
}

// Get action button based on notification type
export function getActionButton(notification: NotificationData): { text: string; link: string } | null {
    // If notification has actionUrl, use that
    if (notification.actionUrl) {
        const textMap: Record<string, string> = {
            "ORDER_PLACED": "View Order",
            "ORDER_SHIPPED": "Track Order",
            "ORDER_DELIVERED": "View Order",
            "KYC_APPROVED": "Start Selling",
            "KYC_REJECTED": "View Details",
            "KYC_SUBMITTED": "Check Status",
            "NEW_MESSAGE": "View Chat",
            "NEW_REVIEW": "View Review",
            "REFUND_PROCESSED": "View Details",
        };
        return { text: textMap[notification.type] || "View Details", link: notification.actionUrl };
    }

    // Fallback based on type
    switch (notification.type) {
        case "ORDER_PLACED":
        case "ORDER_CONFIRMED":
        case "ORDER_PROCESSING":
        case "ORDER_SHIPPED":
        case "ORDER_DELIVERED":
        case "ORDER_CANCELLED":
        case "PAYMENT_SUCCESS":
        case "REFUND_PROCESSED":
            return { text: "View Orders", link: "/edit-profile?section=my-orders" };

        case "KYC_APPROVED":
            return { text: "Start Selling", link: "/seller/dashboard" };
        case "KYC_REJECTED":
        case "KYC_INFO_NEEDED":
            return { text: "Update Application", link: "/seller/onboarding" };
        case "KYC_SUBMITTED":
            return { text: "Check Status", link: "/seller/status" };

        case "NEW_MESSAGE":
            return { text: "View Chats", link: "/chats" };
        case "NEW_REVIEW":
            return { text: "View Review", link: "/seller/dashboard" };
        case "NEW_FOLLOWER":
            return { text: "View Profile", link: "/profile" };

        case "PRODUCT_APPROVED":
        case "PRODUCT_REJECTED":
        case "LOW_STOCK":
        case "OUT_OF_STOCK":
            return { text: "Manage Products", link: "/seller/manage-listings" };

        case "POINTS_EARNED":
            return { text: "View Rewards", link: "/reward-points" };
        case "PAYOUT_PROCESSED":
            return { text: "View Earnings", link: "/seller/dashboard?tab=earnings" };

        case "REFUND_DEDUCTED":
            return { text: "View Orders", link: "/seller/dashboard?tab=orders" };

        case "ACCOUNT_ACTIVATED":
        case "ACCOUNT_SUSPENDED":
            return { text: "View Details", link: "/profile" };

        default:
            return null;
    }
}
