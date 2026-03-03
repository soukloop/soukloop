import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await context.params

        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        // Fetch user with profile and vendor
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,
                profile: {
                    select: {
                        avatar: true
                    }
                },
                vendor: {
                    select: {
                        logo: true,
                        planTier: true
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Count user's products (listings)
        const productsCount = await prisma.product.count({
            where: {
                vendor: {
                    userId: userId
                }
            }
        })

        // Count active products
        const activeAdsCount = await prisma.product.count({
            where: {
                vendor: {
                    userId: userId
                },
                isActive: true
            }
        })

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.profile?.avatar || user.vendor?.logo || user.image, // Priority: Profile Avatar -> Vendor Logo -> Account Image
            createdAt: user.createdAt,
            productsCount,
            activeAdsCount,
            planTier: user.vendor?.planTier
        })

    } catch (error) {
        console.error('User profile GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
