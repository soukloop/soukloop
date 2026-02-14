import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Resolve ID if it's a slug
        const product = await prisma.product.findFirst({
            where: {
                OR: [
                    { id },
                    { slug: id }
                ]
            },
            select: { id: true }
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const resolvedId = product.id;

        await prisma.product.update({
            where: { id: resolvedId },
            data: {
                viewCount: {
                    increment: 1
                }
            } as any
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error incrementing view count:", error);
        return NextResponse.json(
            { error: "Failed to increment view count" },
            { status: 500 }
        );
    }
}
