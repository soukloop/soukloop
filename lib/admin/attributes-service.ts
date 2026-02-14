
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type AttributeFilterParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    status?: string;
};

// --- Generic Helper ---
async function getPaginatedData<T>(
    model: any,
    args: any,
    page: number,
    pageSize: number
) {
    const skip = (page - 1) * pageSize;
    const [total, data] = await prisma.$transaction([
        model.count({ where: args.where }),
        model.findMany({
            ...args,
            skip,
            take: pageSize,
        })
    ]);

    return {
        data,
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        pageSize
    };
}

// --- Categories ---
export async function getPaginatedCategories({ page = 1, pageSize = 10, search = '', status }: AttributeFilterParams) {
    const where: Prisma.CategoryWhereInput = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;

    return getPaginatedData(prisma.category, {
        where,
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true, dressStyles: true } } }
    }, page, pageSize);
}

// --- Brands ---
export async function getPaginatedBrands({ page = 1, pageSize = 10, search = '', status }: AttributeFilterParams) {
    const where: Prisma.BrandWhereInput = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (status === 'active') where.isActive = true;
    else if (status === 'inactive') where.isActive = false;

    return getPaginatedData(prisma.brand, {
        where,
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } }
    }, page, pageSize);
}

// --- Colors ---
export async function getPaginatedColors({ page = 1, pageSize = 10, search = '', status }: AttributeFilterParams) {
    const where: Prisma.ColorWhereInput = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (status === 'active') where.isActive = true;
    else if (status === 'inactive') where.isActive = false;

    return getPaginatedData(prisma.color, {
        where,
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } }
    }, page, pageSize);
}

// --- States ---
export async function getPaginatedStates({ page = 1, pageSize = 10, search = '' }: AttributeFilterParams) {
    const where: Prisma.StateWhereInput = search ? {
        OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { abbreviation: { contains: search, mode: 'insensitive' } }
        ]
    } : {};

    return getPaginatedData(prisma.state, {
        where,
        orderBy: { name: 'asc' },
        include: { _count: { select: { cities: true } } }
    }, page, pageSize);
}

// --- Cities ---
export async function getPaginatedCities({ page = 1, pageSize = 10, search = '' }: AttributeFilterParams) {
    const where: Prisma.CityWhereInput = search ? {
        OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { state: { name: { contains: search, mode: 'insensitive' } } }
        ]
    } : {};

    return getPaginatedData(prisma.city, {
        where,
        orderBy: { name: 'asc' },
        include: {
            state: true,
            _count: { select: { products: true } }
        }
    }, page, pageSize);
}

// --- Materials ---
export async function getPaginatedMaterials({ page = 1, pageSize = 10, search = '', status }: AttributeFilterParams) {
    const where: Prisma.MaterialWhereInput = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (status === 'active') where.isActive = true;
    else if (status === 'inactive') where.isActive = false;

    return getPaginatedData(prisma.material, {
        where,
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } }
    }, page, pageSize);
}

// --- Occasions ---
export async function getPaginatedOccasions({ page = 1, pageSize = 10, search = '', status }: AttributeFilterParams) {
    const where: Prisma.OccasionWhereInput = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (status === 'active') where.isActive = true;
    else if (status === 'inactive') where.isActive = false;

    return getPaginatedData(prisma.occasion, {
        where,
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } }
    }, page, pageSize);
}

// --- Dress Styles ---
export async function getPaginatedDressStyles({ page = 1, pageSize = 10, search = '', status, categoryId }: AttributeFilterParams & { categoryId?: string }) {
    const where: Prisma.DressStyleWhereInput = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
    if (categoryId && categoryId !== 'all') where.categoryId = categoryId;

    const { data: dressStyles, total, totalPages, currentPage } = await getPaginatedData(prisma.dressStyle, {
        where,
        orderBy: { name: 'asc' },
        include: {
            category: true,
            _count: { select: { products: true } }
        }
    }, page, pageSize);

    // Filter requests? User mentioned separately, but previously mixed. 
    // Data service should just return DressStyles. Requests are separate model.
    // I'll return DressStyles here.

    return {
        data: dressStyles, // Type inference or mapping?
        total,
        totalPages,
        currentPage,
        pageSize
    };
}
