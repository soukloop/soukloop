
import { prisma } from "@/lib/prisma";
import Image from "next/image"; // Removed usage but kept import? No, I should remove it.

interface ReviewsTabProps {
    productId: string;
}

export default async function ReviewsTab({ productId }: ReviewsTabProps) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
            reviews: {
                include: {
                    user: { include: { profile: true } }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!product) return null;

    return (
        <div className="space-y-4 animate-in fade-in duration-300 max-w-4xl">
            {product.reviews?.length > 0 ? (
                product.reviews.map((review: any) => (
                    <div key={review.id} className="flex gap-4 p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex-shrink-0 relative overflow-hidden">
                            {review.user?.profile?.avatar || review.user?.image ? (
                                <img src={review.user.profile?.avatar || review.user.image} alt={review.user.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center font-bold text-blue-600">
                                    {review.user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-gray-900 text-lg">{review.user?.name || 'Anonymous'}</span>
                                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div className="flex text-yellow-500 mb-2 text-sm">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < review.rating ? "fill-current" : "text-gray-200"}>★</span>
                                ))}
                            </div>

                            <p className="text-gray-600 leading-relaxed">
                                {review.comment || <span className="italic text-gray-400">No written review.</span>}
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                    <p>No reviews yet.</p>
                </div>
            )}
        </div>
    );
}
