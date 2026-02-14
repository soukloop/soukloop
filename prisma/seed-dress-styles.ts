
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

const stylesData = {
    Men: [
        'Shalwar Kameez', 'Sherwani', 'Waistcoat', 'Suit', 'Shirt', 'Trouser', 'Jacket', 'Shawl', 'Headwear', 'Shoes'
    ],
    Women: [
        'Shalwar Kameez', 'Anarkali Dress', 'Lehenga', 'Sharara / Gharara', 'Saree', 'Kaftan / Abaya', 'Shirt / Top', 'Trousers', 'Skirt', 'Suit', 'Co-ord Set', 'Shawl', 'Handbag'
    ],
    Kids: [
        'Shalwar Kameez', 'Anarkali / Frock', 'Lehenga', 'Sharara / Gharara', 'Kurta Pajama / Pathani Suit / Sherwani', 'Shirt / Top / T-Shirt', 'Trousers / Pants / Jeans', 'Skirt', 'Co-ord Set / Indo-Western Outfit', 'Jacket / Outerwear', 'Shawl / Dupatta / Scarf', 'Handbag / Small Bag', 'Headwear / Cap / Turban', 'Shoes / Footwear'
    ]
};

async function main() {
    console.log('Seeding Dress Styles...');

    for (const [category, styles] of Object.entries(stylesData)) {
        console.log(`Processing ${category}...`);
        for (const styleName of styles) {
            const slug = slugify(styleName, { lower: true, strict: true });

            // Using upsert to prevent duplicates
            await prisma.dressStyle.upsert({
                where: {
                    slug_categoryType: {
                        slug: slug,
                        categoryType: category
                    }
                },
                update: {}, // No updates if exists
                create: {
                    name: styleName,
                    slug: slug,
                    categoryType: category,
                    status: 'approved'
                }
            });
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
