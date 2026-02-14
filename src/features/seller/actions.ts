'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Validates that the current user is a vendor and owns the product.
 */
async function validateProductOwnership(productId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id }
    });
    if (!vendor) throw new Error("Vendor profile not found");

    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, vendorId: true }
    });

    if (!product) throw new Error("Product not found");
    if (product.vendorId !== vendor.id) throw new Error("Permission denied");

    return { session, vendor, product };
}

export async function deleteProductAction(productId: string) {
    try {
        await validateProductOwnership(productId);

        await prisma.product.delete({
            where: { id: productId }
        });

        revalidatePath('/seller/manage-listings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateProductStatusAction(productId: string, status: string) {
    try {
        await validateProductOwnership(productId);

        // Map status to isActive if needed
        const isActive = status !== 'INACTIVE';

        await prisma.product.update({
            where: { id: productId },
            data: {
                status: status,
                isActive: isActive
            }
        });

        revalidatePath('/seller/manage-listings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function acceptOrderAction(orderId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");

        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id }
        });
        if (!vendor) throw new Error("Vendor profile not found");

        // Use findFirst because orderId is the unique identifier, but we want to ensure it belongs to this vendor
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                vendorId: vendor.id
            }
        });

        if (!order) throw new Error("Order not found or access denied");

        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'PROCESSING' }
        });

        revalidatePath('/seller/dashboard');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
