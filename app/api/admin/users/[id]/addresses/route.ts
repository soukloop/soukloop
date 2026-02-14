import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-wrapper';
import { verifyAdminAuth } from '@/lib/admin/auth-utils';


// Helper to resolve generic ID to User ID
async function resolveUserId(id: string) {
    if (!id) return null;

    // 1. Check if it's a direct User ID
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (user) return user.id;

    // 2. Check if it's a Vendor ID
    const vendor = await prisma.vendor.findUnique({ where: { id }, select: { userId: true } });
    if (vendor && vendor.userId) return vendor.userId;

    // 3. Check if it's a UserVerification ID
    const verification = await prisma.userVerification.findUnique({ where: { id }, select: { userId: true } });
    if (verification && verification.userId) return verification.userId;

    return null;
}

// GET Addresses
export async function GET(
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

        const addresses = await prisma.address.findMany({
            where: { userId: resolvedId },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(addresses)
    } catch (error) {
        return handleApiError(error);
    }
}

// CREATE Address
export async function POST(
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

        // Handle defaults
        if (body.isDefault) {
            // Reset other defaults
            if (body.isShipping) {
                await prisma.address.updateMany({
                    where: { userId: resolvedId, isShipping: true },
                    data: { isDefault: false }
                })
            }
            if (body.isBilling) {
                await prisma.address.updateMany({
                    where: { userId: resolvedId, isBilling: true },
                    data: { isDefault: false }
                })
            }
        }

        const address = await prisma.address.create({
            data: {
                ...body,
                userId: resolvedId
            }
        })

        return NextResponse.json(address)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
