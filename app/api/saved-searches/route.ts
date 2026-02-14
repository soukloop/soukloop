import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { handleApiError } from '@/lib/api-wrapper'
import { z } from 'zod'

const savedSearchSchema = z.object({
    query: z.string().optional(),
    filters: z.any().optional()
}).refine(data => data.query || data.filters, {
    message: "One of query or filters is required"
})

// GET: List saved searches
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const userId = session.user.id

        const savedSearches = await prisma.savedSearch.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(savedSearches)

    } catch (error) {
        return handleApiError(error)
    }
}

// POST: Create saved search
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const userId = session.user.id
        const body = await request.json()
        const validationResult = savedSearchSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const { query, filters } = validationResult.data

        const savedSearch = await prisma.savedSearch.create({
            data: {
                userId,
                query: query || null,
                filters: filters || null
            }
        })

        return NextResponse.json(savedSearch)

    } catch (error) {
        return handleApiError(error)
    }
}
