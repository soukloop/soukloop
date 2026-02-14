
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking DressStyles...');
    const styles = await prisma.dressStyle.findMany({
        take: 20,
        select: { name: true, categoryType: true, status: true }
    });
    console.log('Found styles:', styles);

    const womenStyles = await prisma.dressStyle.findMany({
        where: { categoryType: 'Women' }
    });
    console.log('Women styles count:', womenStyles.length);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
