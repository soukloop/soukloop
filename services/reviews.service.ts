import { apiGet, apiPost, type ApiResponse } from '../lib/api'
import type { Review, CreateReviewDto } from '../types/api'

// Reviews service functions
export async function createReview(data: CreateReviewDto): Promise<ApiResponse<Review>> {
  return apiPost<Review>('/api/reviews', data)
}

export async function listReviews(productId: string): Promise<ApiResponse<Review[]>> {
  return apiGet<Review[]>('/api/reviews', { productId })
}

// Example usage:
/*
// Create a new review
const { data: review, error: createError } = await createReview({
  productId: 'prod123',
  rating: 5,
  comment: 'Great product! Highly recommend it.'
})

if (createError) {
  console.error('Failed to create review:', createError.message)
} else {
  console.log('Review created:', review?.id)
  console.log('Rating:', review?.rating)
  console.log('Comment:', review?.comment)
}

// List reviews for a product
const { data: reviews, error: listError } = await listReviews('prod123')

if (listError) {
  console.error('Failed to fetch reviews:', listError.message)
} else {
  console.log(`Found ${reviews?.length} reviews`)
  reviews?.forEach(review => {
    console.log(`- ${review.user.name}: ${review.rating}/5 stars`)
    console.log(`  "${review.comment}"`)
    console.log(`  Verified: ${review.isVerified ? 'Yes' : 'No'}`)
    console.log(`  Helpful: ${review.helpful} votes`)
  })
}

// Review analytics for a product
export async function getProductReviewAnalytics(productId: string) {
  const { data: reviews, error } = await listReviews(productId)
  
  if (error) {
    console.error('Failed to fetch reviews for analytics:', error.message)
    return null
  }
  
  if (!reviews || reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: {},
      verifiedReviews: 0
    }
  }
  
  // Calculate analytics
  const totalReviews = reviews.length
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
  const verifiedReviews = reviews.filter(review => review.isVerified).length
  
  const ratingDistribution = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1
    return acc
  }, {} as Record<number, number>)
  
  const analytics = {
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    ratingDistribution,
    verifiedReviews,
    verifiedPercentage: Math.round((verifiedReviews / totalReviews) * 100)
  }
  
  console.log('Review Analytics:', analytics)
  return analytics
}

// Create review with validation
export async function createReviewWithValidation(data: {
  productId: string
  rating: number
  comment: string
}) {
  // Validate rating
  if (data.rating < 1 || data.rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }
  
  // Validate comment length
  if (data.comment.length < 10) {
    throw new Error('Comment must be at least 10 characters long')
  }
  
  if (data.comment.length > 1000) {
    throw new Error('Comment must be less than 1000 characters')
  }
  
  const { data: review, error } = await createReview(data)
  
  if (error) {
    throw new Error(`Failed to create review: ${error.message}`)
  }
  
  return review
}

// Get recent reviews across all products
export async function getRecentReviews(limit: number = 10) {
  // Note: This would typically be a separate endpoint like GET /api/reviews/recent
  // For now, we'll simulate by getting reviews for a specific product
  // In a real implementation, you'd have a dedicated endpoint for this
  
  const { data: reviews, error } = await listReviews('') // Empty productId for recent reviews
  
  if (error) {
    console.error('Failed to fetch recent reviews:', error.message)
    return []
  }
  
  // Sort by creation date and limit
  const recentReviews = reviews
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit) || []
  
  console.log(`Found ${recentReviews.length} recent reviews`)
  return recentReviews
}

// Review moderation helpers
export async function moderateReview(reviewId: string, action: 'approve' | 'reject' | 'flag') {
  // This would typically be an admin endpoint
  // For now, we'll just log the action
  console.log(`Review ${reviewId} ${action}ed`)
  
  // In a real implementation:
  // return apiPatch(`/api/admin/reviews/${reviewId}`, { action })
}

// Helpful vote system
export async function markReviewHelpful(reviewId: string, helpful: boolean) {
  // This would typically be a separate endpoint
  // For now, we'll just log the action
  console.log(`Review ${reviewId} marked as ${helpful ? 'helpful' : 'not helpful'}`)
  
  // In a real implementation:
  // return apiPost(`/api/reviews/${reviewId}/helpful`, { helpful })
}
*/
