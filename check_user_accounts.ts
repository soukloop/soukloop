
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking users and accounts...')
    const users = await prisma.user.findMany({
        include: {
            accounts: true,
            profile: true
        }
    })

    console.log(`Found ${users.length} users:`)
    for (const user of users) {
        console.log(`User: ${user.email} (ID: ${user.id})`)
        console.log(`  - Verified: ${user.emailVerified}`)
        console.log(`  - Accounts: ${user.accounts.length}`)
        user.accounts.forEach(acc => {
            console.log(`    - Provider: ${acc.provider}, ProviderAccountId: ${acc.providerAccountId}`)
        })
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
