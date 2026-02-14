import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting Favorite SQL execution...')

    const user = await prisma.user.findFirst()
    const listing = await prisma.listing.findFirst()

    if (!user || !listing) {
        console.error('User or listing not found.')
        return
    }

    console.log(`User: ${user.id}`)
    console.log(`Listing: ${listing.id} (${listing.title})`)

    // Create favorite
    const favorite = await prisma.favorite.create({
        data: {
            userId: user.id,
            listingId: listing.id
        }
    })

    console.log(`Favorite Created: ${favorite.id}`)
    console.log('Details:', favorite)

    // Verify
    const fetchedFavorite = await prisma.favorite.findUnique({
        where: {
            userId_listingId: {
                userId: user.id,
                listingId: listing.id
            }
        },
        include: {
            user: { select: { email: true } },
            listing: { select: { title: true } }
        }
    })

    if (fetchedFavorite) {
        console.log('Verification Successful:', fetchedFavorite)
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
