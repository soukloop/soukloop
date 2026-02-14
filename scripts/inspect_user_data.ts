
import { prisma } from '../lib/prisma';

async function inspectUser() {
    const email = 'munibrehman326@gmail.com';
    console.log(`Inspecting user: ${email}`);

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                profile: true,
                accounts: true,
                sessions: true,
                addresses: true,
                notificationPrefs: true,
                permissions: true,
                userVerifications: true,
                vendor: true, // Check if they are a vendor
            }
        });

        if (!user) {
            console.log('User NOT FOUND.');
        } else {
            console.log('User Found:');
            console.log(JSON.stringify(user, null, 2));

            // Check if password exists (indicates credentials user)
            if (user.password) {
                console.log('HAS PASSWORD: YES');
            } else {
                console.log('HAS PASSWORD: NO');
            }
        }

        // Check verification tokens
        const tokens = await prisma.verificationToken.findMany({
            where: { identifier: email }
        });
        console.log('Verification Tokens:', JSON.stringify(tokens, null, 2));

    } catch (error) {
        console.error('Error querying DB:', error);
    } finally {
        await prisma.$disconnect();
    }
}

inspectUser();
