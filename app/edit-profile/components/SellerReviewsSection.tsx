'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Star, CheckCircle2, Package, Loader2 } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface Review {
    id: string
    rating: number
    comment: string | null
    createdAt: string
    isVerified: boolean
    user: {
        name: string | null
        image: string | null
    }
    product: {
        id: string
        name: string
        slug: string
        images: { url: string }[]
    }
}

interface VendorStats {
    averageRating: number
    reviewCount: number
}

export default function SellerReviewsSection() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [stats, setStats] = useState<VendorStats>({ averageRating: 0, reviewCount: 0 })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch('/api/vendor/reviews')
                if (!res.ok) throw new Error('Failed to fetch reviews')
                const data = await res.json()
                setReviews(data.reviews)
                setStats(data.stats)
            } catch (error) {
                console.error(error)
                toast.error('Failed to load reviews')
            } finally {
                setIsLoading(false)
            }
        }

        fetchReviews()
    }, [])

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Stats Skeleton */}
                <div className="flex flex-col md:flex-row gap-6 items-start animate-pulse">
                    <div className="w-full md:w-1/3 h-40 bg-gray-100 rounded-2xl" />
                    <div className="w-full md:w-2/3 h-40 bg-gray-100 rounded-2xl" />
                </div>
                {/* List Skeleton */}
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <Star className="size-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No Reviews Yet</h3>
                <p className="text-gray-500 max-w-sm">
                    Reviews from customers will appear here once you start making sales and receiving feedback.
                </p>
            </div>
        )
    }

    // Calculate Breakdown locally for now or rely on stats? 
    // Let's calculate from the fetched reviews for accuracy on this page
    const getBreakdown = () => {
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>;
        reviews.forEach(r => {
            const rating = Math.round(r.rating);
            if (counts[rating] !== undefined) counts[rating]++;
        });
        const total = reviews.length;
        return Object.entries(counts)
            .sort((a, b) => Number(b[0]) - Number(a[0]))
            .map(([rating, count]) => ({
                rating: Number(rating),
                count,
                percentage: total === 0 ? 0 : Math.round((count / total) * 100)
            }));
    };

    const breakdown = getBreakdown();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div>
                <h2 className="text-2xl font-black text-gray-900">Seller Reviews</h2>
                <p className="text-sm text-gray-500 mt-1">See what your customers are saying about your products.</p>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Summary & Breakdown */}
            <div className="grid gap-8 lg:grid-cols-12 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="lg:col-span-4 flex flex-col justify-center items-center text-center border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6">
                    <div className="text-6xl font-black text-[#E87A3F]">
                        {stats.averageRating?.toFixed(1) || "0.0"}
                    </div>
                    <div className="flex gap-1 my-3 text-[#E87A3F]">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`size-5 ${star <= Math.round(stats.averageRating || 0) ? "fill-current" : "text-gray-200"}`}
                            />
                        ))}
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Based on {stats.reviewCount} Reviews
                    </p>
                </div>

                <div className="lg:col-span-8 flex flex-col justify-center space-y-3">
                    {breakdown.map((item) => (
                        <div key={item.rating} className="flex items-center gap-3 text-sm">
                            <div className="flex items-center w-12 font-bold text-gray-700">
                                <span>{item.rating}</span>
                                <Star className="size-3 ml-1 text-gray-400" />
                            </div>
                            <Progress value={item.percentage} className="h-2.5 flex-1 [&>div]:bg-[#E87A3F]" />
                            <div className="w-12 text-right text-gray-500 text-xs font-medium">
                                {item.percentage}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className="grid gap-4">
                {reviews.map((review) => (
                    <div key={review.id} className="group relative rounded-xl border border-gray-100 bg-white p-5 md:p-6 transition-all hover:shadow-md hover:border-[#E87A3F]/30">
                        {/* Header: User & Date */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {review.user?.image ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={review.user.image}
                                                alt={review.user.name || "User"}
                                                fill
                                                sizes="40px"
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <span className="font-bold text-gray-500 text-sm">
                                            {review.user?.name?.charAt(0) || "A"}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{review.user?.name || "Anonymous Customer"}</p>
                                    <div className="flex text-yellow-400 text-xs mt-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`size-3 ${star <= review.rating ? "fill-current" : "text-gray-200"}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-gray-400 shrink-0">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        {/* Comment */}
                        {review.comment && (
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                {review.comment}
                            </p>
                        )}

                        {/* Footer: Product Link & Badge */}
                        <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-2">
                            <div className="flex items-center gap-2 group/product cursor-pointer" onClick={() => window.open(`/product/${review.product.slug}`, '_blank')}>
                                <div className="size-8 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                    {review.product.images?.[0]?.url && (
                                        <Image
                                            src={review.product.images[0].url}
                                            alt={review.product.name}
                                            fill
                                            sizes="32px"
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Review for</span>
                                    <span className="text-xs font-bold text-gray-700 group-hover/product:text-[#E87A3F] transition-colors line-clamp-1 max-w-[150px] md:max-w-xs">
                                        {review.product.name}
                                    </span>
                                </div>
                            </div>

                            {review.isVerified && (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                    <CheckCircle2 className="size-3.5" />
                                    <span>Verified</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
