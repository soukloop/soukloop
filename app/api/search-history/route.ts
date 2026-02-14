import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { z } from 'zod'

const createSearchHistorySchema = z.object({
    searchQuery: z.string().min(1, 'Search query is required')
})

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')

        const searchHistory = await prisma.searchHistory.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: limit
        })

        return NextResponse.json(searchHistory)

    } catch (error) {
        console.error('Search History GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const body = await request.json()
        const validationResult = createSearchHistorySchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const { searchQuery } = validationResult.data

        const searchHistory = await prisma.searchHistory.create({
            data: {
                userId: session.user.id,
                searchQuery
            }
        })

        return NextResponse.json(searchHistory, { status: 201 })

    } catch (error) {
        console.error('Search History POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
