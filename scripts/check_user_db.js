const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userId = 'cmkf5l1u40000va3ok5i9xvqz';

    console.log(`Checking user: ${userId}`);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
    });

    if (user) {
        console.log('User FOUND:', JSON.stringify(user, null, 2));
    } else {
        console.log('User NOT found in User table.');
    }

    const profile = await prisma.userProfile.findUnique({
        where: { userId: userId }
    });

    if (profile) {
        console.log('UserProfile FOUND:', JSON.stringify(profile, null, 2));
    } else {
        console.log('UserProfile NOT found.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
