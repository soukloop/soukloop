
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createOccasion(data: { name: string }) {
    try {
        const slug = data.name.toLowerCase().replace(/\s+/g, '-');
        const occasion = await prisma.occasion.create({
            data: {
                name: data.name,
                slug,
            },
        });
        revalidatePath('/admin/categories');
        return { success: true, data: occasion };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateOccasion(id: string, data: { name: string }) {
    try {
        const slug = data.name.toLowerCase().replace(/\s+/g, '-');
        const occasion = await prisma.occasion.update({
            where: { id },
            data: {
                name: data.name,
                slug,
            },
        });
        revalidatePath('/admin/categories');
        return { success: true, data: occasion };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleOccasionStatus(id: string, isActive: boolean) {
    try {
        await prisma.occasion.update({
            where: { id },
            data: { isActive },
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteOccasion(id: string) {
    try {
        await prisma.occasion.delete({
            where: { id },
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
