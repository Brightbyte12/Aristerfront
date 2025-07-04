"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, AlertCircle, Clock, CheckCircle } from "lucide-react"
import { requestReplacement } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReplacementRequestFormProps {
  orderId: string
  replacementPolicy: {
    days: number
    policy: string
  }
  deliveryDate: string
  replacementDeadline: string
  daysRemaining: number
  onClose: () => void
  onSuccess: () => void
}

export default function ReplacementRequestForm({
  orderId,
  replacementPolicy,
  deliveryDate,
  replacementDeadline,
  daysRemaining,
  onClose,
  onSuccess
}: ReplacementRequestFormProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      toast({
        title: "Replacement reason required",
        description: "Please provide a reason for the replacement",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await requestReplacement(orderId, reason.trim())
      toast({
        title: "Replacement request submitted",
        description: "Your replacement request has been submitted successfully",
      })
      onSuccess()
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit replacement request",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="w-full max-w-md animate-slide-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Request Replacement</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="touch-target">
              <X className="w-4 h-4" />
              <span className="sr-only">Close replacement form</span>
            </Button>
          </div>
          <p className="text-sm text-gray-600">Order #{orderId}</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Replacement Policy Info */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Replacement Policy</div>
                <div className="text-sm">
                  <p>• {replacementPolicy.days} days replacement window</p>
                  <p>• {replacementPolicy.policy}</p>
                </div>
              </AlertDescription>
            </Alert>

            {/* Time Remaining */}
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Time Remaining</div>
                <div className="text-sm">
                  <p>• Delivery Date: {new Date(deliveryDate).toLocaleDateString()}</p>
                  <p>• Replacement Deadline: {new Date(replacementDeadline).toLocaleDateString()}</p>
                  <p>• Days Remaining: <span className="font-semibold text-orange-600">{daysRemaining} days</span></p>
                </div>
              </AlertDescription>
            </Alert>

            {/* Replacement Reason */}
            <div>
              <Label htmlFor="reason" className="text-sm font-medium">
                Replacement Reason *
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you need a replacement (e.g., manufacturing defect, wrong size, damaged item)..."
                className="mt-1 min-h-[100px] text-sm"
                required
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-darkGreen hover:bg-olive"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Replacement Request"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
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