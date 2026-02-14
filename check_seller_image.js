
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    const conversationId = '412d824a-4881-4b37-bb2e-838f6017c07a';

    const conversation = await prisma.chatConversation.findUnique({
        where: { id: conversationId },
        include: {
            seller: {
                include: {
                    vendor: true,
                    profile: true
                }
            },
            buyer: true
        }
    });

    if (!conversation) {
        console.log('Conversation not found');
        return;
    }

    console.log('Seller ID:', conversation.sellerId);
    console.log('Seller Name:', conversation.seller.name);
    console.log('Seller Image (User):', conversation.seller.image);

    if (conversation.seller.vendor) {
        console.log('Seller Vendor Logo:', conversation.seller.vendor.logo);
        console.log('Seller Vendor Slug:', conversation.seller.vendor.slug);
    } else {
        console.log('Seller is not a vendor');
    }

    if (conversation.seller.profile) {
        console.log('Seller Profile Avatar:', conversation.seller.profile.avatar);
    } else {
        console.log('Seller has no profile');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
