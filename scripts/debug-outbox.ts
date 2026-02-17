import { prisma } from "../lib/prisma";
import { outbox } from "../lib/outbox";

async function main() {
    console.log("1. Checking connection...");
    try {
        await prisma.$connect();
        console.log("✅ Connected to DB");
    } catch (e) {
        console.error("❌ Failed to connect to DB:", e);
        return; // Stop if DB connection fails
    }

    console.log("2. Checking CentrifugoOutbox table existence...");
    try {
        // Try to count items to verify table exists and is accessible
        const count = await prisma.centrifugoOutbox.count();
        console.log(`✅ Table exists. Current count: ${count}`);
    } catch (e: any) {
        console.error("❌ CentrifugoOutbox table access failed. The table might be missing in the database.");
        console.error("Error details:", e.message);
        return; // Stop if table is missing
    }

    console.log("3. Testing outbox.publish with simple data...");
    try {
        await outbox.publish("debug-test-channel", { message: "hello" });
        console.log("✅ Simple publish success");
    } catch (e: any) {
        console.error("❌ Simple publish failed:", e.message);
    }

    console.log("4. Testing outbox.publish with Date object (simulating notification payload)...");
    try {
        // This mimics what createNotification sends to outbox
        const mockNotification = {
            id: "debug-test-id",
            createdAt: new Date(),
            title: "Test Notification",
            userId: "debug-user-id"
        };

        // We want to see if passing this object (specifically the Date) causes issues
        await outbox.publish("debug-test-channel-date", {
            type: 'notification',
            data: mockNotification
        });
        console.log("✅ Complex object (with Date) publish success");
    } catch (e: any) {
        console.error("❌ Complex object publish failed. This confirms serialization issue or similar.");
        console.error("Error details:", e.message);
    }
}

main()
    .catch((e) => {
        console.error("Unexpected error in script:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
