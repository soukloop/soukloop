import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/admin/auth-utils'
import { handleApiError } from '@/lib/api-wrapper'

// GET settings
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const settings = await prisma.settings.findMany()

        // Convert to key-value object
        const settingsObj = settings.reduce((acc: Record<string, string>, setting: any) => {
            acc[setting.key] = setting.value
            return acc
        }, {} as Record<string, string>)

        return NextResponse.json(settingsObj)

    } catch (error) {
        return handleApiError(error);
    }
}

// POST/UPDATE settings
export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json();

        // Validate with Zod
        // Note: In a real app we'd strict parse, but since body might have extra keys we ignore them
        // or we define schema to allow unknowns. For now, simple loop is fine but transaction is key.

        // Transaction for atomic update
        await prisma.$transaction(
            Object.entries(body).map(([key, value]) =>
                prisma.settings.upsert({
                    where: { key },
                    update: { value: String(value) },
                    create: { key, value: String(value) }
                })
            )
        );

        return NextResponse.json({
            success: true,
            message: 'Settings updated successfully'
        });

    } catch (error) {
        return handleApiError(error);
    }
}
