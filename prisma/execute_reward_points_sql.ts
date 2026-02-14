import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🧪 Testing Reward Points System...\n')

    try {
        // 1. Create a test user
        console.log('1️⃣ Creating test user...')
        const user = await prisma.user.upsert({
            where: { email: 'reward_test@example.com' },
            update: {},
            create: {
                email: 'reward_test@example.com',
                name: 'Reward Test User',
                password: 'test123'
            }
        })
        console.log(`✅ User created: ${user.id}\n`)

        // 2. Create reward balance for user
        console.log('2️⃣ Creating reward balance...')
        const balance = await prisma.rewardBalance.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                totalEarned: 0,
                totalRedeemed: 0,
                currentBalance: 0
            }
        })
        console.log(`✅ Balance created for user: ${user.id}`)
        console.log(`   Current balance: ${balance.currentBalance} points\n`)

        // 3. Award registration bonus
        console.log('3️⃣ Awarding registration bonus...')
        const registrationBonus = await prisma.rewardPoint.create({
            data: {
                userId: user.id,
                points: 100,
                actionType: 'registration_bonus',
                note: 'Welcome bonus for new user'
            }
        })
        console.log(`✅ Awarded ${registrationBonus.points} points for registration\n`)

        // 4. Award points for listing posted
        console.log('4️⃣ Awarding points for listing posted...')
        const listingBonus = await prisma.rewardPoint.create({
            data: {
                userId: user.id,
                points: 50,
                actionType: 'listing_posted',
                referenceId: 'listing-123',
                referenceType: 'listing',
                note: 'Posted a new listing'
            }
        })
        console.log(`✅ Awarded ${listingBonus.points} points for listing\n`)

        // 5. Award points for purchase with expiration
        console.log('5️⃣ Awarding points for purchase (with expiration)...')
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 90) // Expires in 90 days

        const purchaseBonus = await prisma.rewardPoint.create({
            data: {
                userId: user.id,
                points: 200,
                actionType: 'purchase_completed',
                referenceId: 'order-456',
                referenceType: 'order',
                note: 'Purchase reward',
                expiresAt
            }
        })
        console.log(`✅ Awarded ${purchaseBonus.points} points for purchase`)
        console.log(`   Expires at: ${expiresAt.toISOString()}\n`)

        // 6. Redeem points
        console.log('6️⃣ Redeeming points...')
        const redemption = await prisma.rewardPoint.create({
            data: {
                userId: user.id,
                points: -50,
                actionType: 'points_redeemed',
                referenceId: 'redemption-789',
                referenceType: 'redemption',
                note: 'Redeemed for discount'
            }
        })
        console.log(`✅ Redeemed ${Math.abs(redemption.points)} points\n`)

        // 7. Calculate and update balance
        console.log('7️⃣ Calculating total balance...')
        const allPoints = await prisma.rewardPoint.findMany({
            where: { userId: user.id }
        })

        const totalEarned = allPoints
            .filter(p => p.points > 0)
            .reduce((sum, p) => sum + p.points, 0)

        const totalRedeemed = Math.abs(
            allPoints
                .filter(p => p.points < 0)
                .reduce((sum, p) => sum + p.points, 0)
        )

        const currentBalance = totalEarned - totalRedeemed

        await prisma.rewardBalance.update({
            where: { userId: user.id },
            data: {
                totalEarned,
                totalRedeemed,
                currentBalance
            }
        })

        console.log(`   Total Earned: ${totalEarned} points`)
        console.log(`   Total Redeemed: ${totalRedeemed} points`)
        console.log(`   Current Balance: ${currentBalance} points\n`)

        // 8. Get user with all reward data
        console.log('8️⃣ Fetching user with reward data...')
        const userWithRewards = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                rewardBalance: true,
                rewardPoints: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        })

        console.log(`✅ User: ${userWithRewards?.name}`)
        console.log(`   Balance: ${userWithRewards?.rewardBalance?.currentBalance} points`)
        console.log(`   Transaction count: ${userWithRewards?.rewardPoints.length}\n`)

        // 9. Get points by action type
        console.log('9️⃣ Grouping points by action type...')
        const pointsByAction = await prisma.rewardPoint.groupBy({
            by: ['actionType'],
            where: { userId: user.id },
            _sum: {
                points: true
            }
        })

        console.log('   Points by action:')
        pointsByAction.forEach(action => {
            console.log(`   - ${action.actionType}: ${action._sum.points} points`)
        })
        console.log()

        // 10. Check for expiring points
        console.log('🔟 Checking for expiring points...')
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

        const expiringPoints = await prisma.rewardPoint.findMany({
            where: {
                userId: user.id,
                points: { gt: 0 },
                expiresAt: {
                    lte: thirtyDaysFromNow,
                    gte: new Date()
                }
            }
        })

        if (expiringPoints.length > 0) {
            const expiringTotal = expiringPoints.reduce((sum, p) => sum + p.points, 0)
            console.log(`⚠️  ${expiringTotal} points expiring in the next 30 days`)
        } else {
            console.log('✅ No points expiring in the next 30 days')
        }

        console.log('\n✅ All tests completed successfully!')

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
