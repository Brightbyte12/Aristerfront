"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { 
  getProductReviews as fetchProductReviews, 
  createReview as createReviewAPI, 
  updateReview as updateReviewAPI, 
  deleteReview as deleteReviewAPI, 
  markReviewHelpful as markReviewHelpfulAPI,
  checkCanReview as checkCanReviewAPI
} from "@/lib/api"

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  title?: string
  comment: string
  date: string
  verified: boolean
  helpful: number
  size?: string
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingStats: { [key: number]: number }
}

interface ReviewContextType {
  reviews: Review[]
  reviewStats: { [productId: string]: ReviewStats }
  addReview: (reviewData: Omit<Review, "id" | "date" | "helpful">) => Promise<void>
  updateReview: (reviewId: string, reviewData: Partial<Omit<Review, "id" | "date" | "helpful">>) => Promise<void>
  deleteReview: (reviewId: string) => Promise<void>
  getProductReviews: (productId: string) => Review[]
  getUserReviews: (userId: string) => Review[]
  markHelpful: (reviewId: string) => Promise<void>
  getAverageRating: (productId: string) => number
  getReviewStats: (productId: string) => { [key: number]: number }
  checkCanReview: (productId: string) => Promise<{ canReview: boolean; reason: string; existingReview?: any }>
  loadProductReviews: (productId: string) => Promise<void>
  refreshProductReviews: (productId: string) => Promise<void>
  loading: boolean
  error: string | null
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined)

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewStats, setReviewStats] = useState<{ [productId: string]: ReviewStats }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addReview = useCallback(async (reviewData: Omit<Review, "id" | "date" | "helpful">) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await createReviewAPI({
        productId: reviewData.productId,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        size: reviewData.size
      })

      const newReview: Review = {
        ...reviewData,
        id: response.review.id,
        date: response.review.date,
        helpful: response.review.helpful
      }

      setReviews((prev) => [...prev, newReview])
      
      // Update stats
      const currentStats = reviewStats[reviewData.productId] || { averageRating: 0, totalReviews: 0, ratingStats: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
      const newTotal = currentStats.totalReviews + 1
      const newRatingStats = { ...currentStats.ratingStats }
      newRatingStats[reviewData.rating]++
      const newAverage = (currentStats.averageRating * currentStats.totalReviews + reviewData.rating) / newTotal
      
      setReviewStats(prev => ({
        ...prev,
        [reviewData.productId]: {
          averageRating: newAverage,
          totalReviews: newTotal,
          ratingStats: newRatingStats
        }
      }))

      // Refresh product reviews to ensure all components update
      const refreshReviews = async () => {
        try {
          const response = await fetchProductReviews(reviewData.productId)
          setReviews(prev => {
            const existingReviews = prev.filter(r => r.productId !== reviewData.productId)
            return [...existingReviews, ...response.reviews]
          })
          setReviewStats(prev => ({
            ...prev,
            [reviewData.productId]: response.stats
          }))
        } catch (err) {
          console.error('Failed to refresh reviews:', err)
        }
      }
      await refreshReviews()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add review')
      throw err
    } finally {
      setLoading(false)
    }
  }, [reviewStats])

  const updateReview = useCallback(async (reviewId: string, reviewData: Partial<Omit<Review, "id" | "date" | "helpful">>) => {
    try {
      setLoading(true)
      setError(null)
      
      // Find the existing review to get old rating for stats calculation
      const existingReview = reviews.find(r => r.id === reviewId)
      if (!existingReview) {
        throw new Error('Review not found')
      }
      
      const response = await updateReviewAPI(reviewId, {
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        size: reviewData.size
      })

      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, ...response.review, date: response.review.updatedAt } : review,
        ),
      )

      // Update review stats after review update
      if (existingReview && reviewData.rating !== undefined) {
        const currentStats = reviewStats[existingReview.productId] || { 
          averageRating: 0, 
          totalReviews: 0, 
          ratingStats: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
        }
        
        // Remove old rating from stats
        const oldRatingStats = { ...currentStats.ratingStats }
        oldRatingStats[existingReview.rating]--
        
        // Add new rating to stats
        const newRatingStats = { ...oldRatingStats }
        newRatingStats[reviewData.rating]++
        
        // Recalculate average rating
        const totalRatingSum = Object.entries(newRatingStats).reduce((sum, [rating, count]) => {
          return sum + (parseInt(rating) * count)
        }, 0)
        
        const newAverage = currentStats.totalReviews > 0 ? totalRatingSum / currentStats.totalReviews : 0
        
        setReviewStats(prev => ({
          ...prev,
          [existingReview.productId]: {
            averageRating: newAverage,
            totalReviews: currentStats.totalReviews,
            ratingStats: newRatingStats
          }
        }))
      }

      // Refresh product reviews to ensure all components update
      const refreshReviews = async () => {
        try {
          const response = await fetchProductReviews(existingReview.productId)
          setReviews(prev => {
            const existingReviews = prev.filter(r => r.productId !== existingReview.productId)
            return [...existingReviews, ...response.reviews]
          })
          setReviewStats(prev => ({
            ...prev,
            [existingReview.productId]: response.stats
          }))
        } catch (err) {
          console.error('Failed to refresh reviews:', err)
        }
      }
      await refreshReviews()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update review')
      throw err
    } finally {
      setLoading(false)
    }
  }, [reviews, reviewStats])

  const deleteReview = useCallback(async (reviewId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await deleteReviewAPI(reviewId)
      
      const deletedReview = reviews.find(r => r.id === reviewId)
      setReviews((prev) => prev.filter((review) => review.id !== reviewId))
      
      // Update stats if we have the deleted review
      if (deletedReview) {
        const currentStats = reviewStats[deletedReview.productId]
        if (currentStats) {
          const newTotal = currentStats.totalReviews - 1
          const newRatingStats = { ...currentStats.ratingStats }
          newRatingStats[deletedReview.rating]--
          const newAverage = newTotal > 0 ? (currentStats.averageRating * currentStats.totalReviews - deletedReview.rating) / newTotal : 0
          
          setReviewStats(prev => ({
            ...prev,
            [deletedReview.productId]: {
              averageRating: newAverage,
              totalReviews: newTotal,
              ratingStats: newRatingStats
            }
          }))
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete review')
      throw err
    } finally {
      setLoading(false)
    }
  }, [reviews, reviewStats])

  const getProductReviews = useCallback(
    (productId: string) => {
      return reviews.filter((review) => review.productId === productId)
    },
    [reviews],
  )

  const getUserReviews = useCallback(
    (userId: string) => {
      return reviews.filter((review) => review.userId === userId)
    },
    [reviews],
  )

  const markHelpful = useCallback(async (reviewId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await markReviewHelpfulAPI(reviewId)
      
      setReviews((prev) =>
        prev.map((review) => (review.id === reviewId ? { ...review, helpful: response.helpful } : review)),
      )
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark review helpful')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getAverageRating = useCallback(
    (productId: string) => {
      const stats = reviewStats[productId]
      return stats ? stats.averageRating : 0
    },
    [reviewStats],
  )

  const getReviewStats = useCallback(
    (productId: string) => {
      const stats = reviewStats[productId]
      return stats ? stats.ratingStats : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    },
    [reviewStats],
  )

  const checkCanReview = useCallback(async (productId: string) => {
    try {
      const response = await checkCanReviewAPI(productId)
      return response
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to check review eligibility')
      throw err
    }
  }, [])

  // Load reviews for a product
  const loadProductReviews = useCallback(async (productId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetchProductReviews(productId)
      
      setReviews(prev => {
        const existingReviews = prev.filter(r => r.productId !== productId)
        return [...existingReviews, ...response.reviews]
      })
      
      setReviewStats(prev => ({
        ...prev,
        [productId]: response.stats
      }))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshProductReviews = useCallback(async (productId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await loadProductReviews(productId)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to refresh reviews')
    } finally {
      setLoading(false)
    }
  }, [loadProductReviews])

  const value = {
    reviews,
    reviewStats,
    addReview,
    updateReview,
    deleteReview,
    getProductReviews,
    getUserReviews,
    markHelpful,
    getAverageRating,
    getReviewStats,
    checkCanReview,
    loadProductReviews,
    refreshProductReviews,
    loading,
    error
  }

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
}

export function useReviews() {
  const context = useContext(ReviewContext)
  if (context === undefined) {
    throw new Error("useReviews must be used within a ReviewProvider")
  }
  return context
}
