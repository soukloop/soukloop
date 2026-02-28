
import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-wrapper';
import { ProductSchema } from '@/lib/validations';
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { isAtLeastAdmin } from '@/lib/roles'
import { generateUniqueSlug } from '@/lib/slug'
import { notifySellerProductListed, notifyFollowersNewProduct, notifySellerProductPending } from '@/lib/notifications/templates/product-templates'

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const { searchParams } = new URL(request.url)

        // Cache Configuration for Public Feed
        const headers = new Headers();
        // Cache for 60s (fresh), serve stale for 5 mins while revalidating
        headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const q = searchParams.get('q') || ''
        const category = searchParams.get('category') || ''
        const location = searchParams.get('location') || searchParams.get('state') || ''

        // New filters
        const brand = searchParams.get('brand') || ''
        const condition = searchParams.get('condition') || ''
        const size = searchParams.get('size') || ''
        const gender = searchParams.get('gender') || ''
        const fabric = searchParams.get('fabric') || ''
        const occasion = searchParams.get('occasion') || ''
        const dress = searchParams.get('dress') || ''
        const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
        const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
        const onSale = searchParams.get('onSale') === 'true'
        const ids = searchParams.get('ids')?.split(',').filter(Boolean)
        const includeInactive = searchParams.get('includeInactive') === 'true';
        const includePending = searchParams.get('includePending') === 'true';
        const sold = searchParams.get('sold') || 'false';
        const dressStyleId = searchParams.get('dressStyleId');
        const minRating = searchParams.get('minRating');

        // Relational ID filters
        const categoryId = searchParams.get('categoryId');
        const brandId = searchParams.get('brandId');
        const colorId = searchParams.get('colorId');
        const materialId = searchParams.get('materialId');
        const occasionId = searchParams.get('occasionId');
        const cityId = searchParams.get('cityId');

        // Check if admin
        const isAdmin = isAtLeastAdmin(session?.user?.role);
        const currentUserId = session?.user?.id;

        // Base filter for Guests/Public
        // 1. Vendor must be APPROVED and ACTIVE
        // 2. Product must be ACTIVE
        const publicFilter = {
            status: 'ACTIVE',
            hasPendingStyle: false,
            isActive: true
        };

        // Build where clause
        const where: any = {}

        if (isAdmin) {
            // Admins see EVERYTHING. No base filters applied.
        } else if (currentUserId) {
            // SELLER / Logged-in User
            // See (Public Items) OR (Own Items)
            where.OR = [
                publicFilter,
                {
                    vendor: {
                        userId: currentUserId
                    },
                    status: { not: 'DRAFT' } // Prevent drafts from bleeding into public views
                }
            ];
        } else {
            // GUEST
            Object.assign(where, publicFilter);
        }

        // Apply remaining filters on top of the persona-aware base
        const applyCommonFilters = (target: any) => {
            if (ids && ids.length > 0) target.id = { in: ids };
            if (category && category !== 'all') {
                target.OR = [
                    { category: { equals: category, mode: 'insensitive' } },
                    { categoryRel: { slug: category } }
                ];
            }
            if (categoryId) target.categoryId = categoryId;
            if (q) {
                target.AND = target.AND || [];
                target.AND.push({
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { description: { contains: q, mode: 'insensitive' } },
                        { dress: { contains: q, mode: 'insensitive' } },
                        { tags: { contains: q, mode: 'insensitive' } }
                    ]
                });
            }
            if (brand) target.brand = { contains: brand, mode: 'insensitive' };
            if (brandId) target.brandId = brandId;
            if (location) target.location = { equals: location, mode: 'insensitive' };
            if (condition && condition !== 'all') target.condition = condition;
            if (gender && gender !== 'all') target.gender = gender;
            if (size && size !== 'all') target.size = size;
            // Prioritize relational fields over legacy string fields
            if (materialId) target.materialId = materialId;
            else if (fabric && fabric !== 'all') target.fabric = fabric;

            if (occasionId) target.occasionId = occasionId;
            else if (occasion && occasion !== 'all') target.occasion = occasion;
            if (dress && dress !== 'all') target.dress = { contains: dress, mode: 'insensitive' };
            if (dressStyleId) target.dressStyleId = dressStyleId;
            if (colorId) target.colorId = colorId;
            // cityId is not a direct field on Product model
            if (onSale) {
                target.isOnSale = true;
                target.comparePrice = { not: null };
            }
            if (minPrice !== undefined || maxPrice !== undefined) {
                target.price = target.price || {};
                if (minPrice !== undefined) target.price.gte = minPrice;
                if (maxPrice !== undefined) target.price.lte = maxPrice;
            }

            // USE THE NEW STATUS FIELD FOR SOLD FILTERS
            if (sold === 'true') target.status = 'SOLD';
            else if (sold === 'false') target.status = 'ACTIVE';

            if (minRating) target.averageRating = { gte: parseFloat(minRating) };
        };

        // If we have an OR from the persona logic, we must apply filters inside each OR branch or wrap it
        if (where.OR) {
            where.OR.forEach((branch: any) => applyCommonFilters(branch));
        } else {
            applyCommonFilters(where);
        }

        // Filter by userId (Vendor's products) specifically if requested
        const userId = searchParams.get('userId')
        if (userId) {
            const isTargetOwner = currentUserId === userId;

            if (isAdmin || isTargetOwner) {
                delete where.OR;
                const vendor = await prisma.vendor.findUnique({ where: { userId } });
                where.vendorId = vendor?.id || 'non-existent-id';
                applyCommonFilters(where);
            } else {
                if (where.OR) {
                    where.OR.forEach((branch: any) => {
                        branch.vendor = { ...branch.vendor, userId };
                    });
                } else {
                    where.vendor = { ...where.vendor, userId };
                }
            }
        }

        const skip = (page - 1) * limit;

        // Support dynamic sorting
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Validate sortBy field to prevent injection/errors
        const validSortFields = ['createdAt', 'price', 'viewCount', 'averageRating'];
        const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const orderByOrder = sortOrder === 'asc' ? 'asc' : 'desc';

        // OPTIMIZATION: DTO SELECT PATTERN
        // We only fetch minimal data for the grid (thumbnail + hover image)
        // This removes ~80% of the JSON payload size
        const productsQuery = prisma.product.findMany({
            where,
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                comparePrice: true,
                category: true,
                size: true,
                brand: true,
                condition: true,
                gender: true,
                fabric: true,
                occasion: true,
                dress: true,
                isOnSale: true,
                hasPendingStyle: true,
                vendorId: true,
                createdAt: true,
                isActive: true,
                status: true,
                // Include relational data for proper display
                material: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                },
                occasionRel: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                },
                vendor: {
                    select: {
                        id: true,
                        userId: true,
                        kycStatus: true,
                        isActive: true
                    }
                },
                images: {
                    take: 2, // Only need Primary + Hover
                    select: {
                        url: true,
                        isPrimary: true
                    }
                }
            },
            orderBy: {
                [orderByField]: orderByOrder
            },
            take: limit,
            skip: skip,
        });

        // OPTIMIZATION: PARALLEL EXECUTION
        // Hybrid Strategy: Parallel Count + Fetch
        // Run count and data fetch at the same time to reduce total request duration
        const [products, total] = await Promise.all([
            productsQuery,
            prisma.product.count({ where })
        ]);

        // If User is owner, we might want to fetch pending order stats for these products
        // This is a "N+1" avoidance optimization. We do a separate aggregation if needed, or mapping.
        // Actually, Prisma's `include: { _count: ... }` is best, but we are using `select`.
        // Let's attach counts manually if currentUserId matches userId param (Meaning Owner View) OR IS ADMIN
        let productsWithCounts = products as any[];

        if (userId && (currentUserId === userId || isAdmin)) {
            // Fetch pending counts in bulk to avoid N+1
            const productIds = products.map(p => p.id);

            // We want to count OrderItems where the Order Status is PENDING or PAID
            // Prisma doesn't support "deep filtered count" easily in the main select without include.
            // So we run a groupBy.
            const pendingCounts = await prisma.orderItem.groupBy({
                by: ['productId'],
                where: {
                    productId: { in: productIds },
                    order: {
                        status: { in: ['PENDING', 'PAID'] }
                    }
                },
                _count: {
                    _all: true
                }
            });

            const countMap = new Map(pendingCounts.map(c => [c.productId, c._count._all]));

            productsWithCounts = products.map(p => ({
                ...p,
                pendingOrderCount: countMap.get(p.id) || 0
            }));
        }

        const mappedProducts = productsWithCounts.map(product => ({
            ...product,
            // Map images to expected format for frontend (array of objects with url)
            images: product.images
        }));

        return NextResponse.json({
            items: mappedProducts,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }, { headers })

    } catch (error: any) {
        console.error('Products GET error:', error)
        console.error('Stack:', error.stack)
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error.message,
                stack: error.stack,
                details: JSON.stringify(error, Object.getOwnPropertyNames(error))
            },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const isDraft = body.isDraft === true;

        // Validation Setup
        let name, description, price, category, categoryId, images,
            gender, fabric, materialId, dress, dressStyleId, occasion, occasionId, video,
            condition, size, tags, brand, brandId, color, colorId, location, state, city, cityId;

        if (isDraft) {
            // For drafts, we only strictly require the name
            if (!body.name) {
                return NextResponse.json(
                    { error: "Validation Failed", details: { name: { _errors: ["Name is required even for drafts"] } } },
                    { status: 400 }
                );
            }
            // Manually map fields since we bypass Zod
            ({
                name, description, price, category, categoryId, images,
                gender, fabric, materialId, dress, dressStyleId, occasion, occasionId, video,
                condition, size, tags, brand, brandId, color, colorId, location, state, city, cityId
            } = body);
        } else {
            // Zod Validation for Published Products
            const validation = ProductSchema.safeParse(body);
            if (!validation.success) {
                return NextResponse.json(
                    { error: "Validation Failed", details: validation.error.format() },
                    { status: 400 }
                );
            }
            ({
                name, description, price, category, categoryId, images,
                gender, fabric, materialId, dress, dressStyleId, occasion, occasionId, video,
                condition, size, tags, brand, brandId, color, colorId, location, state, city, cityId
            } = validation.data);
        }

        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id },
            include: {
                user: {
                    include: {
                        addresses: true
                    }
                }
            }
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
        }

        // Check if dress style is pending
        let hasPendingStyle = false;
        if (dressStyleId) {
            const dressStyle = await prisma.dressStyle.findUnique({
                where: { id: dressStyleId }
            });
            if (dressStyle?.status === 'pending') {
                hasPendingStyle = true;
            }
        }

        // Auto-fill location (State) if not provided
        let productLocation = location || '';
        if (!productLocation && vendor.user.addresses && vendor.user.addresses.length > 0) {
            const defaultAddress = vendor.user.addresses.find((a: any) => a.isDefault) || vendor.user.addresses[0];
            if (defaultAddress?.state) {
                productLocation = defaultAddress.state;
            }
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                category,
                vendorId: vendor.id,
                slug: await generateUniqueSlug(name, prisma.product),
                categoryId: categoryId || undefined,
                // New fields
                gender,
                fabric,
                dress,
                dressStyleId,
                hasPendingStyle,
                occasion,
                occasionId: occasionId || undefined,
                materialId: materialId || undefined,
                video,
                condition,
                brand,
                brandId: brandId || undefined,
                // cityId not on Product model — location is stored as a string
                color,
                colorId: colorId || undefined,
                size,
                tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
                status: isDraft ? 'DRAFT' : 'ACTIVE',
                isActive: !isDraft,
                // Relations are temporarily disabled due to Prisma client sync issue (EPERM during generate)
                // They will be restored once the environment allows for client regeneration.

                // Legacy Location String (Formatted)
                location: (city && state) ? `${city}, ${state}` : (state ? state : (location || productLocation)),

                images: {
                    create: images?.map((img: any, index: number) => ({
                        url: img.url,
                        alt: img.alt || name,
                        order: index,
                        isPrimary: index === 0
                    })) || []
                }
            },
            include: {
                images: true,
                vendor: true,
                dressStyle: true
            }
        })

        // ===== SEND NOTIFICATIONS (fire-and-forget) =====
        if (!isDraft) {
            const sellerId = vendor.userId
            const productNotifData = {
                productId: product.id,
                productName: product.name,
                productSlug: product.slug,
                price: product.price ? Number(product.price) : undefined,
                imageUrl: product.images?.[0]?.url
            }

            if (hasPendingStyle) {
                // 1. Notify seller about PENDING listing (waiting for approval)
                // We pass the dress style name if available, or just 'Pending Style'
                // We can fetch it or just use "New Style" text logic in template
                const styleName = dressStyleId ? (await prisma.dressStyle.findUnique({ where: { id: dressStyleId }, select: { name: true } }))?.name : 'New Style';

                notifySellerProductPending(sellerId, productNotifData, styleName)
                    .catch(err => console.error('[Product] Seller pending notification failed:', err))

                // 2. DO NOT notify followers yet.
            } else {
                // 1. Notify seller about successful listing (LIVE)
                notifySellerProductListed(sellerId, productNotifData)
                    .catch(err => console.error('[Product] Seller listing notification failed:', err))

                // 2. Notify all followers of the seller
                notifyFollowersNewProduct(sellerId, productNotifData)
                    .catch(err => console.error('[Product] Follower notifications failed:', err))
            }
        }

        return NextResponse.json(product, { status: 201 })

    } catch (error) {
        return handleApiError(error);
    }
}
