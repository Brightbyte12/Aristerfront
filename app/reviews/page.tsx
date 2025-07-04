"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Edit, Trash2, Eye } from "lucide-react"
import { useState, useEffect } from "react" // Import useEffect
import { useAuth } from "@/components/auth-provider"
import { useReviews, type Review } from "@/components/review-provider"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import Link from "next/link"
import ReviewForm from "@/components/review-form"
import { Skeleton } from "@/components/ui/skeleton" // Import Skeleton

export default function UserReviewsPage() {
  const { user } = useAuth()
  const { getUserReviews, deleteReview } = useReviews()

  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Add loading state

  // Simulate fetching reviews
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      // In a real app, you'd fetch reviews here
      setIsLoading(false)
    }, 1000) // Simulate API call
    return () => clearTimeout(timer)
  }, [user]) // Re-fetch if user changes

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h1>
          <p className="text-gray-600 mb-8">You need to be logged in to view your reviews.</p>
          <Link href="/login">
            <Button className="bg-emerald-700 hover:bg-emerald-800">Log In</Button>
          </Link>
        </div>
      </div>
    )
  }

  const userReviews = getUserReviews(user.id)

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setShowReviewForm(true)
  }

  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      deleteReview(reviewId)
      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully",
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

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Reviews</h1>
          <p className="text-gray-600">Manage all your product reviews</p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Card className="p-8">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
            <Card className="p-8">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          </div>
        ) : userReviews.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't written any reviews yet. Start by purchasing and reviewing products!
            </p>
            <Link href="/collections">
              <Button className="bg-emerald-700 hover:bg-emerald-800">Browse Products</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {userReviews.length} review{userReviews.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="space-y-4">
              {userReviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <CardContent className="p-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">Product #{review.productId}</h3>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span>Reviewed on {formatDate(review.date)}</span>
                          {review.size && <span>Size: {review.size}</span>}
                          {review.color && <span>Color: {review.color}</span>}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                        </div>

                        {/* Review Title */}
                        {review.title && <h4 className="font-medium text-gray-800 mb-2">{review.title}</h4>}

                        {/* Review Comment */}
                        <p className="text-gray-600 mb-3 leading-relaxed">{review.comment}</p>

                        {/* Review Images */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {review.images.map((image, index) => (
                              <Image
                                key={index}
                                src={image || "/placeholder.svg"}
                                alt={`Review image ${index + 1}`}
                                width={60}
                                height={60}
                                className="rounded-lg object-cover"
                              />
                            ))}
                          </div>
                        )}

                        {/* Review Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{review.helpful} people found this helpful</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        <Link href={`/products/${review.productId}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View Product
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => handleEditReview(review)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Review Form Modal */}
        {showReviewForm && editingReview && (
          <ReviewForm
            productId={editingReview.productId}
            productName={`Product #${editingReview.productId}`}
            existingReview={editingReview}
            onClose={() => {
              setShowReviewForm(false)
              setEditingReview(null)
            }}
          />
        )}
      </div>
    </div>
  )
}
