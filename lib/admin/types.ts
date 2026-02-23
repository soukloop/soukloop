// Admin Panel Type Definitions
// Centralized types extracted from the monolithic page.tsx

// ==================== AUTH TYPES ====================
export type AdminRoleType = 'SUPER_ADMIN' | 'ADMIN';

export interface AdminUser {
    id: string;
    email: string;
    name?: string;
    role: AdminRoleType;
    isActive?: boolean;
    isDeletable?: boolean;
    permissions: Record<string, string[]>;  // resource -> actions[]
    image?: string | null;
    createdAt?: string;
}


// ==================== USER MANAGEMENT ====================
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Seller' | 'User' | 'Admin' | 'SELLER' | 'USER' | 'ADMIN';
    lastActive: string;
    status: 'Active' | 'Suspended' | 'In Active' | 'Blocked';
    avatar?: string;
    isDeletable?: boolean;
}

// ==================== SELLER VERIFICATION ====================
export interface Seller {
    id: number;
    name: string;
    email: string;
    storeName: string;
    submittedOn: string;
    status: 'Approved' | 'Rejected' | 'Pending';
    phone?: string;
    address?: string;
    documents?: string[];
}

// ==================== PRODUCT MANAGEMENT ====================
export interface Product {
    id: string; // Changed to string for DB compatibility
    thumbnail: string;
    productName: string;
    sellerName: string;
    category: string;
    dressStyle?: string;
    dressStyleStatus?: string;
    hasPendingStyle?: boolean;
    submittedOn: string;
    status: 'Approved' | 'Rejected' | 'Pending' | 'Active' | 'Blocked';
    price?: number;
    description?: string;
}

// ==================== SUPPORT TICKETS ====================
export interface Ticket {
    id: string;
    userSeller?: string;
    subject?: string;
    createdOn?: string;
    lastUpdated?: string;
    assignedTo?: string;
    status?: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    statusColor?: string;
    priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
    messages?: TicketMessage[];
}

export interface TicketMessage {
    id: string;
    content: string;
    isFromAdmin: boolean;
    createdAt: string;
    userId?: string;
}

// ==================== TRANSACTIONS & PAYOUTS ====================
export interface Transaction {
    id: string;
    user: string;
    method: string;
    date: string;
    amount: string;
    status: 'Paid' | 'Pending' | 'Failed';
    color: string;
}

export interface Payout {
    id: string;
    seller: string;
    method: string;
    date: string;
    amount: string;
    status: 'Paid' | 'Pending' | 'Failed';
    color: string;
}

// ==================== CATEGORY MANAGEMENT ====================
export interface Category {
    id: string;
    name: string;
    description?: string;
    parent?: string;
    status: 'Active' | 'Inactive';
    banner?: string;
    productCount?: number;
}

// ==================== BANNER/PROMOTIONS ====================
export interface Banner {
    id: string;
    title: string;
    description: string;
    image: string;
    startDate: string;
    endDate: string;
    status: 'Active' | 'Scheduled' | 'Expired';
    link?: string;
}

// ==================== REPORTED ITEMS ====================
export interface ReportedItem {
    id: string;
    itemType: 'Product' | 'User' | 'Review';
    itemId: string;
    reportedBy: string;
    reason: string;
    reportedOn: string;
    status: 'Pending' | 'Reviewed' | 'Resolved';
}

// ==================== STATS CARDS ====================
export interface StatsCard {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: any; // Using any to support both string (legacy) and LucideIcon
    bgColor: string;
}

// ==================== SIDEBAR ====================
export interface SidebarItem {
    icon: any; // Using any to support both string (legacy) and LucideIcon
    label: string;
    href?: string;
    resource?: string;           // Permission resource name for filtering
    superAdminOnly?: boolean;    // If true, only visible to SuperAdmins
}

// ==================== SUPPORTER ====================


// ==================== CHART DATA ====================
export interface ChartDataPoint {
    name: string;
    value: number;
}

// ==================== FORM STATES ====================
export interface BannerFormData {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    image: File | null;
}

export interface CategoryFormData {
    banner: string;
    name: string;
    description: string;
    parent: string;
    status: string;
    existing: string;
}

// ==================== API RESPONSE TYPES ====================
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ApiError {
    error: string;
    details?: string;
}

// ==================== DASHBOARD STATS ====================
export interface MetricData {
    value: number;
    previousValue: number;
    percentageChange: number;
    trend: 'up' | 'down' | 'neutral';
}

export interface DashboardMetrics {
    totalUsers: MetricData;
    totalOrders: MetricData;
    revenueThisMonth: MetricData;
    platformEarnings: MetricData;
    activeSellers: MetricData;
    period: 'daily' | 'weekly';
    comparisonText: string;
}

export interface PendingActionsCount {
    pendingVendors: number;
    pendingReports: number;
    pendingPayouts: number;
    pendingRefunds: number;
}

export interface TopStyleData {
    id: string;
    name: string;
    category: string;
    value: number;
    count: number;
    image?: string | null;
    percentage: number;
}

export interface ListedStyleData {
    id: string;
    name: string;
    category: string;
    count: number;
    image?: string | null;
}

export interface PaginatedTopStyles {
    styles: TopStyleData[];
    total: number;
    page: number;
    totalPages: number;
}

export interface PaginatedListedStyles {
    styles: ListedStyleData[];
    total: number;
    page: number;
    totalPages: number;
}

export interface DashboardStats {
    metrics: DashboardMetrics;
    salesChart: { name: string; value: number }[];
    ordersChart: { name: string; value: number }[];
    pendingActions: PendingActionsCount;
    topSellingStyles: TopStyleData[]; // Kept for backward compatibility or replace entirely if updating page.tsx
    topListedStyles: ListedStyleData[];
    period?: 'daily' | 'weekly';
}

