// Admin Panel Constants
// Static configuration and data extracted from the monolithic page.tsx

import { SidebarItem, StatsCard } from './types';

import {
    LayoutDashboard,
    Users,
    Store,
    ShoppingBag,
    AlertTriangle,
    Menu as MenuIcon,
    FileText,
    RotateCcw,
    Tags,
    CreditCard,
    Settings,
    MessageSquare,
    Star,
    HelpCircle,
    ShieldAlert,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Box,
    Cloud
} from 'lucide-react';

// ==================== SIDEBAR NAVIGATION ====================
export const SIDEBAR_ITEMS: SidebarItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin", resource: "dashboard" },
    { icon: Users, label: "User Management", href: "/admin/users", resource: "users" },
    { icon: Store, label: "Seller Verification", href: "/admin/sellers", resource: "sellers" },
    { icon: ShoppingBag, label: "Product Approval", href: "/admin/products", resource: "products" },
    { icon: AlertTriangle, label: "Reported Items", href: "/admin/reports", resource: "reports" },
    { icon: MenuIcon, label: "Category Management", href: "/admin/categories", resource: "categories" },
    { icon: FileText, label: "Order Management", href: "/admin/orders", resource: "orders" },
    { icon: RotateCcw, label: "Returns & Refunds", href: "/admin/refunds", resource: "refunds" },
    { icon: Tags, label: "Promotions", href: "/admin/promotions", resource: "promotions" },
    { icon: CreditCard, label: "Transactions", href: "/admin/transactions", resource: "transactions" },
    { icon: Settings, label: "System Settings", href: "/admin/settings", resource: "settings" },
    { icon: MessageSquare, label: "Support Tickets", href: "/admin/support", resource: "support" },
    { icon: Star, label: "Testimonials", href: "/admin/testimonials", resource: "testimonials" },
    { icon: HelpCircle, label: "Help Line", href: "/admin/help", resource: "help" },
    { icon: ShieldAlert, label: "Sub-Admin Management", href: "/admin/subadmins", resource: "subadmins", superAdminOnly: true },
];

// ... (Months and Colors defined below, unchanged)

// ==================== MONTHS ====================
export const MONTHS = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
];

// ==================== STATUS COLORS ====================
export const USER_STATUS_COLORS: Record<string, string> = {
    'Active': 'bg-green-100 text-green-800',
    'Suspended': 'bg-red-100 text-red-800',
    'In Active': 'bg-yellow-100 text-yellow-800',
};

export const SELLER_STATUS_COLORS: Record<string, string> = {
    'Approved': 'bg-green-100 text-green-800',
    'Active': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Suspended': 'bg-red-100 text-red-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'blocked': 'bg-red-100 text-red-800', // Lowercase fallback
};

export const PRODUCT_STATUS_COLORS: Record<string, string> = {
    'Approved': 'bg-green-100 text-green-800',
    'Active': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Blocked': 'bg-red-100 text-red-800',
    'BLOCKED': 'bg-red-100 text-red-800',
    'Inactive': 'bg-gray-100 text-gray-800',
    'INACTIVE': 'bg-gray-100 text-gray-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'processing': 'bg-blue-100 text-blue-800',
    'shipped': 'bg-purple-100 text-purple-800',
    'delivered': 'bg-green-100 text-green-800',
    'paid': 'bg-green-100 text-green-800',
    'PAID': 'bg-green-100 text-green-800',
    'SOLD': 'bg-gray-100 text-gray-800',
    'sold': 'bg-gray-100 text-gray-800',
    'refunded': 'bg-orange-100 text-orange-800',
    'canceled': 'bg-red-100 text-red-800',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'PROCESSING': 'bg-blue-100 text-blue-800',
    'SHIPPED': 'bg-purple-100 text-purple-800',
    'DELIVERED': 'bg-green-100 text-green-800',
    'PAID': 'bg-green-100 text-green-800',
    'CANCELED': 'bg-red-100 text-red-800',
    'REFUNDED': 'bg-orange-100 text-orange-800',
};

export const TICKET_STATUS_COLORS: Record<string, string> = {
    'Open': 'bg-red-500',
    'In Progress': 'bg-orange-500',
    'Resolved': 'bg-green-500',
    'Closed': 'bg-gray-500',
};

