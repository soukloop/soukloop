import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-wrapper";
import { notifySellerWelcome } from "@/lib/notifications/templates/auth-templates";

// POST /api/user/become-seller
// Changes user role to SELLER - This is permanent and cannot be reversed
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get current user
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { profile: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if already a seller or higher
        const { isAtLeastSeller } = await import("@/lib/roles");
        if (isAtLeastSeller(user.role)) {
            return NextResponse.json(
                { message: "Already a seller", success: true },
                { status: 200 }
            );
        }

        // Update user role to SELLER (permanent change)
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                role: "SELLER",
            },
            include: {
                profile: true,
            }
        });

        // Notify user about seller status
        await notifySellerWelcome(updatedUser.id, updatedUser.name || undefined).catch(console.error);

        return NextResponse.json({
            success: true,
            message: "Congratulations! You are now a seller.",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            }
        });

    } catch (error) {
        return handleApiError(error);
    }
}
