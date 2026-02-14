
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Cleaning up placeholder brands...');
        const result = await prisma.product.deleteMany({
            where: {
                brand: {
                    in: ['Brand A', 'Brand B', 'Brand C', 'Brand D', 'Brand E']
                }
            }
        });
        console.log(`Deleted ${result.count} products with placeholder brands.`);
    } catch (error) {
        console.error('Error cleaning brands:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
