
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration...');

    // 1. Fetch all categories to map name/slug to ID
    const categories = await prisma.category.findMany();
    const categoryMap = new Map<string, string>();
    categories.forEach(cat => {
        categoryMap.set(cat.name.toLowerCase(), cat.id);
        categoryMap.set(cat.slug.toLowerCase(), cat.id);
    });

    console.log(`Mapping categories: ${Array.from(categoryMap.keys()).join(', ')}`);

    // 2. Migrate DressStyles
    const styles = await prisma.dressStyle.findMany({
        where: { categoryId: null }
    });
    console.log(`Found ${styles.length} DressStyles to migrate.`);

    for (const style of styles) {
        const catId = categoryMap.get(style.categoryType.toLowerCase());
        if (catId) {
            await prisma.dressStyle.update({
                where: { id: style.id },
                data: { categoryId: catId }
            });
            console.log(`Migrated DressStyle: ${style.name} (${style.categoryType})`);
        } else {
            console.warn(`Could not find category for DressStyle: ${style.name} (${style.categoryType})`);
        }
    }

    // 3. Migrate Products
    const products = await prisma.product.findMany({
        where: { categoryId: null }
    });
    console.log(`Found ${products.length} Products to migrate.`);

    for (const product of products) {
        let catId: string | undefined;

        // Try matching by existing category string
        if (product.category) {
            catId = categoryMap.get(product.category.toLowerCase());
        }

        // Fallback: try matching by gender if category is missing or doesn't match
        if (!catId && product.gender) {
            catId = categoryMap.get(product.gender.toLowerCase());
        }

        if (catId) {
            await prisma.product.update({
                where: { id: product.id },
                data: { categoryId: catId }
            });
            console.log(`Migrated Product: ${product.name} (Cat: ${product.category}, Gender: ${product.gender})`);
        } else {
            console.warn(`Could not find category for Product: ${product.name} (Cat: ${product.category}, Gender: ${product.gender})`);
        }
    }

    console.log('Migration completed.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
