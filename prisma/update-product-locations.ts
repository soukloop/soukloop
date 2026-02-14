import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
    "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
    "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

async function main() {
    console.log('Fetching all products...');
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products.`);

    if (products.length === 0) {
        console.log('No products to update.');
        return;
    }

    console.log('Updating products with random location values...');
    let updatedCount = 0;

    for (const product of products) {
        const randomState = states[Math.floor(Math.random() * states.length)];
        await prisma.product.update({
            where: { id: product.id },
            data: { location: randomState }
        });
        updatedCount++;
        console.log(`Updated product "${product.name}" with location: ${randomState}`);
    }

    console.log(`\n✅ Successfully updated ${updatedCount} products with location values.`);
}

main()
    .catch((e) => {
        console.error('Error updating products:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
