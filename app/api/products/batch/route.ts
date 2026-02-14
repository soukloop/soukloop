import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-wrapper'
import { z } from 'zod'

const batchSchema = z.object({
    productIds: z.array(z.string().min(1, "Invalid Product ID")).min(1, "ProductIds array must not be empty")
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validationResult = batchSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const { productIds } = validationResult.data;

        const products = await prisma.product.findMany({
            where: {
                id: { in: productIds },
                isActive: true
            },
            include: {
                images: {
                    where: { isPrimary: true },
                    take: 1
                },
                vendor: {
                    select: {
                        id: true,
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                }
            }
        })

        return NextResponse.json(products)

    } catch (error) {
        return handleApiError(error);
    }
}
