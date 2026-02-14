// Force update
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

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string; addressId: string }> }
) {
    try {
        const { id, addressId } = await context.params

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
                    where: { userId: resolvedId, isShipping: true, id: { not: addressId } },
                    data: { isDefault: false }
                })
            }
            if (body.isBilling) {
                await prisma.address.updateMany({
                    where: { userId: resolvedId, isBilling: true, id: { not: addressId } },
                    data: { isDefault: false }
                })
            }
        }

        const address = await prisma.address.update({
            where: { id: addressId },
            data: body
        })

        return NextResponse.json(address)
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string; addressId: string }> }
) {
    try {
        const { id, addressId } = await context.params

        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const resolvedId = await resolveUserId(id);
        if (!resolvedId) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Prevent deleting last business address? (Optional logic)

        await prisma.address.delete({
            where: { id: addressId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return handleApiError(error);
    }
}
