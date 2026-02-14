import { prisma } from "../lib/prisma";

async function verifyDatabaseSessions() {
    console.log("🔍 Verifying Database Session Capability...");

    try {
        // 1. Create a dummy test user
        const testEmail = "test-session-verify@example.com";

        // Clean up previous run if exists
        await prisma.user.deleteMany({ where: { email: testEmail } });

        const user = await prisma.user.create({
            data: {
                email: testEmail,
                name: "Session Tester",
                emailVerified: new Date(),
                role: "USER"
            }
        });
        console.log("✅ API: User created successfully");

        // 2. Create a session manually (simulating NextAuth)
        // NextAuth uses 'sessionToken' as the unique identifier cookie
        const sessionToken = "custom-test-session-token-" + Date.now();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

        const session = await prisma.session.create({
            data: {
                sessionToken,
                userId: user.id,
                expires
            }
        });
        console.log("✅ API: Session created successfully");

        // 3. Verify we can fetch it
        const fetchedSession = await prisma.session.findUnique({
            where: { sessionToken },
            include: { user: true }
        });

        if (!fetchedSession) {
            throw new Error("Failed to fetch created session");
        }
        console.log("✅ API: Session retrieval verified");
        console.log(`   - User: ${fetchedSession.user.email}`);
        console.log(`   - Expires: ${fetchedSession.expires}`);

        // 4. Test Invalidation (Delete)
        await prisma.session.delete({
            where: { sessionToken }
        });
        console.log("✅ API: Session deletion verified");

        // Cleanup user
        await prisma.user.delete({ where: { id: user.id } });
        console.log("✅ API: Cleanup complete");

        console.log("\n🎉 SUCCESS: Database supports sessions correctly!");

    } catch (error) {
        console.error("\n❌ ERROR: Database session verification failed");
        console.error(error);
        process.exit(1);
    }
}

verifyDatabaseSessions();
