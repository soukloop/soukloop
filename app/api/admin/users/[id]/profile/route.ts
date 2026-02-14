import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-wrapper';
import { verifyAdminAuth } from '@/lib/admin/auth-utils';
import { decrypt, decryptAsync } from '@/lib/encryption'

// Helper to resolve generic ID to User ID
// Helper to resolve generic ID to User ID
// Helper to resolve generic ID to User ID
async function resolveUserId(id: string) {
    if (!id) return null;

    try {
        // Optimization: 99% of the time, the ID passed is the User ID.
        // Check User table first to avoid unnecessary DB load on other tables.
        const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
        if (user) return user.id;

        // Fallback: Check Vendor and Verification only if User not found
        // We can run these in parallel as they are rare fallbacks
        const results = await Promise.allSettled([
            prisma.vendor.findUnique({ where: { id }, select: { userId: true } }),
            prisma.userVerification.findUnique({ where: { id }, select: { userId: true } })
        ]);

        const vendor = results[0].status === 'fulfilled' ? results[0].value : null;
        const verification = results[1].status === 'fulfilled' ? results[1].value : null;

        if (vendor && vendor.userId) return vendor.userId;
        if (verification && verification.userId) return verification.userId;
    } catch (error) {
        console.error('Error resolving user ID:', error);
    }

    return null;
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const start = performance.now();
    try {
        const { id } = await context.params
        console.log(`[Perf] Start GET /profile for ${id}`);

        const t1 = performance.now();
        const authResult = await verifyAdminAuth(request);
        console.log(`[Perf] Auth check: ${(performance.now() - t1).toFixed(2)}ms`);

        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const t2 = performance.now();
        const resolvedId = await resolveUserId(id);
        console.log(`[Perf] ID Resolution: ${(performance.now() - t2).toFixed(2)}ms`);

        if (!resolvedId) {
            return NextResponse.json({ error: 'User not found for the provided ID' }, { status: 404 })
        }

        const t3 = performance.now();
        let profile = await prisma.userProfile.findUnique({
            where: { userId: resolvedId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        role: true,
                        isActive: true, // Required for status badge
                        createdAt: true,
                        customerOrders: {
                            orderBy: { createdAt: 'desc' },
                            take: 20
                        },
                        userVerifications: {
                            orderBy: { createdAt: 'desc' }
                        },
                        vendor: true,
                        addresses: true,
                        profile: true
                    }
                }
            }
        })
        console.log(`[Perf] Main DB Query: ${(performance.now() - t3).toFixed(2)}ms`);

        let userResponse: any = profile;

        // If no profile, fetch user and simulate structure
        if (!profile) {
            const t4 = performance.now();
            const user = await prisma.user.findUnique({
                where: { id: resolvedId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    userVerifications: {
                        orderBy: { createdAt: 'desc' }
                    },
                    vendor: true,
                    addresses: true,
                    profile: true
                }
            })
            console.log(`[Perf] Fallback DB Query: ${(performance.now() - t4).toFixed(2)}ms`);

            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

            // Construct a response that matches the profile-first structure or valid user fallback
            // To minimize frontend breakage, we'll try to return the User object if profile is missing,
            // but the frontend expects { user: ... } wrapper if it was a profile.
            // Let's stick to the current contract: return Profile object which contains User.
            // If profile missing, return object with user property?

            userResponse = {
                userId: user.id, // minimal profile fields
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || '',
                email: user.email,
                phone: null,
                avatar: user.image,
                user: user
            }
        }

        // DECRYPTION LOGIC - REMOVED for "Decrypt on Demand"
        // The UI will request decryption only when the user explicitly clicks "Show".
        // This removes the 2-3s pbkdf2 blocking overhead from the initial page load.
        // console.log(`[Perf] Decryption: ${(performance.now() - t5).toFixed(2)}ms`); // t5 removed

        console.log(`[Perf] Total Duration: ${(performance.now() - start).toFixed(2)}ms`);

        return NextResponse.json(userResponse)
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const resolvedId = await resolveUserId(id);
        if (!resolvedId) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const body = await request.json()
        const { firstName, lastName, phone, bio, avatar } = body

        const profile = await prisma.userProfile.upsert({
            where: { userId: resolvedId },
            update: {
                firstName,
                lastName,
                phone,
                bio,
                avatar
            },
            create: {
                userId: resolvedId,
                firstName,
                lastName,
                phone,
                bio,
                avatar
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        role: true,
                        isActive: true, // Required for status badge
                        createdAt: true,
                        customerOrders: {
                            orderBy: { createdAt: 'desc' },
                            take: 20
                        },
                        userVerifications: {
                            orderBy: { createdAt: 'desc' }
                        },
                        vendor: true,
                        addresses: true,
                        profile: true
                    }
                }
            }
        })

        // Also update Main User table if name changed
        if (firstName || lastName) {
            await prisma.user.update({
                where: { id: resolvedId },
                data: {
                    name: `${firstName || ''} ${lastName || ''}`.trim(),
                    image: avatar
                }
            })
        }

        return NextResponse.json(profile)
    } catch (error) {
        return handleApiError(error);
    }
}
