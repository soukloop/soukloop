
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Product Categories Diagnostic ---')

    console.time('GroupBy Category')
    const categories = await prisma.product.groupBy({
        by: ['category'],
        _count: {
            id: true
        },
        orderBy: {
            category: 'asc'
        }
    })
    console.timeEnd('GroupBy Category')

    console.log('Category Counts (Raw DB Values):')
    categories.forEach(c => {
        console.log(`"${c.category}": ${c._count.id} products`)
    })

    // Check for specialized "Men" vs "men"
    console.log('\n--- Checking specific "Men" variations ---')
    const menProducts = await prisma.product.findMany({
        where: {
            category: {
                contains: 'men',
                mode: 'insensitive'
            }
        },
        select: {
            id: true,
            category: true,
            name: true
        },
        take: 5
    })

    console.log('Sample of products matching "men" (insensitive):')
    menProducts.forEach(p => {
        console.log(`ID: ${p.id}, Category: "${p.category}", Name: ${p.name}`)
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
