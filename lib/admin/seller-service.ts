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
    status = 'ACTIVE' // Default to active vendors
}: SellerFilterParams): Promise<PaginatedSellersResult> {
    const skip = (page - 1) * pageSize;

    // --- STRATEGY: SPLIT QUERY ---
    // "PENDING" -> Query UserVerification (Applicants)
    // "ALL" / "ACTIVE" / "SUSPENDED" -> Query Vendor (Existing Sellers)

    if (status === 'PENDING') {
        const where: Prisma.UserVerificationWhereInput = {
            status: 'submitted',
            user: {
                vendor: null // Only those who are not yet vendors
            }
        };

        if (search) {
            where.user = {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ]
            };
        }

        const [total, applicants] = await prisma.$transaction([
            prisma.userVerification.count({ where }),
            prisma.userVerification.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { submittedAt: 'desc' },
                include: {
                    user: {
                        include: {
                            profile: true
                        }
                    }
                }
            })
        ]);

        const formattedApplicants = applicants.map(app => ({
            id: app.userId, // Use User ID for navigation, same as vendors
            dbId: app.id,   // Verification ID (for actions if needed)
            name: app.user.name || (app.user.profile ? `${app.user.profile.firstName} ${app.user.profile.lastName}` : 'Unknown Applicant'),
            email: app.user.email,
            storeName: 'N/A (Applicant)', // No store name yet
            productsCount: 0,
            status: 'Pending',
            joinedDate: (app.submittedAt || app.createdAt).toISOString().split('T')[0],
            avatar: app.user.profile?.avatar || app.user.image || null,
            isApplicant: true
        }));

        return {
            sellers: formattedApplicants,
            total,
            totalPages: Math.ceil(total / pageSize),
            currentPage: page,
            pageSize
        };

    } else {
        // --- QUERY VENDORS ---
        const where: Prisma.VendorWhereInput = {};

        // Status Filter
        if (status === 'ACTIVE') {
            where.kycStatus = 'APPROVED'; // Assuming APPROVED = Active
        } else if (status === 'SUSPENDED') {
            where.kycStatus = 'REJECTED'; // Or logic for suspended? Using REJECTED for now based on context, or if there's an isActive flag?
            // Checking prisma schema from previous files: Vendor has kycStatus. User has isActive.
            // Let's stick to kycStatus for now.
        }
        // "ALL" includes everything in Vendor table

        if (search) {
            where.OR = [
                {
                    user: {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                }
            ];
        }

        const [total, vendors] = await prisma.$transaction([
            prisma.vendor.count({ where }),
            prisma.vendor.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        include: {
                            profile: true
                        }
                    },
                    _count: {
                        select: { products: true }
                    }
                }
            })
        ]);

        const formattedVendors = vendors.map(vendor => ({
            id: vendor.userId, // User ID for navigation
            dbId: vendor.id,   // Vendor ID
            name: vendor.user.name || (vendor.user.profile ? `${vendor.user.profile.firstName} ${vendor.user.profile.lastName}` : 'Unknown'),
            email: vendor.user.email,
            storeName: 'N/A', // Removed storeName field
            productsCount: vendor._count.products,
            status: !vendor.user.isActive
                ? 'Suspended'
                : (vendor.kycStatus === 'APPROVED' ? 'Active' : vendor.kycStatus === 'PENDING' ? 'Pending' : 'Suspended'),
            joinedDate: vendor.createdAt.toISOString().split('T')[0],
            avatar: vendor.user.profile?.avatar || vendor.user.image || null,
            isApplicant: false
        }));

        return {
            sellers: formattedVendors,
            total,
            totalPages: Math.ceil(total / pageSize),
            currentPage: page,
            pageSize
        };
    }
}
