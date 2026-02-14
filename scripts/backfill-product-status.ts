
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting product status backfill...');

    // 1. Fetch all products with their order info to determine status
    // We process in batches to avoid memory issues
    const batchSize = 100;
    let skip = 0;
    let hasMore = true;
    let processedCount = 0;

    // Thresholds for PENDING logic
    const freshPendingThreshold = new Date(Date.now() - 15 * 60 * 1000);

    while (hasMore) {
        const products = await prisma.product.findMany({
            take: batchSize,
            skip: skip,
            include: {
                orderItems: {
                    where: {
                        order: {
                            OR: [
                                { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
                                {
                                    status: 'PENDING',
                                    createdAt: { gte: freshPendingThreshold }
                                }
                            ]
                        }
                    },
                    select: { id: true } // We just need to know if any exist
                }
            }
        });

        if (products.length === 0) {
            hasMore = false;
            break;
        }

        // Prepare updates
        const updates = products.map(async (product) => {
            let newStatus = 'ACTIVE';

            const hasActiveOrder = product.orderItems.length > 0;

            if (!product.isActive) {
                newStatus = 'INACTIVE';
            } else if (hasActiveOrder) {
                // If it has an active order, it's effectively SOLD/PROCESSING
                newStatus = 'SOLD';
            } else if (product.quantity === 0) {
                newStatus = 'SOLD';
            }

            // Only update if different (though for first run, everything is 'ACTIVE' by default so we mainly check for SOLD/INACTIVE)
            if (newStatus !== 'ACTIVE') {
                await prisma.product.update({
                    where: { id: product.id },
                    data: { status: newStatus }
                });
            }
        });

        await Promise.all(updates);

        processedCount += products.length;
        console.log(`Processed ${processedCount} products...`);
        skip += batchSize;
    }

    console.log('Backfill complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
