
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Comprehensive Database Diagnostic ---');

    const customerOrders = await prisma.customerOrder.findMany({
        include: { vendorOrders: true }
    });

    console.log(`Total CustomerOrders: ${customerOrders.length}`);
    customerOrders.forEach(co => {
        console.log(`\nCustomerOrder: ${co.orderNumber} (Amount: ${co.totalAmount})`);
        co.vendorOrders.forEach(vo => {
            console.log(`  - VendorOrder: ${vo.orderNumber}, Status: ${vo.status}, Total: ${vo.total}`);
        });
    });

    const payments = await prisma.payment.findMany();
    console.log(`\nTotal Payment Records: ${payments.length}`);
    payments.forEach(p => {
        console.log(`  - ID: ${p.id}, OrderID: ${p.orderId}, Status: ${p.status}, Amount: ${p.amount}`);
    });

    const transactions = await prisma.paymentTransaction.findMany();
    console.log(`\nTotal PaymentTransaction Records: ${transactions.length}`);
    transactions.forEach(t => {
        console.log(`  - ID: ${t.id}, OrderID: ${t.orderId}, Status: ${t.status}, Amount: ${t.amount}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
