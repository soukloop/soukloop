import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPayouts() {
    try {
        console.log('💸 Seeding seller payouts...');

        // Get existing vendors
        const vendors = await prisma.vendor.findMany({ take: 10 });

        if (vendors.length === 0) {
            console.log('⚠️  No vendors found. Please seed vendors first.');
            return;
        }

        const statuses = ['completed', 'pending', 'processing'];
        const methods = ['Bank Transfer', 'PayPal', 'Stripe Connect', 'Wire Transfer'];
        const amounts = [500, 750, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 3500];

        const payoutsToCreate = [];

        // Create sample payouts
        for (let i = 0; i < 15; i++) {
            const vendor = vendors[i % vendors.length];
            const amount = amounts[i % amounts.length];
            const status = statuses[i % statuses.length];
            const method = methods[i % methods.length];
            const daysAgo = Math.floor(Math.random() * 30);

            payoutsToCreate.push({
                vendorId: vendor.id,
                amount: amount,
                currency: 'USD',
                method: method,
                status: status,
                processedAt: status === 'completed' ? new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000) : null,
                createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
            });
        }

        // Create payouts
        for (const payoutData of payoutsToCreate) {
            await prisma.payout.create({
                data: payoutData
            });
        }

        console.log(`✅ Created ${payoutsToCreate.length} sample payouts`);
        console.log('✅ Payouts seeding completed!');

    } catch (error) {
        console.error('❌ Error seeding payouts:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    seedPayouts()
        .then(() => {
            console.log('🎉 Seeding process completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Fatal error during seeding:', error);
            process.exit(1);
        });
}

export { seedPayouts };
