import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting Saved Search SQL execution...')

    const user = await prisma.user.findFirst()

    if (!user) {
        console.error('Need at least 1 user.')
        return
    }

    console.log(`User found: ${user.id}`)

    // Create SavedSearch
    const savedSearch = await prisma.savedSearch.create({
        data: {
            userId: user.id,
            query: 'test query',
            filters: {
                category: 'electronics',
                priceRange: [100, 500]
            }
        }
    })

    console.log(`Saved Search Created: ${savedSearch.id}`)

    // Verify
    const fetchedSavedSearch = await prisma.savedSearch.findUnique({
        where: { id: savedSearch.id },
        include: {
            user: { select: { email: true } }
        }
    })

    if (fetchedSavedSearch && fetchedSavedSearch.userId === user.id) {
        console.log('Verification Successful:', JSON.stringify(fetchedSavedSearch, null, 2))
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
