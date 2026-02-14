const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting cleanup of invalid blob video URLs...');

    const products = await prisma.product.findMany({
        where: {
            video: {
                startsWith: 'blob:'
            }
        },
        select: {
            id: true,
            name: true,
            video: true
        }
    });

    console.log(`Found ${products.length} products with invalid video URLs.`);

    for (const product of products) {
        console.log(`Cleaning product: ${product.name} (${product.id}) - URL: ${product.video}`);
        await prisma.product.update({
            where: { id: product.id },
            data: { video: null }
        });
    }

    console.log('Cleanup complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
