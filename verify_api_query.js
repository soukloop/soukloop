
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    const conversationId = '412d824a-4881-4b37-bb2e-838f6017c07a';

    // Mimic the API's GET query
    const conversation = await prisma.chatConversation.findUnique({
        where: { id: conversationId },
        include: {
            buyer: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    vendor: { select: { logo: true } },
                    profile: { select: { avatar: true } }
                }
            },
            seller: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    vendor: { select: { logo: true } },
                    profile: { select: { avatar: true } }
                }
            },
            product: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    images: { take: 1, orderBy: { isPrimary: 'desc' } }
                }
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                include: {
                    sender: { select: { id: true, name: true, image: true } }
                }
            }
        }
    });

    console.log('--- Conversation Structure ---');
    console.log(JSON.stringify(conversation, null, 2));

    if (conversation?.seller?.vendor?.logo) {
        console.log('✅ Success: Vendor logo found for seller');
    } else if (conversation?.seller?.profile?.avatar) {
        console.log('✅ Success: Profile avatar found for seller');
    } else {
        console.log('⚠️ Warning: No extra image found (this might be expected if user has none)');
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
