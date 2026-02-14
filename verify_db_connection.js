const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres:password@127.0.0.1:5435/soukloop_db',
        },
    },
});

async function main() {
    try {
        await prisma.$connect();
        console.log('Successfully connected to the database with 127.0.0.1');
        const userCount = await prisma.user.count();
        console.log(`User count: ${userCount}`);
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
