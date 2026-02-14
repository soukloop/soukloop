
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createMaterial(data: { name: string }) {
    try {
        const slug = data.name.toLowerCase().replace(/\s+/g, '-');
        const material = await prisma.material.create({
            data: {
                name: data.name,
                slug,
            },
        });
        revalidatePath('/admin/categories');
        return { success: true, data: material };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateMaterial(id: string, data: { name: string }) {
    try {
        const slug = data.name.toLowerCase().replace(/\s+/g, '-');
        const material = await prisma.material.update({
            where: { id },
            data: {
                name: data.name,
                slug,
            },
        });
        revalidatePath('/admin/categories');
        return { success: true, data: material };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleMaterialStatus(id: string, isActive: boolean) {
    try {
        await prisma.material.update({
            where: { id },
            data: { isActive },
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteMaterial(id: string) {
    try {
        await prisma.material.delete({
            where: { id },
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
