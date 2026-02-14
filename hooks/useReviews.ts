import useSWR from 'swr'
import { listReviews, createReview } from '../services/reviews.service'
import type { Review, CreateReviewDto } from '../types/api'
import { useState } from 'react'

// ===== REVIEWS HOOK =====
export function useReviews(productId: string) {
  const { data: reviews, error, isLoading, mutate } = useSWR(
    productId ? `/api/reviews?productId=${productId}` : null,
    async () => {
      const { data, error } = await listReviews(productId)
      if (error) {
        throw new Error(error.message)
      }
      return data
    }
  )

  // Create review function
  const createReviewAction = async (dto: CreateReviewDto) => {
    const { data, error } = await createReview(dto)
    if (error) {
      throw new Error(error.message)
    }
    // Refresh reviews
    await mutate()
    return data
  }

  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  // Calculate rating distribution
  const ratingDistribution = reviews
    ? reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    : {}

  // Get reviews by rating
  const getReviewsByRating = (rating: number) => {
    return reviews?.filter(review => review.rating === rating) || []
  }

  // Get recent reviews
  const getRecentReviews = (limit: number = 5) => {
    if (!reviews) return []
    return reviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  // Get verified reviews
  const getVerifiedReviews = () => {
    return reviews?.filter(review => review.isVerified) || []
  }

  return {
    // Reviews data
    reviews: reviews || [],
    isLoading,
    isError: !!error,
    error,

    // Create review
    createReview: createReviewAction,

    // Analytics
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalReviews: reviews?.length || 0,
    ratingDistribution,
    verifiedReviews: getVerifiedReviews(),
    recentReviews: getRecentReviews(),

    // Helper functions
    getReviewsByRating,
    getRecentReviews,
    getVerifiedReviews
  }
}

// ===== REVIEW ANALYTICS HOOK =====
export function useReviewAnalytics(productId: string) {
  const { reviews, averageRating, totalReviews, ratingDistribution } = useReviews(productId)

  const getRatingPercentage = (rating: number) => {
    if (totalReviews === 0) return 0
    return Math.round((ratingDistribution[rating] || 0) / totalReviews * 100)
  }

  const getRatingBreakdown = () => {
    return [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: ratingDistribution[rating] || 0,
      percentage: getRatingPercentage(rating)
    }))
  }

  const getRatingSummary = () => {
    const breakdown = getRatingBreakdown()
    const positiveReviews = breakdown.filter(r => r.rating >= 4).reduce((sum, r) => sum + r.count, 0)
    const negativeReviews = breakdown.filter(r => r.rating <= 2).reduce((sum, r) => sum + r.count, 0)

    return {
      average: averageRating,
      total: totalReviews,
      positive: positiveReviews,
      negative: negativeReviews,
      positivePercentage: totalReviews > 0 ? Math.round(positiveReviews / totalReviews * 100) : 0,
      negativePercentage: totalReviews > 0 ? Math.round(negativeReviews / totalReviews * 100) : 0
    }
  }

  return {
    getRatingPercentage,
    getRatingBreakdown,
    getRatingSummary
  }
}

// ===== REVIEW FORM HOOK =====
export function useReviewForm(productId: string) {
  const { createReview } = useReviews(productId)
  const [formData, setFormData] = useState<CreateReviewDto>({
    productId,
    rating: 5,
    comment: ''
  })
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<Error | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setCreateError(null)
    try {
      await createReview(formData)
      // Reset form
      setFormData({
        productId,
        rating: 5,
        comment: ''
      })
      // Show success message
      alert('Review submitted successfully!')
    } catch (err) {
      setCreateError(err as Error)
      console.error('Create review failed:', err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }))
  }

  const handleCommentChange = (comment: string) => {
    setFormData(prev => ({ ...prev, comment }))
  }

  return {
    formData,
    handleSubmit,
    handleRatingChange,
    handleCommentChange,
    isCreating,
    createError
  }
}

// ===== REVIEW STATUS HOOK =====
export function useReviewStatus(productId: string) {
  const { data, error, isLoading } = useSWR(
    productId ? `/api/reviews/status?productId=${productId}` : null
  )

  return {
    isSold: data?.isSold || false,
    canReview: data?.canReview || false,
    hasReviewed: data?.hasReviewed || false,
    isLoading,
    isError: !!error
  }
}
