import { createNotification } from '../create-notification';
import { ProfileUpdateEmail } from '@/lib/email-templates/account/profile-update';

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * Send profile update notification
 */
export async function notifyProfileUpdated(
    userId: string,
    userName: string,
    updateType: 'Profile Info' | 'Password' | 'Address' | 'Settings'
) {
    const time = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    return createNotification({
        userId,
        type: 'ACCOUNT_UPDATED',
        title: `${updateType} Updated`,
        message: `Your account ${updateType.toLowerCase()} was updated successfully.`,
        actionUrl: '/editprofile',
        sendEmail: true,
        emailSubject: `Your SoukLoop ${updateType} was updated`,
        emailReact: ProfileUpdateEmail({
            userName,
            updateType,
            updateTime: time,
            actionUrl: `${baseUrl}/editprofile`
        })
    });
}
