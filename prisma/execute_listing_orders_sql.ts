import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🧪 Testing Listing Orders System...\n')

    try {
        // 1. Create test users (buyer and seller)
        console.log('1️⃣ Creating test users...')
        const buyer = await prisma.user.upsert({
            where: { email: 'buyer_test@example.com' },
            update: {},
            create: {
                email: 'buyer_test@example.com',
                name: 'Test Buyer',
                password: 'test123'
            }
        })

        const seller = await prisma.user.upsert({
            where: { email: 'seller_test@example.com' },
            update: {},
            create: {
                email: 'seller_test@example.com',
                name: 'Test Seller',
                password: 'test123'
            }
        })
        console.log(`✅ Buyer created: ${buyer.id}`)
        console.log(`✅ Seller created: ${seller.id}\n`)

        // 2. Create a test listing
        console.log('2️⃣ Creating test listing...')
        const listing = await prisma.listing.create({
            data: {
                userId: seller.id,
                title: 'Vintage Camera for Sale',
                description: 'Classic film camera in excellent condition',
                price: 250.00,
                status: 'active'
            }
        })
        console.log(`✅ Listing created: ${listing.id}`)
        console.log(`   Title: ${listing.title}`)
        console.log(`   Price: $${listing.price}\n`)

        // 3. Create a pending order
        console.log('3️⃣ Creating pending order...')
        const order1 = await prisma.listingOrder.create({
            data: {
                buyerId: buyer.id,
                sellerId: seller.id,
                listingId: listing.id,
                status: 'pending',
                quantity: 1,
                price: listing.price,
                address: {
                    type: 'shipping',
                    name: 'Test Buyer',
                    street: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    country: 'USA',
                    phone: '+1234567890'
                },
                notes: 'Please ship carefully'
            }
        })
        console.log(`✅ Order created: ${order1.id}`)
        console.log(`   Status: ${order1.status}`)
        console.log(`   Quantity: ${order1.quantity}`)
        console.log(`   Price: $${order1.price}\n`)

        // 4. Accept the order
        console.log('4️⃣ Accepting order...')
        const acceptedOrder = await prisma.listingOrder.update({
            where: { id: order1.id },
            data: { status: 'accepted' }
        })
        // Write status history
        await prisma.listingOrderStatusHistory.create({
            data: { orderId: order1.id, status: 'accepted', note: 'Seller accepted the order' }
        })
        console.log(`✅ Order accepted: ${acceptedOrder.status}\n`)

        // 5. Mark as shipped
        console.log('5️⃣ Marking order as shipped...')
        const shippedOrder = await prisma.listingOrder.update({
            where: { id: order1.id },
            data: {
                status: 'shipped',
                notes: 'Shipped via FedEx. Tracking: 123456789'
            }
        })
        await prisma.listingOrderStatusHistory.create({
            data: { orderId: order1.id, status: 'shipped', note: 'Order shipped' }
        })
        console.log(`✅ Order shipped: ${shippedOrder.status}\n`)

        // 6. Mark as delivered
        console.log('6️⃣ Marking order as delivered...')
        const deliveredOrder = await prisma.listingOrder.update({
            where: { id: order1.id },
            data: { status: 'delivered' }
        })
        await prisma.listingOrderStatusHistory.create({
            data: { orderId: order1.id, status: 'delivered', note: 'Order delivered' }
        })
        console.log(`✅ Order delivered: ${deliveredOrder.status}\n`)

        // 7. Create a cancelled order
        console.log('7️⃣ Creating cancelled order...')
        const order2 = await prisma.listingOrder.create({
            data: {
                buyerId: buyer.id,
                sellerId: seller.id,
                listingId: listing.id,
                status: 'pending',
                quantity: 1,
                price: listing.price
            }
        })

        await prisma.listingOrder.update({
            where: { id: order2.id },
            data: { status: 'cancelled' }
        })
        await prisma.listingOrderStatusHistory.create({
            data: { orderId: order2.id, status: 'cancelled', note: 'Order cancelled' }
        })
        console.log(`✅ Order cancelled\n`)

        // 8. Get all orders for buyer
        console.log('8️⃣ Fetching buyer\'s orders...')
        const buyerOrders = await prisma.listingOrder.findMany({
            where: { buyerId: buyer.id },
            include: {
                seller: {
                    select: { id: true, name: true, email: true }
                },
                listing: {
                    select: { id: true, title: true, price: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        console.log(`✅ Found ${buyerOrders.length} orders for buyer`)
        buyerOrders.forEach((order, index) => {
            console.log(`   ${index + 1}. ${order.listing.title} - ${order.status} - $${order.price}`)
        })
        console.log()

        // 9. Get all orders for seller
        console.log('9️⃣ Fetching seller\'s orders...')
        const sellerOrders = await prisma.listingOrder.findMany({
            where: { sellerId: seller.id },
            include: {
                buyer: {
                    select: { id: true, name: true, email: true }
                },
                listing: {
                    select: { id: true, title: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        console.log(`✅ Found ${sellerOrders.length} orders for seller`)
        sellerOrders.forEach((order, index) => {
            console.log(`   ${index + 1}. ${order.listing.title} - ${order.status} - Buyer: ${order.buyer.name}`)
        })
        console.log()

        // 10. Get orders by status
        console.log('🔟 Grouping orders by status...')
        const ordersByStatus = await prisma.listingOrder.groupBy({
            by: ['status'],
            _count: {
                id: true
            }
        })
        console.log('   Orders by status:')
        ordersByStatus.forEach(group => {
            console.log(`   - ${group.status}: ${group._count.id} orders`)
        })
        console.log()

        // 11. Get user with all orders
        console.log('1️⃣1️⃣ Fetching user with all orders...')
        const userWithOrders = await prisma.user.findUnique({
            where: { id: buyer.id },
            include: {
                listingOrdersAsBuyer: {
                    include: {
                        listing: true,
                        seller: {
                            select: { name: true }
                        }
                    }
                },
                listingOrdersAsSeller: true
            }
        })
        console.log(`✅ User: ${userWithOrders?.name}`)
        console.log(`   Orders as buyer: ${userWithOrders?.listingOrdersAsBuyer.length}`)
        console.log(`   Orders as seller: ${userWithOrders?.listingOrdersAsSeller.length}\n`)

        // 12. Test address JSON storage
        console.log('1️⃣2️⃣ Testing address JSON storage...')
        const orderWithAddress = await prisma.listingOrder.findFirst({
            where: {
                id: order1.id,
                address: { not: null }
            }
        })
        if (orderWithAddress?.address) {
            console.log('✅ Address stored successfully:')
            console.log(`   ${JSON.stringify(orderWithAddress.address, null, 2)}`)
        }
        console.log()

        console.log('✅ All tests completed successfully!')

    } catch (error) {
        console.error('❌ Error:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
