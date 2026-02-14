import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const q = searchParams.get('q') || ''

        if (!q || q.length < 1) {
            return NextResponse.json({ suggestions: [] })
        }

        // Parallel search: Products (by name) and Styles (by dress field)
        const [productMatches, styleMatches] = await Promise.all([
            // 1. Search Product Names
            prisma.product.findMany({
                where: {
                    isActive: true,
                    name: { contains: q, mode: 'insensitive' }
                },
                select: { name: true, category: true },
                distinct: ['name'],
                take: 5
            }),
            // 2. Search Dress Styles
            prisma.product.findMany({
                where: {
                    isActive: true,
                    dress: { contains: q, mode: 'insensitive' }
                },
                select: { dress: true, category: true },
                distinct: ['dress'],
                take: 5
            })
        ])

        const suggestions = [
            // Format Product Matches
            ...productMatches.map(p => ({
                text: p.name,
                type: 'product',
                category: p.category
            })),
            // Format Style Matches
            ...styleMatches.filter(p => p.dress).map(p => ({
                text: p.dress!,
                type: 'dress', // Special type for styles
                category: p.category
            }))
        ]

        return NextResponse.json({ suggestions })

    } catch (error) {
        console.error('Suggestions GET error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
