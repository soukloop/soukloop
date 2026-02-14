import { prisma } from "@/lib/prisma";
import MessagingInterface from "@/components/messaging-interface";

export default async function ChatTab({ userId }: { userId: string }) {
    // Fetch conversations for the user including all necessary relations for MessagingInterface
    const conversations = await prisma.chatConversation.findMany({
        where: {
            OR: [
                { buyerId: userId },
                { sellerId: userId }
            ]
        },
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
                take: 1,
                orderBy: { createdAt: 'desc' },
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
        orderBy: { updatedAt: 'desc' },
        take: 20
    });

    // The messaging interface expects specific types.
    // Prisma return types should mostly match, but we need to ensure 'messages' is strictly typed if needed.
    // However, since we simply pass it to the component, TS compatibility should be reasonable
    // assuming MessagingInterface types align with Prisma's output.

    // We cast to any here to avoid strict type mismatches between server/client component boundaries
    // and exact optional field alignments, but the structure is correct.
    const initialConversations = conversations as any;

    return (
        <div className="h-[800px]">
            <MessagingInterface
                impersonatedUserId={userId}
                readOnly={true}
                initialConversations={initialConversations}
            />
        </div>
    );
}
