
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const seedTestimonials = async () => {
    console.log('Creating testimonials...');

    const testimonials = [
        {
            name: "Sarah Johnson",
            location: "New York",
            rating: 5,
            text: "Absolutely love this bag! The leather feels premium, and the design is so sleek. It goes with everything and fits all my essentials—stylish and practical!",
            profileImage: "/woman-profile-1.png",
            productImage: "/testimonials/handbag-beige.png",
            isActive: true,
        },
        {
            name: "Emma Williams",
            location: "London",
            rating: 5,
            text: "Absolutely love this Dress! The fabric feels premium, and the design is so elegant. Perfect for any occasion—stylish and comfortable!",
            profileImage: "/woman-profile-2.png",
            productImage: "/testimonials/pink-pleated-dress.png",
            isActive: true,
        },
        {
            name: "Maria Garcia",
            location: "Los Angeles",
            rating: 5,
            text: "Amazing quality! The coat is exactly what I was looking for. Warm, stylish, and the color is beautiful. Highly recommend!",
            profileImage: "/woman-profile-3.png",
            productImage: "/testimonials/pink-coat.png",
            isActive: true,
        },
        {
            name: "Amina Khan",
            location: "Dubai",
            rating: 4,
            text: "Great fast delivery. The material is very soft and comfortable. Just the size was slightly larger than expected but still fits nicely.",
            profileImage: "/woman-profile-4.png", // Assuming existence or placeholder
            productImage: "/testimonials/handbag-beige.png",
            isActive: true,
        }
    ];

    const createdTestimonials = await Promise.all(
        testimonials.map(t =>
            prisma.testimonial.create({
                data: t
            })
        )
    );

    console.log(`✓ Created ${createdTestimonials.length} testimonials`);
};
