import { PrismaClient } from '@prisma/client';

async function main() {
    // Connect to SQLite
    const prisma = new PrismaClient({
        datasources: { db: { url: 'file:./prisma/dev.db' } }
    });

    try {
        console.log('\n=== DRESS STYLES IN SQLITE ===');
        const dressStyles = await prisma.dressStyle.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                categoryType: true,
                status: true,
            }
        });
        console.log(`Found ${dressStyles.length} dress styles:`);
        dressStyles.forEach(ds => {
            console.log(`  - ${ds.name} (${ds.categoryType}, status: ${ds.status})`);
        });

        console.log('\n=== PRODUCTS IN SQLITE ===');
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                price: true,
                category: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        console.log(`Found ${products.length} products:`);
        products.forEach(p => {
            console.log(`  - ${p.name} (${p.category}, $${p.price}, active: ${p.isActive})`);
        });

        console.log('\n=== USERS IN SQLITE ===');
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`  - ${u.email} (${u.role})`);
        });

    } catch (e: any) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
