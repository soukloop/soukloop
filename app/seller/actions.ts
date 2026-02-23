'use server';

import { prisma } from '@/lib/prisma';

export async function getDressStylesByCategory(categoryId: string) {
    try {
        if (!categoryId) return [];

        // Fetch styles linked to this category
        // Include both approved and pending styles
        const styles = await prisma.dressStyle.findMany({
            where: {
                categoryId: categoryId,
                status: { in: ['approved', 'pending'] }
            },
            orderBy: { name: 'asc' },
            select: { id: true, name: true, status: true }
        });


        return styles;
    } catch (error) {
        console.error('Failed to fetch dress styles', error);
        return [];
    }
}

// Utility to generate slug
function generateSlug(name: string) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

export async function createBrand(name: string) {
    try {
        if (!name.trim()) return null;
        const slug = generateSlug(name);

        // Check if exists
        const existing = await prisma.brand.findFirst({
            where: { OR: [{ name }, { slug }] }
        });

        if (existing) return { id: existing.id, name: existing.name };

        const brand = await prisma.brand.create({
            data: { name, slug, isActive: true }
        });
        return { id: brand.id, name: brand.name };
    } catch (error) {
        console.error('Failed to create brand', error);
        return null;
    }
}

export async function createMaterial(name: string) {
    try {
        if (!name.trim()) return null;
        const slug = generateSlug(name);

        const existing = await prisma.material.findFirst({
            where: { OR: [{ name }, { slug }] }
        });

        if (existing) return { id: existing.id, name: existing.name };

        const material = await prisma.material.create({
            data: { name, slug, isActive: true }
        });
        return { id: material.id, name: material.name };
    } catch (error) {
        console.error('Failed to create material', error);
        return null;
    }
}

export async function createOccasion(name: string) {
    try {
        if (!name.trim()) return null;
        const slug = generateSlug(name);

        const existing = await prisma.occasion.findFirst({
            where: { OR: [{ name }, { slug }] }
        });

        if (existing) return { id: existing.id, name: existing.name };

        const occasion = await prisma.occasion.create({
            data: { name, slug, isActive: true }
        });
        return { id: occasion.id, name: occasion.name };
    } catch (error) {
        console.error('Failed to create occasion', error);
        return null;
    }
}
