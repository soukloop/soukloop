const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const latestProduct = await prisma.product.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { name: true, price: true, createdAt: true, id: true }
        });
        console.log("LATEST_PRODUCT_DEBUG:", JSON.stringify(latestProduct, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
