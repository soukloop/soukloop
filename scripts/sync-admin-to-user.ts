
import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔄 Starting Admin -> User Sync...')

    // 1. Fetch all Admins
    const admins = await prisma.adminUser.findMany({
        where: { isActive: true }
    })

    console.log(`📋 Found ${admins.length} active admins.`)

    for (const admin of admins) {
        console.log(`\n👤 Processing Admin: ${admin.email}`)

        // 2. Check if User exists
        const existingUser = await prisma.user.findUnique({
            where: { email: admin.email }
        })

        if (existingUser) {
            console.log(`   ✅ User already exists. Updating role to ADMIN...`)
            await prisma.user.update({
                where: { id: existingUser.id },
                data: { role: Role.ADMIN }
            })

            // Ensure profile exists
            const profile = await prisma.userProfile.findUnique({ where: { userId: existingUser.id } })
            if (!profile) {
                console.log(`   Element missing: UserProfile. Creating...`)
                await prisma.userProfile.create({
                    data: {
                        userId: existingUser.id,
                        firstName: 'Admin',
                        lastName: admin.name ? admin.name.split(' ').slice(1).join(' ') : 'User',
                    }
                })
            }

        } else {
            console.log(`   ✨ Creating new User record for Admin...`)
            await prisma.user.create({
                data: {
                    email: admin.email,
                    name: admin.name,
                    role: Role.ADMIN,
                    profile: {
                        create: {
                            firstName: admin.name ? admin.name.split(' ')[0] : 'Admin',
                            lastName: admin.name ? admin.name.split(' ').slice(1).join(' ') : 'User',
                        }
                    }
                }
            })
            console.log(`   ✅ User created successfully.`)
        }

        // 3. Ensure Vendor Record Exists (Make them a Seller)
        const targetUser = await prisma.user.findUnique({ where: { email: admin.email } })

        if (targetUser) {
            const vendor = await prisma.vendor.findUnique({ where: { userId: targetUser.id } })
            if (!vendor) {
                console.log(`   🏪 Creating Vendor profile for Admin...`)
                await prisma.vendor.create({
                    data: {
                        userId: targetUser.id,
                        slug: admin.name ? admin.name.toLowerCase().replace(/ /g, '-') + '-' + Math.floor(Math.random() * 1000) : 'store-' + Math.floor(Math.random() * 10000),
                        isActive: true,
                        kycStatus: 'APPROVED', // Auto-approve admin vendors
                        commissionBps: 0 // Admins pay 0% commission? Optional.
                    }
                })
                console.log(`   ✅ Vendor profile created.`)
            } else {
                console.log(`   ✅ Vendor profile already exists.`)
            }
        }
    }

    console.log('\n✅ Sync complete! Admins can now log in and will have valid User records.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