export const TRANSACTION_STATUS_COLORS: Record<string, string> = {
    'Paid': 'bg-green-100 text-green-800',
    'completed': 'bg-green-100 text-green-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'SUCCEEDED': 'bg-green-100 text-green-800',
    'SUCCESS': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'Failed': 'bg-red-100 text-red-800',
    'failed': 'bg-red-100 text-red-800',
    'FAILED': 'bg-red-100 text-red-800',
    'Refunded': 'bg-blue-100 text-blue-800',
    'refunded': 'bg-blue-100 text-blue-800',
    'Processing': 'bg-blue-100 text-blue-800',
    'processing': 'bg-blue-100 text-blue-800',
    'PROCESSED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800',
};

export const REPORT_STATUS_COLORS: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Reviewed': 'bg-blue-100 text-blue-800',
    'Resolved': 'bg-green-100 text-green-800',
    'Dismissed': 'bg-gray-100 text-gray-800',
};

export const DRESS_STYLE_STATUS_COLORS: Record<string, string> = {
    'approved': 'bg-green-100 text-green-800',
    'active': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'rejected': 'bg-red-100 text-red-800',
    'suspended': 'bg-red-100 text-red-800',
};

// ==================== DEFAULT STATS CARDS ====================
export const DEFAULT_STATS_CARDS: StatsCard[] = [
    {
        title: "Total Users",
        value: "0",
        change: "0% from yesterday",
        changeType: "neutral",
        icon: Users,
        bgColor: "bg-purple-50"
    },
    {
        title: "Total Orders",
        value: "0",
        change: "0% from past week",
        changeType: "neutral",
        icon: Box,
        bgColor: "bg-yellow-50"
    },
    {
        title: "Revenue This Month",
        value: "$0",
        change: "0% change",
        changeType: "neutral",
        icon: TrendingUp,
        bgColor: "bg-green-50"
    },
    {
        title: "Active Sellers",
        value: "0",
        change: "0% from yesterday",
        changeType: "neutral",
        icon: Cloud,
        bgColor: "bg-pink-50"
    },
];

// ==================== SUPPORTERS (for assign modal) ====================


// ==================== PENDING ACTIONS ====================
export const PENDING_ACTIONS = [
    {
        id: 1,
        title: "Sellers to Verify",
        description: "5 new sellers waiting for verification",
        action: "Review",
        actionColor: "bg-red-500 hover:bg-red-600",
        href: "/admin/sellers"
    },
    {
        id: 2,
        title: "Products to Approve",
        description: "12 products pending moderation",
        action: "Approve",
        actionColor: "bg-yellow-500 hover:bg-yellow-600",
        href: "/admin/products"
    },
    {
        id: 3,
        title: "Reported Items",
        description: "3 new reports submitted",
        action: "Review",
        actionColor: "bg-red-500 hover:bg-red-600",
        href: "/admin/reports"
    },
    {
        id: 4,
        title: "Categories to Confirm",
        description: "1 category edit pending admin review",
        action: "Open",
        actionColor: "bg-teal-500 hover:bg-teal-600",
        href: "/admin/categories"
    },
    {
        id: 5,
        title: "Payout Requests",
        description: "4 payout requests from sellers",
        action: "Payouts",
        actionColor: "bg-teal-600 hover:bg-teal-700",
        href: "/admin/transactions"
    },
];

// ==================== PAGINATION ====================
export const DEFAULT_PAGE_SIZE = 5;
export const TRANSACTIONS_PAGE_SIZE = 3;
export const PAYOUTS_PAGE_SIZE = 4;

// ==================== FEATURED PRODUCTS (Demo Data) ====================
export const FEATURED_PRODUCTS = [
    { id: 1, name: "Women Tops", image: "/images/women-top.png", items: "1,076 items", date: "12.09.2019 - 12.53 PM", amount: "$34,295", status: "Sold" },
    { id: 2, name: "Leather Bag", image: "/images/leather-bag.png", items: "543 items", date: "12.09.2019 - 12.53 PM", amount: "$34,295", status: "Sold" },
    { id: 3, name: "Men Shoes", image: "/images/women-top.png", items: "271 items", date: "12.09.2019 - 12.53 PM", amount: "$34,295", status: "Sold" },
];
