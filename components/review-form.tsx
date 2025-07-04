"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, X, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useReviews } from "@/components/review-provider"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReviewFormProps {
  productId: string
  productName: string
  onClose: () => void
  existingReview?: any
}

export default function ReviewForm({ productId, productName, onClose, existingReview }: ReviewFormProps) {
  const { state } = useAuth()
  const { addReview, updateReview, checkCanReview, loading } = useReviews()

  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    title: existingReview?.title || "",
    comment: existingReview?.comment || "",
    size: existingReview?.size || "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canReview, setCanReview] = useState<{ canReview: boolean; reason: string; existingReview?: any } | null>(null)
  const [checkingEligibility, setCheckingEligibility] = useState(true)

  // Check if user can review this product
  useEffect(() => {
    const checkEligibility = async () => {
      if (!state.user) {
        setCanReview({ canReview: false, reason: 'not_logged_in' })
        setCheckingEligibility(false)
        return
      }

      try {
        const eligibility = await checkCanReview(productId)
        setCanReview(eligibility)
      } catch (error) {
        setCanReview({ canReview: false, reason: 'error' })
      } finally {
        setCheckingEligibility(false)
      }
    }

    checkEligibility()
  }, [state.user, productId, checkCanReview])

  const handleRatingClick = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!state.user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to write a review",
        variant: "destructive",
      })
      return
    }

    if (!canReview?.canReview && canReview?.reason !== 'already_reviewed') {
      toast({
        title: "Cannot review this product",
        description: "You can only review products you have purchased",
        variant: "destructive",
      })
      return
    }

    if (formData.rating === 0) {
      toast({
        title: "Please select a rating",
        description: "Rating is required to submit a review",
        variant: "destructive",
      })
      return
    }

    if (!formData.comment.trim()) {
      toast({
        title: "Please write a review",
        description: "Review comment is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const reviewData = {
        productId,
        userId: state.user._id,
        userName: state.user.name,
        userAvatar: state.user.avatar || '',
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
        verified: true,
        size: formData.size || undefined,
      }

      if (existingReview) {
        await updateReview(existingReview.id, reviewData)
        toast({
          title: "Review updated!",
          description: "Your review has been updated successfully",
        })
      } else {
        await addReview(reviewData)
        toast({
          title: "Review submitted!",
          description: "Thank you for your feedback",
        })
      }

      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (checkingEligibility) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
        <Card className="w-full max-w-md animate-slide-up">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-darkGreen mx-auto mb-4"></div>
            <p>Checking review eligibility...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show different content based on eligibility
  if (!canReview?.canReview && canReview?.reason === 'not_purchased') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
        <Card className="w-full max-w-md animate-slide-up">
          <CardHeader>
            <CardTitle className="text-xl text-center">Cannot Review This Product</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You can only review products you have purchased and received.
              </AlertDescription>
            </Alert>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!canReview?.canReview && canReview?.reason === 'not_logged_in') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
        <Card className="w-full max-w-md animate-slide-up">
          <CardHeader>
            <CardTitle className="text-xl text-center">Please Log In</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need to be logged in to write a review.
              </AlertDescription>
            </Alert>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl sm:text-2xl">{existingReview ? "Edit Review" : "Write a Review"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="touch-target">
              <X className="w-4 h-4" />
              <span className="sr-only">Close review form</span>
            </Button>
          </div>
          <p className="text-sm sm:text-base text-gray-600">for {productName}</p>
          {canReview?.canReview && (
            <Alert className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                ✓ Verified Purchase - You can review this product
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <Label className="text-base sm:text-lg font-medium">Overall Rating *</Label>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    className="p-1 hover:scale-110 transition-transform touch-target"
                    aria-label={`${star} star rating`}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= formData.rating ? "fill-bronze text-bronze" : "text-gray-300 hover:text-bronze"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Title */}
            <div>
              <Label htmlFor="title" className="text-sm sm:text-base">
                Review Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Summarize your experience"
                className="mt-1 h-10 sm:h-12 text-base"
              />
            </div>

            {/* Review Comment */}
            <div>
              <Label htmlFor="comment" className="text-sm sm:text-base">
                Your Review *
              </Label>
              <Textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                placeholder="Tell others about your experience with this product"
                className="mt-1 min-h-[120px] text-base"
                required
              />
            </div>

            {/* Product Details */}
            <div>
              <Label htmlFor="size" className="text-sm sm:text-base">
                Size (if applicable)
              </Label>
              <Input
                id="size"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                placeholder="e.g., M, L, Free Size"
                className="mt-1 h-10 sm:h-12 text-base"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-darkGreen hover:bg-olive px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base"
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
