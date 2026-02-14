import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting AnalyticsView SQL execution...')

    // Get a listing and user
    const listing = await prisma.listing.findFirst()
    const user = await prisma.user.findFirst()

    if (!listing) {
        console.error('No listings found.')
        return
    }

    console.log(`Listing: ${listing.id} (${listing.title})`)
    console.log(`User: ${user?.id || 'anonymous'}`)

    // Create analytics view
    const analyticsView = await prisma.analyticsView.create({
        data: {
            listingId: listing.id,
            viewerId: user?.id
        }
    })

    console.log(`AnalyticsView Created: ${analyticsView.id}`)
    console.log('Details:', analyticsView)

    // Verify
    const fetchedView = await prisma.analyticsView.findUnique({
        where: { id: analyticsView.id },
        include: {
            listing: { select: { title: true } },
            viewer: { select: { email: true } }
        }
    })

    if (fetchedView) {
        console.log('Verification Successful:', fetchedView)
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
