import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching all dress styles...');
    const styles = await prisma.dressStyle.findMany({
        include: {
            products: {
                include: {
                    orderItems: true
                }
            }
        }
    });

    console.log(`Found ${styles.length} styles to process.`);

    for (const style of styles) {
        const totalProducts = style.products.length;
        let totalSold = 0;

        for (const product of style.products) {
            if (product.orderItems && product.orderItems.length > 0) {
                totalSold += product.orderItems.reduce((acc, item) => acc + item.quantity, 0);
            }
        }

        if (totalProducts > 0 || totalSold > 0) {
            await prisma.dressStyle.update({
                where: { id: style.id },
                data: {
                    totalProducts,
                    totalSold
                }
            });
            console.log(`Updated style ${style.name}: totalProducts=${totalProducts}, totalSold=${totalSold}`);
        }
    }

    console.log('Done recalculating dress styles!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
