
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userCounts = await prisma.user.groupBy({
        by: ['role'],
        _count: {
            _all: true,
        },
    });
    console.log('User counts by role:', JSON.stringify(userCounts, null, 2));

    const orderCount = await prisma.customerOrder.count();
    console.log('Total CustomerOrders:', orderCount);

    const subOrderCount = await prisma.order.count();
    console.log('Total Sub-Orders (Order model):', subOrderCount);

    const vendorCount = await prisma.vendor.count();
    console.log('Total Vendors:', vendorCount);

    const activeVendorCount = await prisma.vendor.count({ where: { isActive: true } });
    console.log('Total Active Vendors:', activeVendorCount);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
