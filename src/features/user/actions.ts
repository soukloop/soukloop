"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleFollowAction(followingId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("You must be logged in to follow users");
        }

        const followerId = session.user.id;

        if (followerId === followingId) {
            throw new Error("You cannot follow yourself");
        }

        // Check if relationship exists
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        if (existingFollow) {
            // Unfollow
            await prisma.follow.delete({
                where: {
                    id: existingFollow.id,
                },
            });
            revalidatePath("/userprofile");
            return { success: true, following: false };
        } else {
            // Follow
            await prisma.follow.create({
                data: {
                    followerId,
                    followingId,
                },
            });

            // Notify the user being followed
            const { notifyNewFollower } = await import('@/lib/notifications/templates/social-templates');
            await notifyNewFollower(followingId, followerId).catch(err =>
                console.error('[Follow Action] Notification failed:', err)
            );

            revalidatePath("/userprofile");
            return { success: true, following: true };
        }
    } catch (error: any) {
        console.error("Follow action error:", error);
        return { success: false, error: error.message };
    }
}

export async function updateProfileBannerAction(url: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) throw new Error("User not found");

        const allowedRoles = ['SELLER', 'ADMIN', 'SUPER_ADMIN'];
        if (!allowedRoles.includes(user.role)) {
            throw new Error("You do not have permission to update the banner");
        }

        await prisma.userProfile.upsert({
            where: { userId: user.id },
            update: { bannerImage: url },
            create: { userId: user.id, bannerImage: url }
        });

        revalidatePath("/userprofile");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
