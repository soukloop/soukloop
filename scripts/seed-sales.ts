
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORY_STYLES = {
    Kids: [
        "Shalwar Kameez", "Anarkali/Frock", "Lehenga", "Sharara/Gharara", "Sherwani",
        "Shirt/Top", "Trousers/Skirt", "Co-ord Set", "Jacket", "Shawl", "Handbag",
        "Headwear", "Shoes"
    ],
    Men: [
        "Shalwar Kameez", "Sherwani", "Waistcoat", "Suit", "Shirt", "Trouser",
        "Jacket", "Shawl", "Headwear", "Shoes"
    ],
    Women: [
        "Shalwar Kameez", "Anarkali Dress", "Lehenga", "Sharara/Gharara", "Saree",
        "Kaftan/Abaya", "Shirt/Top", "Trousers/Skirt", "Suit", "Co-ord Set",
        "Shawl", "Handbag"
    ]
};

async function main() {
    console.log('Start seeding sales data...');

    // 1. Get a buyer and a seller
    const buyer = await prisma.user.findFirst();
    const vendor = await prisma.vendor.findFirst({ include: { user: true } });

    if (!buyer || !vendor) {
        console.error('Need at least one user and one vendor in the database.');
        return;
    }

    console.log(`Using Buyer: ${buyer.email}`);
    console.log(`Using Seller: ${vendor.storeName} (${vendor.user.email})`);

    // 2. Iterate and create data
    for (const [category, styles] of Object.entries(CATEGORY_STYLES)) {
        console.log(`Processing Category: ${category}`);

        for (const style of styles) {
            // Create a Product
            const product = await prisma.product.create({
                data: {
                    vendorId: vendor.id,
                    name: `${category} ${style} Sample`,
                    slug: `${category.toLowerCase()}-${style.toLowerCase().replace(/[\/\s]/g, '-')}-${Date.now()}`,
                    description: `Auto-generated sample for ${category} ${style}`,
                    price: Math.floor(Math.random() * 100) + 50, // Reduced price for realism
                    category: category,
                    dress: style, // The crucial field for Top Selling
                    quantity: 100,
                    isActive: true,
                    gender: category === 'Men' ? 'Male' : category === 'Women' ? 'Female' : 'Unisex',
                    images: {
                        create: {
                            url: "https://placehold.co/600x400?text=" + encodeURIComponent(style),
                            isPrimary: true
                        }
                    }
                }
            });

            // Create an Order (PAID)
            // We'll simulate 2 distinct orders per style to add some volume
            for (let i = 0; i < 2; i++) {
                const orderNum = `ORD-SEED-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

                await prisma.order.create({
                    data: {
                        userId: buyer.id,
                        vendorId: vendor.id,
                        orderNumber: orderNum,
                        status: 'PAID', // IMPORTANT
                        subtotal: product.price,
                        total: product.price,
                        shippingAddress: {},
                        billingAddress: {},
                        items: {
                            create: {
                                productId: product.id,
                                price: product.price,
                                quantity: Math.floor(Math.random() * 3) + 1 // Random quantity 1-3
                            }
                        }
                    }
                });
            }
            console.log(` - Created sales for ${style}`);
        }
    }

    console.log('Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
