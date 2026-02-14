import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await context.params;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Fetch followers and following users
        const followers = await prisma.follow.findMany({
            where: { followingId: userId },
            include: {
                follower: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        profile: {
                            select: {
                                avatar: true
                            }
                        }
                    }
                }
            }
        });

        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        profile: {
                            select: {
                                avatar: true
                            }
                        }
                    }
                }
            }
        });

        // Map to a cleaner format
        const formattedFollowers = followers.map(f => ({
            id: f.follower.id,
            name: f.follower.name,
            email: f.follower.email,
            image: f.follower.profile?.avatar || f.follower.image
        }));

        const formattedFollowing = following.map(f => ({
            id: f.following.id,
            name: f.following.name,
            email: f.following.email,
            image: f.following.profile?.avatar || f.following.image
        }));

        return NextResponse.json({
            followers: formattedFollowers,
            following: formattedFollowing,
            followersCount: formattedFollowers.length,
            followingCount: formattedFollowing.length
        });

    } catch (error: any) {
        console.error("Error fetching follows:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
