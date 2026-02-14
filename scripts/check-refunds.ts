import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const refunds = await prisma.refund.findMany({
        include: {
            order: true
        }
    });
    console.log(`Total refunds found: ${refunds.length}`);
    refunds.forEach(r => {
        console.log(`- ID: ${r.id}, Status: ${r.status}, Order #: ${r.order.orderNumber}, Amount: ${r.amount}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
