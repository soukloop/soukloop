import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = ["men", "women", "kids"];

async function main() {
    console.log('Fetching all products...');
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products.`);

    if (products.length === 0) {
        console.log('No products to update.');
        return;
    }

    console.log('Updating products with random category values...');
    let updatedCount = 0;

    for (const product of products) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        await prisma.product.update({
            where: { id: product.id },
            data: { category: randomCategory }
        });
        updatedCount++;
        console.log(`Updated product "${product.name}" with category: ${randomCategory}`);
    }

    console.log(`\n✅ Successfully updated ${updatedCount} products with category values.`);
}

main()
    .catch((e) => {
        console.error('Error updating products:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
