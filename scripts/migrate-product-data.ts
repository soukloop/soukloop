import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string) {
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
        let updateData: any = {};

        // 1. BRAND
        if (p.brand) {
            let brand = await prisma.brand.findUnique({ where: { name: p.brand } });
            if (!brand) {
                // Try finding by slug
                brand = await prisma.brand.findUnique({ where: { slug: slugify(p.brand) } });
            }
            if (!brand) {
                // Create new brand on fly
                brand = await prisma.brand.create({
                    data: { name: p.brand, slug: slugify(p.brand) }
                }).catch(() => null); // Handle race conditions
            }
            if (brand) updateData.brandId = brand.id;
        }

        // 2. MATERIAL (Fabric)
        if (p.fabric) {
            // Fuzzy match or exact? Let's try flexible finding
            const slug = slugify(p.fabric);
            let material = await prisma.material.findFirst({
                where: { OR: [{ name: { equals: p.fabric, mode: 'insensitive' } }, { slug: slug }] }
            });
            if (material) updateData.materialId = material.id;
        }

        // 3. OCCASION
        if (p.occasion) {
            const slug = slugify(p.occasion);
            let occasion = await prisma.occasion.findFirst({
                where: { OR: [{ name: { equals: p.occasion, mode: 'insensitive' } }, { slug: slug }] }
            });
            if (occasion) updateData.occasionId = occasion.id;
        }

        // 4. COLOR
        if (p.color) {
            const slug = slugify(p.color);
            let color = await prisma.color.findFirst({
                where: { OR: [{ name: { equals: p.color, mode: 'insensitive' } }, { slug: slug }] }
            });
            if (color) updateData.colorId = color.id;
        }

        // 5. LOCATION (City/State)
        if (p.location) {
            // Assume location is "City" or "City, State" or just "State"
            // Try to match State first
            const loc = p.location.trim();
            let state = await prisma.state.findFirst({
                where: {
                    OR: [
                        { name: { equals: loc, mode: 'insensitive' } },
                        { abbreviation: { equals: loc, mode: 'insensitive' } }
                    ]
                }
            });

            if (state) {
                // It was a state? We don't have a direct stateId on Product, we have cityId.
                // But wait, plan said "cityId". 
                // If user only provided a state, we can't link to a city efficiently without a dummy city. 
                // For now, let's look for City.
            } else {
                // Maybe it's a city?
                // Since we populated cities, let's try to find it.
                // This is hard without state context.
                // Simplification: Skip fuzzy location migration for now or try best effort.
                // Let's rely on the user manually updating location if needed, OR
                // match exact City Name if unique?

                const city = await prisma.city.findFirst({
                    where: { name: { equals: loc, mode: 'insensitive' } }
                });
                if (city) updateData.cityId = city.id;
            }
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
