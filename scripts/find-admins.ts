
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Searching for potential Admin/SuperAdmin users...');

    const users = await prisma.user.findMany({
        where: {
            OR: [
                { role: 'SUPER_ADMIN' },
                { role: 'ADMIN' },
                { email: { contains: 'admin' } },
                { name: { contains: 'Admin' } }
            ]
        },
        include: {
            profile: true,
            vendor: true
        }
    });

    console.log(`Found ${users.length} potential users:`);
    users.forEach(u => {
        console.log(`- ID: ${u.id}`);
        console.log(`  Email: ${u.email}`);
        console.log(`  Name: ${u.name}`);
        console.log(`  Role: ${u.role}`);
        console.log(`  Profile: ${u.profile ? '✅' : '❌'}`);
        console.log(`  Vendor: ${u.vendor ? '✅' : '❌'}`);
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
