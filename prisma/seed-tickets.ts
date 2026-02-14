import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTickets() {
    try {
        console.log('🎫 Seeding support tickets...');

        // Get some existing users
        const users = await prisma.user.findMany({ take: 10 });

        if (users.length === 0) {
            console.log('⚠️  No users found. Please seed users first.');
            return;
        }

        const statuses = ['open', 'in progress', 'resolved', 'closed'];
        const priorities = ['low', 'medium', 'high', 'urgent'];
        const subjects = [
            'Login Issues',
            'Payment Failed',
            'Order Not Received',
            'Refund Request',
            'Product Quality Issue',
            'Account Verification',
            'Shipping Delay',
            'Wrong Item Received',
            'Technical Error',
            'Feature Request'
        ];
        const assignments = ['Support Team A', 'Support Team B', 'Technical Team', null];

        const ticketsToCreate = [];

        // Create sample tickets
        for (let i = 0; i < 20; i++) {
            const user = users[i % users.length];
            const subject = subjects[i % subjects.length];
            const status = statuses[i % statuses.length];
            const priority = priorities[i % priorities.length];
            const assignedTo = assignments[i % assignments.length];
            const daysAgo = Math.floor(Math.random() * 14);

            ticketsToCreate.push({
                userId: user.id,
                subject: subject,
                description: `This is a detailed description for ${subject}. The issue occurred ${daysAgo} days ago and needs attention.`,
                status: status,
                priority: priority,
                assignedTo: assignedTo,
                createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - Math.floor(daysAgo / 2) * 24 * 60 * 60 * 1000)
            });
        }

        // Create tickets
        for (const ticketData of ticketsToCreate) {
            await prisma.supportTicket.create({
                data: ticketData
            });
        }

        console.log(`✅ Created ${ticketsToCreate.length} sample tickets`);
        console.log('✅ Tickets seeding completed!');

    } catch (error) {
        console.error('❌ Error seeding tickets:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    seedTickets()
        .then(() => {
            console.log('🎉 Seeding process completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Fatal error during seeding:', error);
            process.exit(1);
        });
}

export { seedTickets };
