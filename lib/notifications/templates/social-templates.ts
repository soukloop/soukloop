import { createNotification } from '../create-notification'
import { prisma } from '@/lib/prisma'

export async function notifyNewFollower(
    followedUserId: string,
    followerUserId: string
) {
    // 1. Fetch Follower Details
    const follower = await prisma.user.findUnique({
        where: { id: followerUserId },
        select: {
            name: true,
            image: true,
            id: true
        }
    });

    if (!follower) {
        console.error(`[Notification] Follower ${followerUserId} not found.`);
        return;
    }

    // 2. Render Email Template
    const { render } = await import('@react-email/render');
    const { NewFollowerEmail } = await import('@/lib/email-templates/social/new-follower');

    const emailHtml = await render(
        NewFollowerEmail({
            followerName: follower.name || 'A User',
            followerImage: follower.image || undefined,
            profileUrl: `${process.env.NEXTAUTH_URL}/seller/${follower.id}` // Assuming seller profile route
        })
    );

    // 3. Create Notification
    return createNotification({
        userId: followedUserId,
        type: 'NEW_FOLLOWER',
        title: 'New Follower! 🎉',
        message: `${follower.name || 'Someone'} started following you.`,
        data: { followerId: follower.id },
        actionUrl: `/seller/${follower.id}`,
        sendEmail: true,
        emailSubject: `New Follower: ${follower.name || 'SoukLoop User'}`,
        emailHtml
    });
}
