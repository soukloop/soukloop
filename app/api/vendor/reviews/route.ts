import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-wrapper'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get Vendor ID
        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id },
            select: { id: true }
        })

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
        }

        // Fetch reviews for products belonging to this vendor
        const reviews = await prisma.review.findMany({
            where: {
                product: {
                    vendorId: vendor.id
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        images: {
                            take: 1,
                            select: { url: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Verify if averageRating in Vendor model is accurate or calculate it on the fly?
        // Vendor model has averageRating. We can return it or just letting frontend calculate from reviews if needed.
        // But for "My Reviews", usually we just want the list. 
        // We can also fetch the stats.

        const vendorStats = await prisma.vendor.findUnique({
            where: { id: vendor.id },
            select: { averageRating: true, reviewCount: true }
        })

        return NextResponse.json({
            reviews,
            stats: vendorStats
        })

    } catch (error) {
        return handleApiError(error);
    }
}
