import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting Chat SQL execution...')

    const users = await prisma.user.findMany({ take: 2 })
    const listing = await prisma.listing.findFirst()

    if (users.length < 2 || !listing) {
        console.error('Need at least 2 users and 1 listing.')
        return
    }

    const buyer = users[0]
    const seller = users[1]

    console.log(`Buyer: ${buyer.id}`)
    console.log(`Seller: ${seller.id}`)
    console.log(`Listing: ${listing.id} (${listing.title})`)

    // Create conversation
    const conversation = await prisma.chatConversation.create({
        data: {
            buyerId: buyer.id,
            sellerId: seller.id,
            listingId: listing.id
        }
    })

    console.log(`Conversation Created: ${conversation.id}`)

    // Create messages
    const message1 = await prisma.chatMessage.create({
        data: {
            conversationId: conversation.id,
            senderId: buyer.id,
            message: 'Hi, is this item still available?'
        }
    })

    const message2 = await prisma.chatMessage.create({
        data: {
            conversationId: conversation.id,
            senderId: seller.id,
            message: 'Yes, it is! Would you like to schedule a viewing?',
            isRead: true
        }
    })

    console.log(`Message 1 Created: ${message1.id}`)
    console.log(`Message 2 Created: ${message2.id}`)

    // Verify
    const fetchedConversation = await prisma.chatConversation.findUnique({
        where: { id: conversation.id },
        include: {
            buyer: { select: { email: true } },
            seller: { select: { email: true } },
            listing: { select: { title: true } },
            messages: {
                orderBy: { createdAt: 'asc' },
                include: {
                    sender: { select: { email: true } }
                }
            }
        }
    })

    if (fetchedConversation && fetchedConversation.messages.length === 2) {
        console.log('Verification Successful:', JSON.stringify(fetchedConversation, null, 2))
    } else {
        console.error('Verification Failed.')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
