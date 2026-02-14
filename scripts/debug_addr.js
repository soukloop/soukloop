const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserAddresses() {
    const targetId = '5896f606-71d8-4143-b739-489306618bdb'; // The ID from the URL provided by user

    console.log(`Checking data for ID: ${targetId}`);

    // 1. Check if this is a Vendor ID
    const vendor = await prisma.vendor.findUnique({
        where: { id: targetId },
        include: { user: { include: { userAddresses: true } } }
    });

    if (vendor) {
        console.log('Found Vendor record:', vendor.id);
        console.log('User ID:', vendor.userId);
        console.log('User Addresses:', vendor.user.userAddresses);
        return;
    } else {
        console.log('No Vendor found with this ID.');
    }

    // 2. Check if this is a Verification ID
    const verification = await prisma.userVerification.findUnique({
        where: { id: targetId },
        include: { user: { include: { userAddresses: true } } }
    });

    if (verification) {
        console.log('Found Verification record:', verification.id);
        console.log('User ID:', verification.userId);
        console.log('User Addresses:', verification.user.userAddresses);
    } else {
        console.log('No Verification found with this ID.');
    }
}

checkUserAddresses()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
