const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const refunds = await prisma.refund.findMany({
            include: {
                order: true
            }
        });
        console.log(`Total refunds found: ${refunds.length}`);
        refunds.forEach(r => {
            console.log(`- ID: ${r.id}, Status: ${r.status}, Order #: ${r.order?.orderNumber}, Amount: ${r.amount}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
