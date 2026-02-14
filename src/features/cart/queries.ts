import { prisma } from "@/lib/prisma";

export async function getCart(userId: string) {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                status: true,
                                isActive: true,
                                images: {
                                    take: 1, // Optimize: Only needed thumbnail
                                    select: { url: true }
                                },
                                vendor: {
                                    select: {
                                        id: true,
                                        user: {
                                            select: { name: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!cart) return null;

        return cart;
    } catch (error) {
        console.error("Failed to fetch cart:", error);
        return null;
    }
}
