
import { prisma } from '@/lib/prisma';

async function main() {
    try {
        const userCount = await prisma.user.count();
        console.log(`[VERIFICATION] Total Users: ${userCount}`);

        const users = await prisma.user.findMany({ take: 5 });
        console.log('[VERIFICATION] Sample Users:', JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
