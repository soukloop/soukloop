
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking recent users...');

    const users = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            accounts: true,
            sessions: true
        }
    });

    console.log(`Found ${users.length} recent users:`);
    users.forEach(u => {
        console.log(`- ID: ${u.id}`);
        console.log(`  Email: ${u.email}`);
        console.log(`  Name: ${u.name}`);
        console.log(`  Role: ${u.role}`);
        console.log(`  Accounts: ${u.accounts.length} (${u.accounts.map(a => a.provider).join(', ')})`);
        console.log(`  Sessions: ${u.sessions.length}`);
        console.log(`  Default Token Version: ${u.tokenVersion}`);
        console.log('---');
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
