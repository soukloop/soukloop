import { PrismaClient, PromotionType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting promotion SQL execution...')

    // 1. Find a valid listing_id (Product)
    const product = await prisma.product.findFirst()
    if (!product) {
        console.error('No products found to attach promotion to.')
        return
    }
    console.log(`Found product: ${product.id} (${product.name})`)

    const listingId = product.id

    // 2. INSERT (Create Promotion)
    // SQL:
    // INSERT INTO promotions (listing_id, promo_type, video_url, start_date, end_date)
    // VALUES (..., 'video_promo', 'https://cdn.yourapp.com/promos/listing123.mp4', NOW(), NOW() + INTERVAL '7 days');

    console.log('Executing INSERT...')
    const now = new Date()
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // + 7 days

    const promotion = await prisma.promotion.create({
        data: {
            listingId: listingId,
            type: 'VIDEO_PROMO', // Mapped from 'video_promo'
            videoUrl: 'https://cdn.yourapp.com/promos/listing123.mp4',
            startDate: now,
            endDate: endDate
        }
    })
    console.log(`INSERT successful. Created Promotion ID: ${promotion.id}`)

    // 3. UPDATE 1 (Update video_url)
    // SQL:
    // UPDATE promotions SET promo_type = 'video_promo', video_url = 'https://cdn.yourapp.com/promos/newvideo.mp4' WHERE id = ...

    console.log('Executing UPDATE 1 (New Video URL)...')
    const updatedPromotion1 = await prisma.promotion.update({
        where: { id: promotion.id },
        data: {
            type: 'VIDEO_PROMO', // Redundant but matches SQL intent
            videoUrl: 'https://cdn.yourapp.com/promos/newvideo.mp4'
        }
    })
    console.log('UPDATE 1 successful: ', updatedPromotion1)

    // 4. UPDATE 2 (Extend end_date)
    // SQL:
    // UPDATE promotions SET end_date = end_date + INTERVAL '7 days' WHERE id = ...

    console.log('Executing UPDATE 2 (Extend End Date)...')
    // We need to calculate the new date based on the current (or updated) end date
    const extendedDate = new Date(updatedPromotion1.endDate.getTime() + 7 * 24 * 60 * 60 * 1000)

    const updatedPromotion2 = await prisma.promotion.update({
        where: { id: promotion.id },
        data: {
            endDate: extendedDate
        }
    })
    console.log('UPDATE 2 successful. New End Date: ', updatedPromotion2.endDate)

    console.log('All operations completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
