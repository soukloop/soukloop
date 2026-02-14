
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    const email = 'munibrehman326@gmail.com';
    console.log(`Debug: Fetching user ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            profile: true,
            accounts: true,
            sessions: true,
            addresses: true,
            notificationPrefs: true,
            userVerifications: true,
            vendor: true
        }
    });

    if (!user) {
        console.log("❌ User NOT FOUND in database.");
    } else {
        console.log("✅ User FOUND:");
        console.log(JSON.stringify(user, null, 2));

        console.log("\n--- Analysis ---");
        if (!user.password && user.accounts.length === 0) {
            console.log("⚠️  User has NO password and NO linked accounts (Google/Apple). Login Impossible via Credentials.");
        }
        if (!user.emailVerified) {
            console.log("⚠️  Email NOT Verified.");
        }
        if (!user.isActive) {
            console.log("⚠️  User is SUSPENDED (isActive=false).");
        }
        if (!user.profile) {
            console.log("⚠️  User Profile is MISSING.");
        }
    }

    const tokens = await prisma.verificationToken.findMany({
        where: { identifier: email }
    });
    console.log("\n--- Verification Tokens ---");
    console.log(tokens);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
