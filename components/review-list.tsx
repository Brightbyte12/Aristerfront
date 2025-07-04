"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ThumbsUp, MoreVertical, Edit, Trash2, Flag } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useReviews, type Review } from "@/components/review-provider"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import ReviewForm from "./review-form"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ReviewListProps {
  productId: string
  productName: string
}

export default function ReviewList({ productId, productName }: ReviewListProps) {
  const { state } = useAuth()
  const { 
    getProductReviews, 
    markHelpful, 
    deleteReview, 
    getAverageRating, 
    getReviewStats,
    loadProductReviews,
    loading,
    error
  } = useReviews()

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest" | "helpful">("newest")

  const reviews = getProductReviews(productId)
  const averageRating = getAverageRating(productId)
  const reviewStats = getReviewStats(productId)
  const totalReviews = reviews.length

  // Load reviews on mount
  useEffect(() => {
    loadProductReviews(productId)
  }, [productId, loadProductReviews])

  // Check if current user has already reviewed this product
  const userReview = state.user?._id ? reviews.find((review) => review.userId === state.user!._id) : null

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case "highest":
        return b.rating - a.rating
      case "lowest":
        return a.rating - b.rating
      case "helpful":
        return b.helpful - a.helpful
      default: // newest
        return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
  })

  const handleWriteReview = () => {
    if (!state.user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to write a review",
        variant: "destructive",
      })
      return
    }
    setShowReviewForm(true)
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setShowReviewForm(true)
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReview(reviewId)
        toast({
          title: "Review deleted",
          description: "Your review has been deleted successfully",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to delete review",
          variant: "destructive",
        })
      }
    }
  }

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await markHelpful(reviewId)
      toast({
        title: "Thank you!",
        description: "Your feedback helps other customers",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to mark review helpful",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-darkGreen mx-auto mb-4"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    )
  }

  if (error && reviews.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Failed to load reviews</p>
          <Button onClick={() => loadProductReviews(productId)} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Review Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl sm:text-3xl font-bold">{averageRating.toFixed(1)}</div>
            <div>
              <div className="flex items-center mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating) ? "fill-bronze text-bronze" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">{totalReviews} reviews</p>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-6">{rating}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-bronze h-1.5 rounded-full"
                    style={{
                      width: totalReviews > 0 ? `${(reviewStats[rating] / totalReviews) * 100}%` : "0%",
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-6">{reviewStats[rating]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center animate-slide-up animation-delay-200">
          {userReview ? (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">You've already reviewed this product</p>
              <Button
                variant="outline"
                onClick={() => handleEditReview(userReview)}
                className="w-full px-3 py-2 text-sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Your Review
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleWriteReview}
              className="w-full bg-darkGreen hover:bg-olive px-3 py-2 text-sm"
            >
              Write a Review
            </Button>
          )}
        </div>
      </div>

      {/* Sort Options */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 animate-fade-in animation-delay-300">
          <h3 className="text-base sm:text-lg font-semibold">Customer Reviews</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {sortedReviews.length === 0 ? (
          <Card className="p-6 text-center animate-fade-in animation-delay-400">
            <p className="text-gray-600 mb-3">No reviews yet. Be the first to review this product!</p>
            <Button
              onClick={handleWriteReview}
              className="bg-darkGreen hover:bg-olive px-4 py-2 text-sm"
            >
              Write the First Review
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedReviews.map((review, index) => (
              <Card key={review.id} className="p-4 animate-slide-up" style={{ animationDelay: `${index * 100 + 400}ms` }}>
                <CardContent className="p-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-beige rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-darkGreen font-medium text-sm">{review.userName.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{review.userName}</span>
                          {review.verified && (
                            <Badge className="bg-green-100 text-green-800 text-xs px-1 py-0">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating ? "fill-bronze text-bronze" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span>•</span>
                          <span>{formatDate(review.date)}</span>
                          {review.size && (
                            <>
                              <span>•</span>
                              <span className="text-xs">
                                Size: {review.size}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Review Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="touch-target h-6 w-6">
                          <MoreVertical className="w-3 h-3" />
                          <span className="sr-only">Review options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {state.user?._id && review.userId === state.user._id ? (
                          <>
                            <DropdownMenuItem onClick={() => handleEditReview(review)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Review
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteReview(review.id)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Review
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem>
                            <Flag className="w-4 h-4 mr-2" />
                            Report Review
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Review Content */}
                  <div className="mb-3">
                    {review.title && (
                      <h4 className="font-medium text-sm mb-1">{review.title}</h4>
                    )}
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{review.comment}</p>
                  </div>

                  {/* Review Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkHelpful(review.id)}
                      className="text-gray-600 hover:text-darkGreen h-6 px-2 text-xs"
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Helpful ({review.helpful})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          productId={productId}
          productName={productName}
          onClose={() => {
            setShowReviewForm(false)
            setEditingReview(null)
          }}
          existingReview={editingReview}
        />
      )}
    </div>
  )
}
