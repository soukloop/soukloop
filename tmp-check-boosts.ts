import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const boosts = await prisma.productBoost.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
            product: { select: { id: true, name: true, isActive: true, status: true } }
        }
    });

    console.log(JSON.stringify(boosts, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
