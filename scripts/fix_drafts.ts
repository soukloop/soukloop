import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.product.updateMany({
        where: { status: 'DRAFT' },
        data: { isActive: false }
    });
    console.log(`Updated ${result.count} existing draft products to be inactive.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
