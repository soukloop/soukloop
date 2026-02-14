
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DressStyles ---');
    const styles = await prisma.dressStyle.findMany({ take: 5 });
    console.log(JSON.stringify(styles, null, 2));

    console.log('--- Products ---');
    const products = await prisma.product.findMany({
        take: 5,
        select: { id: true, category: true, gender: true }
    });
    console.log(JSON.stringify(products, null, 2));

    console.log('--- Categories ---');
    const categories = await prisma.category.findMany();
    console.log(JSON.stringify(categories, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
