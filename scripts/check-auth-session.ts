
import { prisma } from './lib/prisma';

async function checkSession() {
    console.log('Checking for recent sessions...');
    const sessions = await prisma.session.findMany({
        take: 5,
        orderBy: { expires: 'desc' },
        include: { user: true }
    });

    if (sessions.length === 0) {
        console.log('No active sessions found in database.');
    } else {
        console.log(`Found ${sessions.length} active sessions:`);
        sessions.forEach(s => {
            console.log(`- User: ${s.user.email} (Expires: ${s.expires})`);
        });
    }
}

checkSession()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
