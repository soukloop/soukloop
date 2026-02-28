"use client";

import { useState } from "react";
import { Star, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useReviews, useReviewStatus } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ReviewsSectionProps {
    productId: string;
}

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
    const { user } = useAuth();
    const {
        reviews,
        isLoading,
        createReview,
        averageRating,
        totalReviews
    } = useReviews(productId);

    // Status Hook
    const { isSold, canReview, hasReviewed, isLoading: isLoadingStatus } = useReviewStatus(productId);

    // Form State (Horizontal)
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!comment.trim()) return;

        setIsSubmitting(true);
        try {
            await createReview({
                productId,
                rating,
                comment
            });
            setComment("");
        } catch (err: any) {
            toast.error(err.message || "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || isLoadingStatus) {
        return <div className="py-8 text-center text-gray-500">Loading reviews...</div>;
    }

    // CONDITION 1: Not Sold
    if (!isSold) {
        return (
            <section className="mt-16 border-t border-gray-100 pt-12">
                <h2 className="mb-8 text-2xl font-bold text-gray-900">Customer Reviews</h2>
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 bg-gray-50 rounded-xl">
                    <p>This product is not sold yet.</p>
                </div>
            </section>
        )
    }

    // CONDITION 2: Sold, No Reviews, AND Current user cannot review (not the buyer or not delivered)
    if (reviews.length === 0 && !canReview && !hasReviewed) {
        return (
            <section className="mt-16 border-t border-gray-100 pt-12">
                <h2 className="mb-8 text-2xl font-bold text-gray-900">Customer Reviews</h2>
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 bg-gray-50 rounded-xl">
                    <p>This product has been sold and yet to be reviewed.</p>
                </div>
            </section>
        )
    }

    // CONDITION 3 & 4: Reviews exist OR User can review
    return (
        <section className="mt-16 border-t border-gray-100 pt-12">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">
                Customer Reviews ({totalReviews})
            </h2>

            {/* Horizontal Review Form for Eligible Buyers who haven't reviewed yet */}
            {canReview && !hasReviewed && (
                <div className="mb-8 rounded-xl border border-orange-100 bg-orange-50/50 p-6">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">Write your review</h3>
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Left: Rating */}
                        <div className="flex flex-col gap-2 shrink-0">
                            <label className="text-sm font-medium text-gray-700">Rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`size-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right: Comment & Submit */}
                        <div className="flex-1 w-full gap-3 flex flex-col sm:flex-row">
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your thoughts about this product..."
                                className="flex-1 min-h-[50px] bg-white"
                            />
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !comment.trim()}
                                className="bg-[#E87A3F] hover:bg-[#d96d34] h-auto py-3 px-6 whitespace-nowrap self-stretch sm:self-auto"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Review"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <div className="text-center text-gray-400 italic py-4">Be the first to review!</div>
                ) : (
                    reviews.map((review: any) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-orange-100 text-[#E87A3F] font-bold">
                                        {review.user?.name?.charAt(0).toUpperCase() || <User className="size-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">
                                            {review.user?.name || "Anonymous"}
                                            {/* Show 'You' tag if it's the current user */}
                                            {user && review.userId === user.id && (
                                                <span className="ml-2 bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>
                                            )}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`size-3 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                                    />
                                                ))}
                                            </div>
                                            <span>•</span>
                                            <span>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-3 text-gray-600 leading-relaxed">
                                {review.comment}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
