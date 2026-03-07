import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const brandCount = await prisma.brand.count()
    const categoryCount = await prisma.category.count()
    const materialCount = await prisma.material.count()
    const occasionCount = await prisma.occasion.count()
    const dressStyleCount = await prisma.dressStyle.count()
    const productCount = await prisma.product.count()

    console.log({
        brandCount,
        categoryCount,
        materialCount,
        occasionCount,
        dressStyleCount,
        productCount
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
