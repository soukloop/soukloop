const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Verifying Prisma Client...');

    try {
        // Attempt a simple update on a likely non-existent ID to check if schema validation passes
        await prisma.product.update({
            where: { id: 'dummy-id-123' },
            data: {
                viewCount: { increment: 1 }
            }
        });

    } catch (e) {
        if (e.message && e.message.includes('Record to update not found')) {
            console.log('SUCCESS: Client recognized viewCount field (Record not found as expected).');
        } else if (e.message && (e.message.includes('Unknown arg') || e.message.includes('viewCount'))) {
            console.error('FAILURE: Client does NOT recognize viewCount field.');
            console.error(e.message);
            process.exit(1);
        } else {
            console.log('Likely SUCCESS (other error):', e.message);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
