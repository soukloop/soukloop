import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { withAuth } from '@/lib/api-wrapper'
import { auth } from "@/auth" // Kept for type inference inside handler if needed, though withAuth handles check.

const profileUpdateSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
    bannerImage: z.string().optional()
})

export const GET = withAuth(async (request: any) => {
    try {
        const session = await auth()
        // withAuth guarantees session exists here

        // Smart Resolution:
        // AdminUser ID != User ID, but Email is the shared key.
        const userRecord = await prisma.user.findUnique({
            where: { email: session?.user?.email ?? '' }
        })

        if (!userRecord) {
            return NextResponse.json(
                { error: 'User profile not found' },
                { status: 404 }
            )
        }
        const userId = userRecord.id

        const profile = await prisma.userProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        image: true,
                        role: true,
                        rewardBalance: true,
                        createdAt: true,
                        vendor: {
                            select: {
                                planTier: true
                            }
                        }
                    }
                }
            }
        })

        if (!profile) {
            // Create profile if it doesn't exist
            const newProfile = await prisma.userProfile.create({
                data: {
                    userId: session!.user!.id!
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            image: true,
                            role: true,
                            rewardBalance: true,
                            createdAt: true,
                            vendor: {
                                select: {
                                    planTier: true
                                }
                            }
                        }
                    }
                }
            })
            return NextResponse.json(newProfile)
        }

        return NextResponse.json(profile)

    } catch (error) {
        console.error('Profile GET error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
})

export const PUT = withAuth(async (request: any) => {
    try {
        const session = await auth()
        const body = await request.json()
        const validationResult = profileUpdateSchema.safeParse(body)

        if (!validationResult.success) {
            console.error('Profile Update Validation Error:', JSON.stringify(validationResult.error.flatten(), null, 2));
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const data = validationResult.data

        const userRecord = await prisma.user.findUnique({
            where: { email: session?.user?.email ?? '' }
        })

        if (!userRecord) {
            return NextResponse.json(
                { error: 'User record not found' },
                { status: 404 }
            )
        }
        const targetUserId = userRecord.id

        const profile = await prisma.userProfile.upsert({
            where: { userId: targetUserId },
            update: { ...data },
            create: { userId: targetUserId, ...data },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        image: true,
                        role: true,
                        rewardBalance: true,
                        createdAt: true,
                        vendor: {
                            select: {
                                planTier: true
                            }
                        }
                    }
                }
            }
        })

        if (data.firstName !== undefined || data.lastName !== undefined) {
            const firstName = data.firstName ?? profile.firstName ?? '';
            const lastName = data.lastName ?? profile.lastName ?? '';
            const fullName = `${firstName} ${lastName}`.trim();

            if (fullName) {
                await prisma.user.update({
                    where: { id: targetUserId },
                    data: { name: fullName }
                })
            }
        }

        // Return the profile (which includes the User relation with potentially old name, 
        // but we updated it. Ideally fetch fresh, but for speed return what we have or fetch fresh if critical.)
        // Original code fetched fresh.
        const freshProfile = await prisma.userProfile.findUnique({
            where: { userId: targetUserId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        image: true,
                        role: true,
                        rewardBalance: true,
                        createdAt: true,
                        vendor: {
                            select: {
                                planTier: true
                            }
                        }
                    }
                }
            }
        })

        // Notify user about profile update
        const { notifyProfileUpdated } = await import('@/lib/notifications/templates/account-templates');
        const userName = freshProfile?.user?.name || freshProfile?.firstName || 'User';

        // Dont await to not block response
        notifyProfileUpdated(targetUserId, userName, 'Profile Info').catch(err =>
            console.error('Failed to send profile update notification:', err)
        );

        return NextResponse.json(freshProfile)

    } catch (error: any) {
        console.error('Profile PUT error:', error)
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error.message
            },
            { status: 500 }
        )
    }
})

export const PATCH = PUT;
