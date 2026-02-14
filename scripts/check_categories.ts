
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.product.groupBy({
        by: ['category'],
        _count: { category: true }
    });

    const genders = await prisma.product.groupBy({
        by: ['gender'],
        _count: { gender: true }
    });

    const dresses = await prisma.product.groupBy({
        by: ['dress'],
        _count: { dress: true }
    });

    console.log('Categories:', categories);
    console.log('Genders:', genders);
    console.log('Dresses (Styles):', dresses.slice(0, 10)); // Just 10
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
