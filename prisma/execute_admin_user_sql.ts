import { PrismaClient, AdminRole } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting AdminUser SQL execution...')

    // Hash password
    const password = 'admin123'
    const passwordHash = await hash(password, 10)

    // Create admin user
    const adminUser = await prisma.adminUser.create({
        data: {
            email: 'superadmin@example.com',
            passwordHash,
            role: 'ADMIN'
        }
    })

    console.log(`AdminUser Created: ${adminUser.id}`)
    console.log('Details:', adminUser)

    // Verify
    const fetchedAdmin = await prisma.adminUser.findUnique({
        where: { id: adminUser.id }
    })

    if (fetchedAdmin) {
        console.log('Verification Successful:', fetchedAdmin)
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
