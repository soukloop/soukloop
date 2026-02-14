import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'test_auto_verify@example.com' },
        include: { profile: true }
    })

    if (user) {
        console.log('User found:', user.email, 'Verified:', user.emailVerified)
    } else {
        console.log('User not found')
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
