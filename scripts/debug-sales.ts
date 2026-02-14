
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const log = (msg: string) => {
        console.log(msg);
        fs.appendFileSync('debug-output.txt', msg + '\n');
    };
    fs.writeFileSync('debug-output.txt', ''); // Clear file

    log('--- Order Status Counts ---');
    const orders = await prisma.order.groupBy({
        by: ['status'],
        _count: {
            _all: true
        }
    });
    log(JSON.stringify(orders, null, 2));

    log('\n--- Recent PAID/DELIVERED/PROCESSING Orders ---');
    const recentOrders = await prisma.order.findMany({
        where: {
            status: { in: ['PAID', 'DELIVERED', 'PROCESSING'] }
        },
        take: 5,
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            category: true,
                            dress: true,
                            name: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' } // Make sure we get the latest
    });

    if (recentOrders.length === 0) {
        log("No orders found with status PAID, DELIVERED, or PROCESSING.");
    } else {
        log(`Found ${recentOrders.length} recent orders.`);
    }

    for (const order of recentOrders) {
        log(`Order ${order.orderNumber} (Status: ${order.status}, Total: ${order.total}, CreatedAt: ${order.createdAt})`);
        if (!order.items || order.items.length === 0) {
            log(' - No items in this order.');
        }
        for (const item of order.items) {
            log(` - Item: ${item.product?.name}`);
            log(`   Category: '${item.product?.category}'`);
            log(`   Dress Style: '${item.product?.dress}'`);
        }
    }

    log('\n--- Product Category Samples ---');
    const products = await prisma.product.findMany({
        take: 20,
        select: { category: true, dress: true },
        distinct: ['category', 'dress']
    });
    log(JSON.stringify(products, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        fs.appendFileSync('debug-output.txt', `Error: ${e.toString()}`);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
