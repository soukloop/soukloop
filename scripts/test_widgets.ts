// @ts-nocheck
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Testing Top Selling Categories Logic...');

    // ============ TOP SELLING CATEGORIES (ALL TIIME) ============
    const allSoldItems = await prisma.orderItem.findMany({
        where: {
            order: {
                status: { in: ['PAID', 'DELIVERED'] }
            }
        },
        include: {
            product: {
                select: {
                    category: true,
                    dress: true,
                    images: {
                        take: 1,
                        orderBy: { order: 'asc' },
                        select: { url: true }
                    }
                }
            }
        }
    });

    const salesMap = new Map();

    allSoldItems.forEach(item => {
        if (!item.product) return;
        const category = item.product.category || 'Uncategorized';
        const style = item.product.dress || 'General';

        if (!salesMap.has(category)) {
            salesMap.set(category, new Map());
        }
        const categoryStyles = salesMap.get(category);

        const current = categoryStyles.get(style) || { sales: 0, count: 0, image: null };
        const itemTotal = item.price * item.quantity;

        let styleImage = current.image;
        if (!styleImage && item.product.images?.[0]?.url) {
            styleImage = item.product.images[0].url;
        }

        categoryStyles.set(style, {
            sales: current.sales + itemTotal,
            count: current.count + item.quantity,
            image: styleImage
        });
    });

    const topSellingCategories = Array.from(salesMap.entries()).map(([category, stylesMap]) => {
        // stylesMap is a Map, we need to iterate entries manually or use Array.from if it was TS map, but here it's JS
        // In JS Map.entries() returns iterator.
        const styles = Array.from(stylesMap.entries()).map(([styleName, stats]) => ({
            name: styleName,
            value: stats.sales,
            count: stats.count,
            image: stats.image,
            percentage: 0
        }));

        styles.sort((a, b) => b.value - a.value);

        return {
            category,
            styles: styles.slice(0, 10)
        };
    });

    topSellingCategories.sort((a, b) => {
        const sumA = a.styles.reduce((sum, s) => sum + s.value, 0);
        const sumB = b.styles.reduce((sum, s) => sum + s.value, 0);
        return sumB - sumA;
    });

    console.log('Top Selling:', JSON.stringify(topSellingCategories, null, 2));


    console.log('\nTesting Top Listed Categories Logic...');
    // ============ TOP LISTED CATEGORIES (INVENTORY) ============
    const listedGroups = await prisma.product.groupBy({
        by: ['category', 'dress'],
        where: {
            isActive: true
        },
        _count: {
            _all: true
        }
    });

    const listedMap = new Map();

    await Promise.all(listedGroups.map(async (group) => {
        const category = group.category || 'Uncategorized';
        const style = group.dress || 'General';
        const count = group._count._all;

        const sample = await prisma.product.findFirst({
            where: {
                category: category,
                dress: style,
                isActive: true,
                images: { some: {} }
            },
            select: { images: { take: 1, select: { url: true } } }
        });

        if (!listedMap.has(category)) {
            listedMap.set(category, []);
        }
        listedMap.get(category).push({
            name: style,
            count: count,
            image: sample?.images[0]?.url || null
        });
    }));

    const topListedCategories = Array.from(listedMap.entries()).map(([category, styles]) => {
        styles.sort((a, b) => b.count - a.count);
        return {
            category,
            styles: styles.slice(0, 10)
        };
    });

    topListedCategories.sort((a, b) => {
        const sumA = a.styles.reduce((sum, s) => sum + s.count, 0);
        const sumB = b.styles.reduce((sum, s) => sum + s.count, 0);
        return sumB - sumA;
    });

    console.log('Top Listed:', JSON.stringify(topListedCategories, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
