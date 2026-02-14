import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const materials = await prisma.material.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(materials);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
    }
}
