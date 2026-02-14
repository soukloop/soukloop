
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
    {
        name: 'Women',
        slug: 'women',
        description: 'Clothing, shoes, and accessories for women',
        status: 'Active',
    },
    {
        name: 'Men',
        slug: 'men',
        description: 'Clothing and accessories for men',
        status: 'Active',
    },
    {
        name: 'Kids',
        slug: 'kids',
        description: 'Clothing and essentials for children',
        status: 'Active',
    },
];

async function main() {
    console.log('Seeding categories...');

    for (const cat of categories) {
        const existing = await prisma.category.findUnique({
            where: { slug: cat.slug },
        });

        if (!existing) {
            await prisma.category.create({
                data: cat,
            });
            console.log(`Created category: ${cat.name}`);
        } else {
            console.log(`Category ${cat.name} already exists`);
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
