import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearAllData() {
    console.log("🗑️  Starting to clear all seed data...\n");

    try {
        // Delete in order to respect foreign key constraints
        // Start with dependent tables first, then parent tables

        console.log("Deleting chat messages...");
        await prisma.chatMessage.deleteMany({});

        console.log("Deleting chat conversations...");
        await prisma.chatConversation.deleteMany({});

        console.log("Deleting notifications...");
        await prisma.notification.deleteMany({});

        console.log("Deleting notification preferences...");
        await prisma.notificationPreference.deleteMany({});

        // Unified permission cleanup
        console.log("Deleting user permissions...");
        await prisma.userPermission.deleteMany({});

        // Admin tables removed
        // await prisma.adminAuditLog.deleteMany({});
        // await prisma.adminPermission.deleteMany({});
        // await prisma.adminUser.deleteMany({});

        console.log("Deleting audit logs...");
        await prisma.auditLog.deleteMany({});

        console.log("Deleting user verifications...");
        await prisma.userVerification.deleteMany({});

        console.log("Deleting deliveries...");
        await prisma.delivery.deleteMany({});

        console.log("Deleting reward points...");
        await prisma.rewardPoint.deleteMany({});

        console.log("Deleting reward balances...");
        await prisma.rewardBalance.deleteMany({});

        console.log("Deleting favorites...");
        await prisma.favorite.deleteMany({});

        console.log("Deleting search history...");
        await prisma.searchHistory.deleteMany({});

        console.log("Deleting analytics views...");
        await prisma.analyticsView.deleteMany({});

        console.log("Deleting categories...");
        await prisma.category.deleteMany({});

        console.log("Deleting support tickets...");
        await prisma.supportTicket.deleteMany({});

        console.log("Deleting settings...");
        await prisma.settings.deleteMany({});

        console.log("Deleting payouts...");
        await prisma.payout.deleteMany({});

        console.log("Deleting banners...");
        await prisma.banner.deleteMany({});

        console.log("Deleting reports...");
        await prisma.report.deleteMany({});

        console.log("Deleting promotions...");
        await prisma.promotion.deleteMany({});

        console.log("Deleting reviews...");
        await prisma.review.deleteMany({});

        console.log("Deleting refunds...");
        await prisma.refund.deleteMany({});

        console.log("Deleting payment transactions...");
        await prisma.paymentTransaction.deleteMany({});

        console.log("Deleting payments...");
        await prisma.payment.deleteMany({});

        console.log("Deleting order items...");
        await prisma.orderItem.deleteMany({});

        console.log("Deleting order history...");
        await prisma.orderHistory.deleteMany({});

        console.log("Deleting orders...");
        await prisma.order.deleteMany({});

        console.log("Deleting customer orders...");
        await prisma.customerOrder.deleteMany({});

        console.log("Deleting cart items...");
        await prisma.cartItem.deleteMany({});

        console.log("Deleting carts...");
        await prisma.cart.deleteMany({});

        console.log("Deleting product images...");
        await prisma.productImage.deleteMany({});

        console.log("Deleting recently viewed...");
        await prisma.recentlyViewed.deleteMany({});

        console.log("Deleting products...");
        await prisma.product.deleteMany({});

        console.log("Deleting wallet transactions...");
        await prisma.walletTransaction.deleteMany({});

        console.log("Deleting vendors...");
        await prisma.vendor.deleteMany({});

        console.log("Deleting addresses...");
        await prisma.address.deleteMany({});

        console.log("Deleting user profiles...");
        await prisma.userProfile.deleteMany({});

        console.log("Deleting saved searches...");
        await prisma.savedSearch.deleteMany({});

        console.log("Deleting sessions...");
        await prisma.session.deleteMany({});

        console.log("Deleting accounts...");
        await prisma.account.deleteMany({});

        console.log("Deleting verification tokens...");
        await prisma.verificationToken.deleteMany({});

        console.log("Deleting dress style requests...");
        await prisma.dressStyleRequest.deleteMany({});

        console.log("Deleting dress styles...");
        await prisma.dressStyle.deleteMany({});

        console.log("Deleting users...");
        await prisma.user.deleteMany({});

        console.log("\n✅ All seed data has been successfully cleared!");
        console.log("🔄 You can now see the empty database in Prisma Studio.");
    } catch (error) {
        console.error("❌ Error clearing data:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

clearAllData()
    .then(() => {
        console.log("\n🎉 Database cleanup completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Database cleanup failed:", error);
        process.exit(1);
    });
