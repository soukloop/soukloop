
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function main() {
    console.log('🚀 Starting Data Migration...');

    // Fetch all products
    const products = await prisma.product.findMany({
        select: {
            id: true,
            brand: true,
            fabric: true,
            occasion: true,
            color: true,
            location: true
        }
    });

    console.log(`Found ${products.length} products to migrate.`);

    let updatedCount = 0;

    for (const p of products) {
        let updateData = {};

        // 1. BRAND
        if (p.brand) {
            if (prisma.brand) {
                let brand = await prisma.brand.findUnique({ where: { name: p.brand } });
                if (!brand) {
                    brand = await prisma.brand.findUnique({ where: { slug: slugify(p.brand) } });
                }
                if (!brand) {
                    try {
                        brand = await prisma.brand.create({
                            data: { name: p.brand, slug: slugify(p.brand) }
                        });
                    } catch (e) { }
                }
                if (brand) updateData.brandId = brand.id;
            }
        }

        // 2. MATERIAL (Fabric)
        if (p.fabric && prisma.material) {
            let material = await prisma.material.findFirst({
                where: { OR: [{ name: { equals: p.fabric, mode: 'insensitive' } }, { slug: slugify(p.fabric) }] }
            });
            if (material) updateData.materialId = material.id;
        }

        // 3. OCCASION
        if (p.occasion && prisma.occasion) {
            let occasion = await prisma.occasion.findFirst({
                where: { OR: [{ name: { equals: p.occasion, mode: 'insensitive' } }, { slug: slugify(p.occasion) }] }
            });
            if (occasion) updateData.occasionId = occasion.id;
        }

        // 4. COLOR
        if (p.color && prisma.color) {
            let color = await prisma.color.findFirst({
                where: { OR: [{ name: { equals: p.color, mode: 'insensitive' } }, { slug: slugify(p.color) }] }
            });
            if (color) updateData.colorId = color.id;
        }

        // 5. LOCATION (City/State)
        if (p.location && prisma.city) {
            // Assume location is "City"
            const loc = p.location.trim();
            const city = await prisma.city.findFirst({
                where: { name: { equals: loc, mode: 'insensitive' } }
            });
            if (city) updateData.cityId = city.id;
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.product.update({
                where: { id: p.id },
                data: updateData
            });
            updatedCount++;
        }
    }

    console.log(`✅ Migration Complete. Updated ${updatedCount} products.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
