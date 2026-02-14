
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const styleMapping: Record<string, string> = {
    'Shalwar Kameez': 'Women',
    'Kurta': 'Men',
    'Lehnga': 'Women',
    'Saree': 'Women',
    'Abaya': 'Women',
    'Jeans': 'Men',
    'T-Shirt': 'Men',
    'Blazer': 'Men',
    'Maxi': 'Women',
    'Gown': 'Women'
};

async function main() {
    console.log('Fixing DressStyle categories...');

    const styles = await prisma.dressStyle.findMany();
    console.log(`Found ${styles.length} styles.`);

    for (const style of styles) {
        const newCategory = styleMapping[style.name] || 'Women'; // Default to Women

        // We need to handle potential duplicate slug+categoryType constraints if we just update blindly.
        // But since current categoryType is 'traditional'/'western', moving to 'Women'/'Men' should be fine unless we map two same-slug items to same category.
        // The seed only created unique names.

        // Check if checks out
        console.log(`Updating ${style.name}: ${style.categoryType} -> ${newCategory}`);

        try {
            await prisma.dressStyle.update({
                where: { id: style.id },
                data: { categoryType: newCategory }
            });
        } catch (e) {
            console.error(`Failed to update ${style.name}:`, e);
        }
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
