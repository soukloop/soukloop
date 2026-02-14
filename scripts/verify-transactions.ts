import { getAdminTransactions, getAdminPayouts } from "../src/features/admin/transactions/actions";

async function verifyActions() {
    console.log("--- Testing getAdminTransactions ---");
    try {
        const txnResult = await getAdminTransactions({ page: 1, limit: 10 });
        console.log("Success! Transactions fetched:", txnResult.transactions.length);
        console.log("Total Count:", txnResult.totalCount);
        console.log("Stats:", txnResult.stats);
    } catch (e: any) {
        console.error("Failed to fetch transactions:", e.message);
        console.log("Note: This failure is expected if not running with an active admin session.");
    }

    console.log("\n--- Testing getAdminPayouts ---");
    try {
        const payoutResult = await getAdminPayouts({ page: 1, limit: 10 });
        console.log("Success! Payouts fetched:", payoutResult.payouts.length);
        console.log("Total Count:", payoutResult.totalCount);
        console.log("Stats:", payoutResult.stats);
    } catch (e: any) {
        console.error("Failed to fetch payouts:", e.message);
        console.log("Note: This failure is expected if not running with an active admin session.");
    }
}

// verifyActions();
console.log("Verification script prepared. Note: Execution requires an active admin session context which might be tricky in a standalone script without mocks.");
