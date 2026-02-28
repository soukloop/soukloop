import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { Role } from '@prisma/client'
import { handleApiError } from '@/lib/api-wrapper'
import { notifySellerProductListed, notifyFollowersNewProduct, notifySellerProductPending } from '@/lib/notifications/templates/product-templates'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session = await auth()
    const mode = request.nextUrl.searchParams.get('mode');

    // ── Lightweight edit-mode query (skips reviews, orders, vendor details) ──
    if (mode === 'edit') {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          images: { orderBy: { order: 'asc' } },
          vendor: { select: { userId: true } }
        }
      });

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      // Ownership check
      const isOwner = session?.user?.id && product.vendor?.userId === session.user.id;
      const isAdmin = session?.user?.role === Role.ADMIN;
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json({ ...product, vendor: undefined });
    }

    // ── Full product query (product detail page, public view) ──

    // Create visibility window for PENDING orders (15 minutes)
    const freshPendingThreshold = new Date(Date.now() - 15 * 60 * 1000);
    // Stale order cleanup threshold (30 minutes)
    const staleOrderThreshold = new Date(Date.now() - 30 * 60 * 1000);



    // Helper to get product includes
    const productIncludes = {
      vendor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              profile: {
                select: { avatar: true }
              }
            }
          }
        }
      },
      images: true,
      reviews: {
        include: {
          user: {
            select: { name: true, image: true }
          }
        },
        orderBy: { createdAt: 'desc' as const }
      },
      _count: {
        select: { reviews: true }
      },
      // Check for active orders to determine PROCESSING status
      orderItems: {
        where: {
          OR: [
            { order: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } } },
            {
              order: {
                status: 'PENDING',
                createdAt: { gte: freshPendingThreshold }
              }
            }
          ]
        },
        include: {
          order: {
            select: {
              status: true,
              createdAt: true
            }
          }
        }
      }
    };

    let product = await (prisma.product as any).findUnique({
      where: { id },
      include: productIncludes
    })

    // If not found by ID, try finding by SLUG
    if (!product) {
      product = await (prisma.product as any).findFirst({
        where: { slug: id },
        include: productIncludes
      });
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // 3. Visibility Check (Security Fix)
    const isOwner = session?.user?.id && product.vendor?.userId === session.user.id;
    const isAdmin = session?.user?.role === Role.ADMIN;

    // Vendor Status Checks
    const isVendorApproved = product.vendor?.kycStatus === 'APPROVED';
    const isVendorActive = product.vendor?.isActive;

    // Logic: If product is suspended/inactive OR pending OR vendor is not approved/active
    // ONLY Owner or Admin can see it.
    const isVisible = product.isActive &&
      !product.hasPendingStyle &&
      isVendorApproved &&
      isVendorActive;

    if (!isVisible && !isOwner && !isAdmin) {
      // Return 404 to hide existence of suspended/invalid products from public
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Map computed status
    let status = 'ACTIVE';
    // Check for active or recent pending orders
    const hasActiveOrder = product.orderItems && product.orderItems.length > 0;

    if (!product.isActive && product.status === 'BLOCKED') {
      // Admin-blocked: preserve BLOCKED status
      status = 'BLOCKED';
    } else if (!product.isActive) {
      status = 'INACTIVE';
    } else if (hasActiveOrder) {
      // If it has an active or fresh pending order:
      // 1. Owner/Admin sees it as PROCESSING
      // 2. Others see it as SOLD (prevent ordering)
      if (isAdmin || isOwner) {
        status = 'PROCESSING';
      } else {
        status = 'SOLD';
      }
    } else if (product.status === 'SOLD') {
      status = 'SOLD';
    }

    return NextResponse.json({
      ...product,
      orderItems: undefined,
      status
    })

  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // 1. Auth Check
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, role } = session.user;
    const body = await request.json()

    // 2. Ownership Verification
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { vendor: true }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Admin can edit anything. Sellers can only edit their own.
    const isOwner = existingProduct.vendor.userId === userId;
    const isAdmin = role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You do not own this product" }, { status: 403 });
    }

    const updateData: any = {
      name: body.name,
      description: body.description,
      price: body.price ? parseFloat(String(body.price)) : undefined,
      category: body.category,
      categoryId: body.categoryId || undefined,

      isActive: body.isActive !== undefined ? body.isActive : undefined,
      // Missing fields added for professional consistency
      brand: body.brand,
      brandId: body.brandId || undefined,
      condition: body.condition,
      gender: body.gender,
      size: body.size,
      color: body.color,
      colorId: body.colorId || undefined,
      fabric: body.fabric,
      materialId: body.materialId || undefined,
      occasion: body.occasion,
      occasionId: body.occasionId || undefined,
      dress: body.dress,
      dressStyleId: body.dressStyleId || undefined,
      // cityId not on Product model — location is stored as a string
      location: body.location || body.state || undefined,
      tags: Array.isArray(body.tags) ? body.tags.join(',') : body.tags,
      video: body.video,
      hasPendingStyle: body.hasPendingStyle !== undefined ? body.hasPendingStyle : undefined
    }

    // Handle explicit status updates and drafts
    if (body.isDraft) {
      updateData.isActive = false;
      updateData.status = 'DRAFT';
    } else if (body.status === 'INACTIVE') {
      updateData.isActive = false;
    } else if (body.status === 'SOLD') {
      updateData.status = 'SOLD';
    } else if (body.status === 'ACTIVE' || (!body.isDraft && existingProduct.status === 'DRAFT')) {
      // If publishing a draft or explicitly activating
      updateData.isActive = true;
      updateData.status = 'ACTIVE';
    }

    const originalHasPendingStyle = existingProduct.hasPendingStyle;

    const product = await prisma.$transaction(async (tx) => {
      // Handle image updates if provided
      if (body.images && Array.isArray(body.images)) {
        // Delete existing images
        await tx.productImage.deleteMany({ where: { productId: id } });
        // Create new images
        await tx.productImage.createMany({
          data: body.images.map((img: any, index: number) => ({
            productId: id,
            url: img.url,
            alt: img.alt || `Photo ${index + 1}`,
            order: img.order ?? index,
            isPrimary: img.isPrimary ?? index === 0,
          })),
        });
      }

      return tx.product.update({
        where: { id },
        data: updateData,
        include: {
          images: true,
          vendor: true,
          dressStyle: true
        }
      });
    });

    // ===== SEND NOTIFICATIONS (fire-and-forget) =====
    const newHasPendingStyle = product.hasPendingStyle;

    // Only trigger notifications if the pending status changed or if it's currently pending
    if (newHasPendingStyle !== originalHasPendingStyle || newHasPendingStyle) {
      const sellerId = product.vendor.userId;
      const productNotifData = {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        price: product.price ? Number(product.price) : undefined,
        imageUrl: product.images?.[0]?.url
      };

      if (newHasPendingStyle) {
        // Notify seller about PENDING status
        const styleName = product.dressStyle?.name || body.dress || 'Requested Style';
        notifySellerProductPending(sellerId, productNotifData, styleName)
          .catch(err => console.error('[Product PATCH] Failed to notify pending:', err));
      } else if (originalHasPendingStyle && !newHasPendingStyle) {
        // Product was pending and is now LIVE
        notifySellerProductListed(sellerId, productNotifData)
          .catch(err => console.error('[Product PATCH] Failed to notify live:', err));

        notifyFollowersNewProduct(sellerId, productNotifData)
          .catch(err => console.error('[Product PATCH] Failed to notify followers:', err));
      }
    }

    return NextResponse.json(product)

  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // 1. Auth Check
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Ownership Verification
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { vendor: true }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const isOwner = existingProduct.vendor.userId === session.user.id;
    const isAdmin = session.user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    return handleApiError(error);
  }
}
