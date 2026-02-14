import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBanners() {
    try {
        console.log('🎨 Seeding banners...');

        const banners = [
            {
                title: 'Summer Sale 2024',
                description: 'Up to 50% off on summer collection - Limited time offer!',
                imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=400&fit=crop',
                link: '/products?season=summer',
                startDate: new Date('2024-06-01'),
                endDate: new Date('2024-08-31'),
                isActive: true
            },
            {
                title: 'New Arrivals - Fall Collection',
                description: 'Discover the latest trends for this season',
                imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop',
                link: '/products?category=new-arrivals',
                startDate: new Date('2024-09-01'),
                endDate: new Date('2024-11-30'),
                isActive: false
            },
            {
                title: 'Black Friday Mega Sale',
                description: 'Biggest sale of the year - Save up to 70%',
                imageUrl: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&h=400&fit=crop',
                link: '/products?sale=black-friday',
                startDate: new Date('2024-11-25'),
                endDate: new Date('2024-11-30'),
                isActive: false
            },
            {
                title: 'Free Shipping Weekend',
                description: 'Free shipping on all orders this weekend only!',
                imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
                link: '/products',
                startDate: new Date('2024-05-10'),
                endDate: new Date('2024-05-12'),
                isActive: true
            },
            {
                title: 'Designer Brands Exclusive',
                description: 'Shop from top designer brands with exclusive discounts',
                imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=400&fit=crop',
                link: '/products?type=designer',
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
                isActive: true
            }
        ];

        for (const bannerData of banners) {
            await prisma.banner.create({
                data: bannerData
            });
        }

        console.log(`✅ Created ${banners.length} sample banners`);
        console.log('✅ Banners seeding completed!');

    } catch (error) {
        console.error('❌ Error seeding banners:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    seedBanners()
        .then(() => {
            console.log('🎉 Seeding process completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Fatal error during seeding:', error);
            process.exit(1);
        });
}

export { seedBanners };
