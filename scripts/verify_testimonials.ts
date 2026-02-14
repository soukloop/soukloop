
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Fetching testimonials...');
        const testimonials = await prisma.testimonial.findMany({
            include: {
                product: true
            },
            take: 1
        });
        console.log('Success!', testimonials);
    } catch (e) {
        console.error('Error fetching testimonials:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
