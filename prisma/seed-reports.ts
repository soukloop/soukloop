import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedReports() {
    try {
        console.log('🌱 Seeding reports...');

        // Get some existing users and products
        const users = await prisma.user.findMany({ take: 5 });
        const products = await prisma.product.findMany({ take: 5 });

        if (users.length < 2) {
            console.log('⚠️  Not enough users found. Please seed users first.');
            return;
        }

        if (products.length < 2) {
            console.log('⚠️  Not enough products found. Please seed products first.');
            return;
        }

        const reasons = [
            'Counterfeit item - suspected fake product',
            'Inappropriate content or images',
            'Spam or misleading description',
            'Wrong category listing',
            'Harassment in reviews',
            'Offensive profile content',
            'Price manipulation',
            'Duplicate listing',
            'Prohibited item',
            'Fake reviews or ratings'
        ];

        const statuses = ['pending', 'reviewed', 'resolved'];

        // Create sample reports
        const reportsToCreate = [];

        // Product reports
        for (let i = 0; i < 8; i++) {
            reportsToCreate.push({
                reporterId: users[i % users.length].id,
                listingId: products[i % products.length].id,
                reportedUserId: null,
                reason: reasons[i % reasons.length],
                status: statuses[i % 3],
            });
        }

        // User reports
        for (let i = 0; i < 5; i++) {
            reportsToCreate.push({
                reporterId: users[i % users.length].id,
                listingId: null,
                reportedUserId: users[(i + 1) % users.length].id,
                reason: reasons[(i + 5) % reasons.length],
                status: statuses[i % 3],
            });
        }

        // Create reports
        for (const reportData of reportsToCreate) {
            await prisma.report.create({
                data: reportData,
            });
        }

        console.log(`✅ Created ${reportsToCreate.length} sample reports`);
        console.log('✅ Reports seeding completed!');

    } catch (error) {
        console.error('❌ Error seeding reports:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    seedReports()
        .then(() => {
            console.log('🎉 Seeding process completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Fatal error during seeding:', error);
            process.exit(1);
        });
}

export { seedReports };
