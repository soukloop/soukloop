'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- Generic Helpers ---
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

// --- Categories ---
export async function createCategory(data: { name: string; description: string; status: string }) {
    try {
        const slug = generateSlug(data.name);
        // Check uniqueness
        const existing = await prisma.category.findFirst({
            where: { OR: [{ name: { equals: data.name, mode: 'insensitive' } }, { slug }] }
        });
        if (existing) return { error: 'Category already exists' };

        await prisma.category.create({
            data: { ...data, slug }
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        console.error('Create Category Error:', error);
        return { error: 'Failed to create category' };
    }
}

export async function updateCategory(id: string, data: { name: string; description: string; status: string }) {
    try {
        await prisma.category.update({
            where: { id },
            data
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update category' };
    }
}

export async function deleteCategory(id: string) {
    try {
        await prisma.category.delete({ where: { id } });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete category' };
    }
}


// --- Brands ---
export async function createBrand(data: { name: string; isPopular?: boolean; logo?: string; isActive?: boolean }) {
    try {
        const slug = generateSlug(data.name);
        const existing = await prisma.brand.findFirst({
            where: { OR: [{ name: { equals: data.name, mode: 'insensitive' } }, { slug }] }
        });
        if (existing) return { error: 'Brand already exists' };

        await prisma.brand.create({
            data: { ...data, slug, isActive: true }
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to create brand' };
    }
}

export async function updateBrand(id: string, data: { name: string; isPopular?: boolean; logo?: string; isActive?: boolean }) {
    try {
        await prisma.brand.update({
            where: { id },
            data: { ...data, slug: generateSlug(data.name) }
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update brand' };
    }
}

export async function deleteBrand(id: string) {
    try {
        await prisma.brand.delete({ where: { id } });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete brand' };
    }
}

export async function toggleBrandStatus(id: string, isActive: boolean) {
    try {
        await prisma.brand.update({
            where: { id },
            data: { isActive }
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update brand status' };
    }
}


// --- Colors ---
export async function createColor(data: { name: string; hexCode: string; isActive?: boolean }) {
    try {
        const slug = generateSlug(data.name);
        const existing = await prisma.color.findFirst({
            where: { OR: [{ name: { equals: data.name, mode: 'insensitive' } }, { slug }] }
        });
        if (existing) return { error: 'Color already exists' };

        await prisma.color.create({
            data: { ...data, slug, isActive: true }
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to create color' };
    }
}

export async function updateColor(id: string, data: { name: string; hexCode: string; isActive?: boolean }) {
    try {
        await prisma.color.update({
            where: { id },
            data: { ...data, slug: generateSlug(data.name) }
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update color' };
    }
}

export async function deleteColor(id: string) {
    try {
        await prisma.color.delete({ where: { id } });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete color' };
    }
}

export async function toggleColorStatus(id: string, isActive: boolean) {
    try {
        await prisma.color.update({
            where: { id },
            data: { isActive }
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update color status' };
    }
}

// Note: State & City models are not in the Prisma schema.
// Location data is stored directly as string fields on Product/Address models.


import { notifySellerStyleApproved, notifySellerProductListed, notifyFollowersNewProduct } from '@/lib/notifications/templates/product-templates';

// --- Helper for Approval Notifications ---
async function handleDressStyleApproval(styleId: string, styleName: string) {
    try {
        console.log(`[Approval] Processing approval for style: ${styleName} (${styleId})`);

        // 1. Notify Requesters
        const requests = await prisma.dressStyleRequest.findMany({
            where: { dressStyleId: styleId },
            select: { requesterId: true }
        });

        for (const req of requests) {
            await notifySellerStyleApproved(req.requesterId, styleName)
                .catch(e => console.error('[Approval] Failed to notify requester:', e));
        }

        // 2. Process Pending Products (Activate & Notify)
        const products = await prisma.product.findMany({
            where: { dressStyleId: styleId, hasPendingStyle: true },
            include: {
                images: {
                    where: { isPrimary: true },
                    take: 1
                },
                vendor: { select: { userId: true } }
            }
        });

        console.log(`[Approval] Found ${products.length} pending products to activate.`);

        if (products.length > 0) {
            // Update DB: Set hasPendingStyle = false
            await prisma.product.updateMany({
                where: { dressStyleId: styleId, hasPendingStyle: true },
                data: { hasPendingStyle: false }
            });

            // Notify Owners and Followers
            for (const p of products) {
                const notifData = {
                    productId: p.id,
                    productName: p.name,
                    productSlug: p.slug,
                    price: p.price ? Number(p.price) : undefined,
                    imageUrl: p.images[0]?.url
                };
                const sellerId = p.vendor.userId;

                // Notify Seller "Product is Live"
                await notifySellerProductListed(sellerId, notifData)
                    .catch(e => console.error('[Approval] Failed to notify seller product live:', e));

                // Notify Followers
                await notifyFollowersNewProduct(sellerId, notifData)
                    .catch(e => console.error('[Approval] Failed to notify followers:', e));
            }

            // ✅ Activate any deferred 'paid' boosts for these newly-live products
            // These boosts were paid for before the dress style was approved,
            // so the timer was intentionally not started at payment time.
            const productIds = products.map(p => p.id);
            const deferredBoosts = await prisma.productBoost.findMany({
                where: { productId: { in: productIds }, status: 'paid' }
            });

            for (const boost of deferredBoosts) {
                const startDate = new Date();
                let durationMs = 3 * 24 * 60 * 60 * 1000; // default 3 days
                if (boost.packageType === '7_DAYS') durationMs = 7 * 24 * 60 * 60 * 1000;
                else if (boost.packageType === '15_DAYS') durationMs = 15 * 24 * 60 * 60 * 1000;

                await prisma.productBoost.update({
                    where: { id: boost.id },
                    data: {
                        status: 'active',
                        startDate,
                        endDate: new Date(startDate.getTime() + durationMs)
                    }
                }).catch(e => console.error(`[Approval] Failed to activate deferred boost ${boost.id}:`, e));

                console.log(`[Approval] Deferred boost ${boost.id} timer started for product ${boost.productId}`);
            }
        }
    } catch (error) {
        console.error('[Approval] Error handling dress style approval:', error);
    }
}

// --- Dress Styles ---
// Must handle category linking relationally
export async function createDressStyle(data: { name: string; categoryId: string; status: string }) {
    try {
        const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
        if (!category) return { error: 'Invalid Category' };

        const slug = generateSlug(data.name);

        const style = await prisma.dressStyle.create({
            data: {
                name: data.name,
                slug,
                status: data.status,
                categoryId: data.categoryId,
                categoryType: category.name // Populate legacy field
            }
        });

        // Use helper if created as approved immediately (unlikely via form, but good for consistency)
        if (data.status === 'approved') {
            // Usually no pending products yet, but safe to call
            await handleDressStyleApproval(style.id, style.name);
        }

        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to create dress style' };
    }
}

export async function updateDressStyle(id: string, data: { name: string; categoryId: string; status: string }) {
    try {
        const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
        if (!category) return { error: 'Invalid Category' };

        // Check if status is changing to approved
        const current = await prisma.dressStyle.findUnique({ where: { id }, select: { status: true } });
        const isApproving = current?.status !== 'approved' && data.status === 'approved';

        const updated = await prisma.dressStyle.update({
            where: { id },
            data: {
                name: data.name,
                slug: generateSlug(data.name),
                status: data.status,
                categoryId: data.categoryId,
                categoryType: category.name
            }
        });

        if (isApproving) {
            await handleDressStyleApproval(updated.id, updated.name);
        }

        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update dress style' };
    }
}

export async function deleteDressStyle(id: string) {
    try {
        await prisma.dressStyle.delete({ where: { id } });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete dress style' };
    }
}

export async function suspendDressStyle(id: string, action: 'suspend' | 'activate') {
    try {
        const updated = await prisma.dressStyle.update({
            where: { id },
            data: { status: action === 'suspend' ? 'suspended' : 'approved' }
        });

        if (action === 'activate') {
            await handleDressStyleApproval(updated.id, updated.name);
        }

        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
    }
}

export async function toggleCategoryStatus(id: string, status: string) {
    try {
        await prisma.category.update({
            where: { id },
            data: { status }
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to update category status' };
    }
}
