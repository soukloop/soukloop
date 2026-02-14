import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('--- Users ---')
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { accounts: true }
    })
    console.log(JSON.stringify(users, null, 2))

    console.log('\n--- Accounts ---')
    const accounts = await prisma.account.findMany({
        take: 5
    })
    console.log(JSON.stringify(accounts, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
