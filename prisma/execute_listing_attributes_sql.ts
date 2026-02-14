
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting listing attribute tests...');

    // 1. Create a dummy user and listing first (or find existing)
    // For simplicity, we'll try to find a user, or create one if empty
    let user = await prisma.user.findFirst();
    if (!user) {
        console.log('No user found, creating dummy user...');
        user = await prisma.user.create({
            data: {
                email: 'test_listing_attr@example.com',
                name: 'Test Attribute User',
            },
        });
    }

    // Create a listing
    console.log('Creating test listing...');
    const listing = await prisma.listing.create({
        data: {
            userId: user.id,
            title: 'Test Attribute Listing',
            description: 'A listing to test attributes',
            price: 100,
            status: 'active',
        },
    });

    console.log(`Created listing: ${listing.id}`);

    // 2. Create listing attributes
    console.log('Creating listing attributes...');
    await prisma.listingAttribute.create({
        data: {
            listingId: listing.id,
            key: 'Color',
            value: 'Red',
        },
    });

    await prisma.listingAttribute.create({
        data: {
            listingId: listing.id,
            key: 'Size',
            value: 'Large',
        },
    });

    // 3. Retrieve attributes
    console.log('Retrieving attributes...');
    const attributes = await prisma.listingAttribute.findMany({
        where: {
            listingId: listing.id,
        },
    });

    console.log('Attributes found:', attributes);

    if (attributes.length !== 2) {
        throw new Error(`Expected 2 attributes, found ${attributes.length}`);
    }

    // 4. Clean up
    console.log('Cleaning up...');
    await prisma.listing.delete({
        where: { id: listing.id },
    });
    // Attributes should be deleted via cascade

    const remainingAttributes = await prisma.listingAttribute.findMany({
        where: { listingId: listing.id }
    });

    if (remainingAttributes.length !== 0) {
        throw new Error("Cascade delete failed!");
    }

    console.log('Listing attributes test completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
