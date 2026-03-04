"use client";

import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { useReviews, useReviewAnalytics } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea"; // Assuming we have this
import { toast } from "sonner";
import ProductSellerInfo from "./ProductSellerInfo";
import { PremiumBadge } from "@/components/ui/premium-badge";

interface ProductReviewsProps {
    productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
    const { user } = useAuth();
    const {
        reviews,
        isLoading,
        averageRating,
        totalReviews,
        createReview
    } = useReviews(productId);

    const { getRatingBreakdown } = useReviewAnalytics(productId);

    // Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("You must be logged in to review.");
            return;
        }
        setIsSubmitting(true);
        try {
            await createReview({ productId, rating, comment });
            setComment("");
            setRating(5);
            toast.success("Review submitted successfully!");
        } catch (error) {
            toast.error("Failed to submit review.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="py-8 text-center text-gray-500">Loading reviews...</div>;

    const breakdown = getRatingBreakdown();

    return (
        <div className="mt-16 space-y-10 border-t border-gray-100 pt-16">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">
                Customer Reviews
            </h2>

            <div className="grid gap-12 lg:grid-cols-12">
                {/* Left: Summary & Breakdown */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-[#E87A3F]/10 p-6 text-center">
                            <span className="text-5xl font-black text-[#E87A3F]">{averageRating}</span>
                            <div className="mt-2 flex text-[#E87A3F]">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`size-4 ${star <= Math.round(averageRating) ? "fill-current" : "text-gray-300"}`}
                                    />
                                ))}
                            </div>
                            <p className="mt-2 text-sm font-bold text-gray-600">{totalReviews} Reviews</p>
                        </div>

                        <div className="flex-1 space-y-2">
                            {breakdown.map((item) => (
                                <div key={item.rating} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                    <span className="w-3">{item.rating}</span>
                                    <Star className="size-3 text-gray-400" />
                                    <Progress value={item.percentage} className="h-2 flex-1" indicatorClassName="bg-[#E87A3F]" />
                                    <span className="w-8 text-right">{item.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Review Form */}
                    {user ? (
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
                            <h3 className="mb-4 font-bold text-gray-900">Write a Review</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Rating</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className={`transition-colors ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                                            >
                                                <Star className={`size-6 ${star <= rating ? "fill-current" : ""}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Review</label>
                                    <textarea
                                        className="w-full min-h-[100px] rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none focus:border-[#E87A3F] focus:ring-1 focus:ring-[#E87A3F]"
                                        placeholder="Tell us what you think..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={isSubmitting} className="w-full bg-gray-900 hover:bg-black text-white font-bold rounded-lg">
                                    {isSubmitting ? "Submitting..." : "Submit Review"}
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                            <p className="font-bold text-gray-600">Login to write a review</p>
                        </div>
                    )}
                </div>

                {/* Right: Review List */}
                <div className="lg:col-span-8 space-y-6">
                    {reviews.length === 0 ? (
                        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-200 text-gray-500">
                            No reviews yet. Be the first to review!
                        </div>
                    ) : (
                        reviews.map((review: any) => (
                            <div key={review.id} className="group relative rounded-2xl border border-gray-100 bg-white p-6 transition-shadow hover:shadow-md">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-500">
                                            {review.user?.name?.charAt(0) || "U"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 flex items-center gap-1.5">
                                                {review.user?.name || "Anonymous"}
                                                {review.user?.vendor?.planTier && (review.user.vendor.planTier === 'PRO' || review.user.vendor.planTier === 'STARTER') && (
                                                    <PremiumBadge tier={review.user.vendor.planTier} iconClassName="size-3.5" />
                                                )}
                                            </p>
                                            <div className="flex text-yellow-400 text-xs">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`size-3 ${star <= review.rating ? "fill-current" : "text-gray-200"}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-400">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="mt-4 text-gray-600 text-sm leading-relaxed">
                                    {review.comment}
                                </p>
                                {review.isVerified && (
                                    <div className="mt-3 flex items-center gap-1 text-xs font-bold text-green-600">
                                        <CheckCircle2 className="size-3.5" />
                                        Verified Purchase
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
