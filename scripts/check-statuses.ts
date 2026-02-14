
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const statuses = await prisma.order.groupBy({
        by: ['status'],
        _count: {
            id: true
        }
    });

    console.log('Order Status Distribution:');
    console.log(JSON.stringify(statuses, null, 2));

    // Also check CustomerOrders
    const customerOrders = await prisma.customerOrder.count();
    console.log('Total CustomerOrders:', customerOrders);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
