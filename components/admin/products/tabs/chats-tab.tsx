import { prisma } from "@/lib/prisma";
import MessagingInterface from "@/components/messaging-interface";

interface ChatsTabProps {
    productId: string;
}

export default async function ChatsTab({ productId }: ChatsTabProps) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
            chatConversations: {
                include: {
                    buyer: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            vendor: { select: { logo: true } },
                            profile: { select: { avatar: true } }
                        }
                    },
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            vendor: { select: { logo: true } },
                            profile: { select: { avatar: true } }
                        }
                    },
                    product: {
                        include: { images: true }
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                    vendor: { select: { logo: true } },
                                    profile: { select: { avatar: true } }
                                }
                            }
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            }
        }
    });

    if (!product) return null;

    const conversations = product.chatConversations || [];
    // Use the seller of the first conversation as the "impersonated" user for the UI (right side)
    const sellerId = conversations[0]?.sellerId;

    return (
        <div className="animate-in fade-in duration-300 h-[800px]">
            <MessagingInterface
                initialConversations={conversations as any}
                readOnly={true}
                impersonatedUserId={sellerId}
            />
        </div>
    );
}
