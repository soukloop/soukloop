import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTransactions() {
    try {
        console.log('💰 Seeding payment transactions...');

        // Get some existing users and orders
        const users = await prisma.user.findMany({ take: 10 });
        const orders = await prisma.order.findMany({ take: 10 });

        if (users.length === 0) {
            console.log('⚠️  No users found. Please seed users first.');
            return;
        }

        const statuses = ['completed', 'pending', 'failed', 'refunded'];
        const providers = ['Stripe', 'PayPal', 'Square', 'Credit Card'];
        const amounts = [29.99, 49.99, 99.99, 149.99, 199.99, 299.99, 399.99, 499.99, 79.99, 129.99];

        const transactionsToCreate = [];

        // Create sample transactions
        for (let i = 0; i < 25; i++) {
            const user = users[i % users.length];
            const order = orders.length > 0 ? orders[i % orders.length] : null;
            const amount = amounts[i % amounts.length];
            const status = statuses[i % statuses.length];
            const provider = providers[i % providers.length];

            transactionsToCreate.push({
                userId: user.id,
                orderId: order?.id || null,
                amount: amount,
                currency: 'USD',
                provider: provider,
                providerTransactionId: `${provider.toUpperCase()}_${Date.now()}_${i}`,
                status: status,
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date within last 30 days
            });
        }

        // Create transactions
        for (const txData of transactionsToCreate) {
            await prisma.paymentTransaction.create({
                data: txData
            });
        }

        console.log(`✅ Created ${transactionsToCreate.length} sample transactions`);
        console.log('✅ Transactions seeding completed!');

    } catch (error) {
        console.error('❌ Error seeding transactions:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    seedTransactions()
        .then(() => {
            console.log('🎉 Seeding process completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Fatal error during seeding:', error);
            process.exit(1);
        });
}

export { seedTransactions };
