import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getProfilePayload(userIdOrUsername?: string) {
    const session = await auth();
    const currentUserId = session?.user?.id;

    // If no userIdOrUsername is provided, use the current session's user ID
    const targetIdOrUsername = userIdOrUsername || currentUserId;

    if (!targetIdOrUsername) return null;

    try {
        // First try finding user by ID
        let user = await prisma.user.findUnique({
            where: { id: targetIdOrUsername },
            include: {
                profile: true,
                vendor: {
                    select: {
                        id: true,
                        kycStatus: true,
                        isActive: true,
                        averageRating: true,
                        reviewCount: true,
                        createdAt: true,
                    }
                },
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        reviews: true,
                    }
                },
                userVerifications: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        // If not found by ID, try finding by username
        if (!user) {
            user = await prisma.user.findUnique({
                where: { username: targetIdOrUsername },
                include: {
                    profile: true,
                    vendor: {
                        select: {
                            id: true,
                            kycStatus: true,
                            isActive: true,
                            averageRating: true,
                            reviewCount: true,
                            createdAt: true,
                        }
                    },
                    _count: {
                        select: {
                            followers: true,
                            following: true,
                            reviews: true,
                        }
                    },
                    userVerifications: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            });
        }

        if (!user) return null;
        const profile = user;

        const targetUserId = user.id;

        // Execute remaining queries in parallel
        const [categories, brands, materials, occasions, dressStyles, followRecord] = await Promise.all([
            prisma.category.findMany({
                where: { status: "Active" },
                select: { id: true, name: true, slug: true },
                orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
            }),

            // 3. Brands (from dedicated Brand table - OPTIMIZED)
            prisma.brand.findMany({
                select: { id: true, name: true, slug: true },
                orderBy: { name: 'asc' }
            }),

            // 4. Materials/Fabrics (from dedicated Material table - NEW)
            prisma.material.findMany({
                select: { id: true, name: true, slug: true },
                orderBy: { name: 'asc' }
            }),

            // 5. Occasions (from dedicated Occasion table - NEW)
            prisma.occasion.findMany({
                select: { id: true, name: true, slug: true },
                orderBy: { name: 'asc' }
            }),

            // 6. Dress Styles
            prisma.dressStyle.findMany({
                where: { status: 'approved' },
                select: { id: true, name: true, categoryType: true },
                orderBy: { name: 'asc' }
            }),

            // 7. Follow Check (conditional)
            currentUserId && currentUserId !== targetUserId
                ? prisma.follow.findUnique({
                    where: {
                        followerId_followingId: {
                            followerId: currentUserId,
                            followingId: targetUserId,
                        }
                    }
                })
                : Promise.resolve(null)
        ]);

        if (!profile) return null;

        const verification = profile.userVerifications?.[0] || null;

        return {
            user: {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                image: profile.image,
                createdAt: profile.createdAt,
            },
            profile: profile.profile,
            vendor: profile.vendor,
            verification: verification,
            filters: {
                categories,
                brands,
                materials,
                occasions,
                dressStyles,
            },
            stats: {
                followers: profile._count.followers,
                following: profile._count.following,
                reviews: profile._count.reviews,
                productsCount: 0,
            },
            isOwner: currentUserId === targetUserId,
            isFollowing: !!followRecord,
        };
    } catch (error) {
        console.error("Error fetching profile payload:", error);
        return null;
    }
}
