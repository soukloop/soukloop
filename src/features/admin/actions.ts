"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { centrifugoPublish } from "@/lib/centrifugo";
import { invalidateUserSessions } from "@/lib/session";

/**
 * Checks if the current user has admin privileges.
 */
async function checkAdmin() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") { // Adjust roles as per your schema
        throw new Error("Unauthorized: Admin access required");
    }
    return session.user.id;
}

export async function suspendUser(userId: string) {
    try {
        console.log(`[DEBUG] suspendUser called for userId: ${userId}`);

        await checkAdmin();

        // 1. Safety Check: Check for active orders
        const activeOrders = await prisma.order.findFirst({
            where: {
                vendor: { userId: userId },
                status: {
                    in: ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED']
                }
            }
        });

        if (activeOrders) {
            return {
                success: false,
                error: "Cannot suspend seller with active orders. Please handle (Ship/Cancel/Refund) all active orders before suspending the account."
            };
        }

        // 2. Transactional Update: User, Vendor, and Products
        const [user] = await prisma.$transaction([
            // Lock User account
            prisma.user.update({
                where: { id: userId },
                data: { isActive: false },
            }),
            // Deactivate Vendor profile
            prisma.vendor.updateMany({
                where: { userId: userId },
                data: { isActive: false }
            }),
            // Hide all products immediately as BLOCKED (Admin-initiated)
            prisma.product.updateMany({
                where: { vendor: { userId: userId } },
                data: {
                    isActive: false,
                    status: 'BLOCKED'
                }
            })
        ]);

        console.log(`[DEBUG] User ${userId}, Vendor, and Products updated to inactive`);

        revalidatePath("/admin/users");
        revalidatePath(`/admin/users/${userId}`);
        revalidatePath("/"); // Revalidate Home Page to remove products
        revalidatePath("/products"); // Revalidate Search Page

        // 🚀 Real-time Signal: Force Logout
        await centrifugoPublish(`personal:${userId}`, {
            type: "ACCOUNT_SUSPENDED",
            message: "Your account has been suspended by an administrator.",
            timestamp: new Date().toISOString()
        });
        console.log(`[DEBUG] Centrifugo signal sent for ${userId}`);

        // ➤ EMAIL NOTIFICATION
        console.log('[DEBUG] suspendUser: Attempting to import notification template');
        const { notifyAccountSuspended } = await import('@/lib/notifications/templates/auth-templates');

        console.log('[DEBUG] suspendUser: Notification template imported, calling notifyAccountSuspended');
        const result = await notifyAccountSuspended(userId, user.name || undefined).catch(err => {
            console.error('Failed to send suspension email:', err);
            return null;
        });
        console.log('[DEBUG] notifyAccountSuspended result:', result);

        return { success: true, message: "User suspended successfully" };
    } catch (error: any) {
        console.error("Failed to suspend user:", error);
        return { success: false, error: error.message };
    }
}

export async function activateUser(userId: string) {
    try {
        await checkAdmin();

        const [user] = await prisma.$transaction([
            // Unlock User account
            prisma.user.update({
                where: { id: userId },
                data: { isActive: true },
            }),
            // Reactivate Vendor profile
            prisma.vendor.updateMany({
                where: { userId: userId },
                data: { isActive: true }
            }),
            // Reactivate all products as ACTIVE
            prisma.product.updateMany({
                where: { vendor: { userId: userId } },
                data: {
                    isActive: true,
                    status: 'ACTIVE'
                }
            })
        ]);

        revalidatePath("/admin/users");
        revalidatePath(`/admin/users/${userId}`);

        // 🚀 Real-time Signal: Notify Activation
        await centrifugoPublish(`personal:${userId}`, {
            type: "ACCOUNT_ACTIVATED",
            message: "Your account has been reactivated.",
            timestamp: new Date().toISOString()
        });

        // ➤ EMAIL NOTIFICATION
        const { notifyAccountReactivated } = await import('@/lib/notifications/templates/auth-templates');
        await notifyAccountReactivated(userId, user.name || undefined).catch(err =>
            console.error('Failed to send activation email:', err)
        );

        return { success: true, message: "User activated successfully" };
    } catch (error: any) {
        console.error("Failed to activate user:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteUser(userId: string) {
    try {
        await checkAdmin();

        // Get user info before deletion for email
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true }
        });

        // 1. Invalidate sessions first
        await invalidateUserSessions(userId, 'Account deleted by Admin');

        // 2. Delete user
        await prisma.user.delete({
            where: { id: userId },
        });

        revalidatePath("/admin/users");

        // 3. Real-time Signal via Centrifugo (Best effort)
        await centrifugoPublish(`personal:${userId}`, {
            type: "ACCOUNT_SUSPENDED", // Force logout effect
            message: "Your account has been deleted.",
            timestamp: new Date().toISOString()
        });

        // ➤ EMAIL NOTIFICATION (Post-deletion using captured email)
        if (user?.email) {
            const { notifyAccountDeleted } = await import('@/lib/notifications/templates/auth-templates');
            await notifyAccountDeleted(user.email, user.name || undefined).catch(err =>
                console.error('Failed to send deletion email:', err)
            );
        }

        return { success: true, message: "User deleted successfully" };
    } catch (error: any) {
        console.error("Failed to delete user:", error);
        return { success: false, error: error.message };
    }
}
