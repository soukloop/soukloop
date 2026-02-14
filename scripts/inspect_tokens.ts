import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const tokens = await prisma.verificationToken.findMany()
    console.log('All Tokens:', tokens)

    const user = await prisma.user.findUnique({
        where: { email: 'test_auto_verify@example.com' }
    })
    console.log('Test User:', user ? user.email : 'Not Found')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
