
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const rows = await prisma.$queryRaw`SELECT status, count(*) as count FROM orders GROUP BY status`;
    console.log('Order Statuses (Raw SQL):');
    rows.forEach(r => console.log(`${r.status}: ${r.count}`));

    const cRows = await prisma.$queryRaw`SELECT count(*) as count FROM customer_orders`;
    console.log('Customer Orders Count (Raw SQL):', cRows[0].count.toString());
}

main().catch(console.error).finally(() => prisma.$disconnect());
