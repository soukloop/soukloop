import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting SearchHistory SQL execution...')

    const user = await prisma.user.findFirst()
    if (!user) {
        console.error('No users found.')
        return
    }

    console.log(`User: ${user.id} (${user.email})`)

    // Create search history
    const searchHistory = await prisma.searchHistory.create({
        data: {
            userId: user.id,
            searchQuery: 'Tesla Model 3 electric car'
        }
    })

    console.log(`SearchHistory Created: ${searchHistory.id}`)
    console.log('Details:', searchHistory)

    // Verify
    const fetchedHistory = await prisma.searchHistory.findUnique({
        where: { id: searchHistory.id },
        include: {
            user: { select: { email: true } }
        }
    })

    if (fetchedHistory) {
        console.log('Verification Successful:', fetchedHistory)
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
