const { PrismaClient } = require('@prisma/client');

async function testConnection(host) {
    const url = `postgresql://postgres:password@${host}:5435/soukloop_db`;
    console.log(`Testing connection to: ${host}`);
    const prisma = new PrismaClient({
        datasources: {
            db: { url },
        },
    });

    try {
        await prisma.$connect();
        console.log(`✅ SUCCESS: Connected to ${host}`);
        await prisma.$disconnect();
        return true;
    } catch (e) {
        console.log(`❌ FAILED: Could not connect to ${host}`);
        console.log(`   Reason: ${e.message.split('\n')[0]}`); // Only show first line of error
        return false;
    }
}

async function main() {
    console.log("--- DIAGONOSTIC TEST ---");

    // Test 1: 127.0.0.1 (IPv4 explicit)
    await testConnection('127.0.0.1');

    // Test 2: localhost (Ambiguous, often IPv6 ::1)
    await testConnection('localhost');

    console.log("------------------------");
}

main();
