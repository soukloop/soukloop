import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-wrapper';
import { verifyAdminAuth } from '@/lib/admin/auth-utils';
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const banners = await prisma.banner.findMany({
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(banners)

    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json()
        const { title, description, imageUrl, link, startDate, endDate, isActive } = body

        // Safe date conversion
        const start = startDate ? new Date(startDate) : new Date();
        const end = endDate ? new Date(endDate) : new Date();

        const banner = await prisma.banner.create({
            data: {
                title,
                description,
                imageUrl,
                link: link || null,
                startDate: start,
                endDate: end,
                isActive: isActive !== undefined ? isActive : true
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Banner created successfully',
            banner
        }, { status: 201 })

    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json()
        const { id, title, description, imageUrl, link, startDate, endDate, isActive } = body

        if (!id) {
            return NextResponse.json({ error: 'Banner ID required' }, { status: 400 })
        }

        const updateData: any = {
            title,
            description,
            imageUrl,
            link,
            isActive
        };

        if (startDate) updateData.startDate = new Date(startDate);
        if (endDate) updateData.endDate = new Date(endDate);

        const banner = await prisma.banner.update({
            where: { id },
            data: updateData
        })

        return NextResponse.json({
            success: true,
            message: 'Banner updated successfully',
            banner
        })

    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Banner ID required' }, { status: 400 })
        }

        await prisma.banner.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Banner deleted successfully'
        })

    } catch (error) {
        return handleApiError(error);
    }
}
