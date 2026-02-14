import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting execute_payment_transactions_sql.ts...')

    try {
        // 1. Get or create a User and Order
        let user = await prisma.user.findFirst();
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: 'test_payment_user@example.com',
                    name: 'Test Payment User',
                    role: 'USER'
                }
            });
            console.log('Created test user:', user.id);
        }

        let order = await prisma.order.findFirst({ where: { userId: user.id } });
        if (!order) {
            // Create dummy vendor for order if needed
            let vendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
            if (!vendor) {
                vendor = await prisma.vendor.create({
                    data: {
                        userId: user.id,
                        storeName: 'Payment Test Store',
                        slug: 'payment-store-' + Date.now(),
                    }
                });
            }

            order = await prisma.order.create({
                data: {
                    userId: user.id,
                    vendorId: vendor.id,
                    orderNumber: 'ORD-PAY-' + Date.now(),
                    status: 'PENDING',
                    subtotal: 50.00,
                    total: 50.00,
                    currency: 'USD',
                    shippingAddress: {},
                    billingAddress: {}
                }
            });
            console.log('Created test order:', order.id);
        }

        // 2. Create PaymentTransaction
        console.log('Creating PaymentTransaction...');
        const transaction = await prisma.paymentTransaction.create({
            data: {
                orderId: order.id,
                userId: user.id,
                amount: 50.00,
                currency: 'USD',
                provider: 'stripe',
                providerTransactionId: 'tx_test_123456',
                status: 'completed'
            }
        });
        console.log('Created Transaction:', transaction);

        // 3. Verify Fetch
        const fetched = await prisma.paymentTransaction.findUnique({
            where: { id: transaction.id }
        });
        console.log('Fetched Transaction:', fetched);

    } catch (error) {
        console.error('Error executing script:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
