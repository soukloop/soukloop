import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type SellerFilterParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string | 'ALL' | 'PENDING' | 'ACTIVE' | 'SUSPENDED';
};

export type PaginatedSellersResult = {
    sellers: any[];
    total: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
};

export async function getPaginatedSellers({
    page = 1,
    pageSize = 10,
    search = '',
    status = 'ALL'
}: SellerFilterParams): Promise<PaginatedSellersResult> {
    const skip = (page - 1) * pageSize;

    // --- FILTERS ---
    const applicantWhere: Prisma.UserVerificationWhereInput = {
        status: 'submitted',
        user: { vendor: null }
    };

    const vendorWhere: Prisma.VendorWhereInput = {};
    if (status === 'ACTIVE') {
        vendorWhere.kycStatus = 'APPROVED';
    } else if (status === 'SUSPENDED') {
        vendorWhere.kycStatus = 'REJECTED'; // Matching existing logic
    }

    if (search) {
        const userSearch = {
            OR: [
                { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                { email: { contains: search, mode: 'insensitive' as Prisma.QueryMode } }
            ]
        };
        applicantWhere.user = { ...applicantWhere.user, ...userSearch };
        vendorWhere.user = userSearch;
    }

    // --- EXECUTION ---
    let total = 0;
    let sellers: any[] = [];

    if (status === 'PENDING') {
        const [count, applicants] = await prisma.$transaction([
            prisma.userVerification.count({ where: applicantWhere }),
            prisma.userVerification.findMany({
                where: applicantWhere,
                skip,
                take: pageSize,
                orderBy: { submittedAt: 'desc' },
                include: { user: { include: { profile: true } } }
            })
        ]);
        total = count;
        sellers = applicants.map(formatApplicant);
    } else if (status === 'ALL') {
        const [appCount, vendCount] = await prisma.$transaction([
            prisma.userVerification.count({ where: applicantWhere }),
            prisma.vendor.count({ where: vendorWhere })
        ]);
        total = appCount + vendCount;

        // Applicants first, then Vendors
        const appsToSkip = Math.min(skip, appCount);
        const appsToTake = Math.max(0, Math.min(pageSize, appCount - skip));

        const vendsToSkip = Math.max(0, skip - appCount);
        const vendsToTake = pageSize - appsToTake;

        const results = await prisma.$transaction([
            prisma.userVerification.findMany({
                where: applicantWhere,
                skip: appsToSkip,
                take: appsToTake,
                orderBy: { submittedAt: 'desc' },
                include: { user: { include: { profile: true } } }
            }),
            prisma.vendor.findMany({
                where: vendorWhere,
                skip: vendsToSkip,
                take: vendsToTake,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { include: { profile: true } },
                    _count: { select: { products: true } }
                }
            })
        ]);

        sellers = [
            ...results[0].map(formatApplicant),
            ...results[1].map(formatVendor)
        ];
    } else {
        // ACTIVE or SUSPENDED
        const [count, vendors] = await prisma.$transaction([
            prisma.vendor.count({ where: vendorWhere }),
            prisma.vendor.findMany({
                where: vendorWhere,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { include: { profile: true } },
                    _count: { select: { products: true } }
                }
            })
        ]);
        total = count;
        sellers = vendors.map(formatVendor);
    }

    return {
        sellers,
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        pageSize
    };
}

// --- HELPERS ---

function formatApplicant(app: any) {
    return {
        id: app.userId,
        dbId: app.id,
        name: app.user.name || (app.user.profile ? `${app.user.profile.firstName} ${app.user.profile.lastName}` : 'Unknown Applicant'),
        email: app.user.email,
        storeName: 'N/A (Applicant)',
        productsCount: 0,
        status: 'Pending',
        joinedDate: (app.submittedAt || app.createdAt).toISOString().split('T')[0],
        avatar: app.user.profile?.avatar || app.user.image || null,
        isApplicant: true
    };
}

function formatVendor(vendor: any) {
    return {
        id: vendor.userId,
        dbId: vendor.id,
        name: vendor.user.name || (vendor.user.profile ? `${vendor.user.profile.firstName} ${vendor.user.profile.lastName}` : 'Unknown'),
        email: vendor.user.email,
        storeName: 'N/A',
        productsCount: vendor._count.products,
        status: !vendor.user.isActive
            ? 'Suspended'
            : (vendor.kycStatus === 'APPROVED' ? 'Active' : vendor.kycStatus === 'PENDING' ? 'Pending' : 'Suspended'),
        joinedDate: vendor.createdAt.toISOString().split('T')[0],
        avatar: vendor.user.profile?.avatar || vendor.user.image || null,
        isApplicant: false
    };
}
