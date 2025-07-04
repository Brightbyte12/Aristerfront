"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  RotateCcw,
  Calendar,
  Info,
  RefreshCw
} from "lucide-react"
import { checkReplacementEligibility, cancelReplacementRequest } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import ReplacementRequestForm from "./replacement-request-form"

interface ReplacementEligibilityProps {
  orderId: string
  orderStatus: string
  replacementRequested?: boolean
  replacementStatus?: string
  onReplacementRequested?: () => void
}

export default function ReplacementEligibility({
  orderId,
  orderStatus,
  replacementRequested = false,
  replacementStatus = 'pending',
  onReplacementRequested
}: ReplacementEligibilityProps) {
  const [eligibility, setEligibility] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showReplacementForm, setShowReplacementForm] = useState(false)

  const checkEligibility = async () => {
    setLoading(true)
    try {
      const result = await checkReplacementEligibility(orderId)
      setEligibility(result)
    } catch (error: any) {
      console.error('Error checking replacement eligibility:', error)
      toast({
        title: "Error",
        description: "Failed to check replacement eligibility",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderStatus === 'delivered' || orderStatus === 'confirmed') {
      checkEligibility()
    }
  }, [orderId, orderStatus])

  const handleCancelReplacement = async () => {
    if (window.confirm("Are you sure you want to cancel this replacement request?")) {
      try {
        await cancelReplacementRequest(orderId)
        toast({
          title: "Replacement request cancelled",
          description: "Your replacement request has been cancelled successfully",
        })
        checkEligibility() // Refresh eligibility
        if (onReplacementRequested) onReplacementRequested()
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to cancel replacement request",
          variant: "destructive",
        })
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending Review" },
      approved: { color: "bg-green-100 text-green-800", text: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
      completed: { color: "bg-blue-100 text-blue-800", text: "Completed" }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.color}>{config.text}</Badge>
  }

  // Don't show anything if order is not delivered
  if (orderStatus !== 'delivered' && orderStatus !== 'confirmed') {
    return null
  }

  if (loading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-darkGreen"></div>
            <span className="text-sm">Checking replacement eligibility...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!eligibility) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkEligibility}
            className="text-sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Check Replacement Eligibility
          </Button>
        </CardContent>
      </Card>
    )
  }

  // If replacement is already requested
  if (replacementRequested) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Replacement Request</span>
            </div>
            {getStatusBadge(replacementStatus)}
          </div>
          
          {replacementStatus === 'pending' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Your replacement request is being reviewed. We'll notify you once it's processed.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancelReplacement}
                className="text-sm"
              >
                Cancel Replacement Request
              </Button>
            </div>
          )}
          
          {replacementStatus === 'approved' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your replacement has been approved! Please follow the replacement instructions provided.
              </AlertDescription>
            </Alert>
          )}
          
          {replacementStatus === 'rejected' && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Your replacement request was rejected. Please contact customer support for more information.
              </AlertDescription>
            </Alert>
          )}
          
          {replacementStatus === 'completed' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your replacement has been completed successfully.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  // If not eligible
  if (!eligibility.eligible) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium">Replacement Not Available</span>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {eligibility.message}
              {eligibility.reason === 'replacement_period_expired' && (
                <div className="mt-2 text-sm">
                  <p>• Delivery Date: {new Date(eligibility.deliveryDate).toLocaleDateString()}</p>
                  <p>• Replacement Deadline: {new Date(eligibility.replacementDeadline).toLocaleDateString()}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // If eligible
  return (
    <>
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium">Replacement Available</span>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {eligibility.daysRemaining} days left
            </Badge>
          </div>
          
          <div className="space-y-3">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Replacement Policy</div>
                <div className="text-sm">
                  <p>• {eligibility.replacementPolicy.days} days replacement window</p>
                  <p>• {eligibility.replacementPolicy.policy}</p>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Delivery: {new Date(eligibility.deliveryDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Deadline: {new Date(eligibility.replacementDeadline).toLocaleDateString()}</span>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowReplacementForm(true)}
              className="w-full bg-darkGreen hover:bg-olive"
            >
              Request Replacement
            </Button>
          </div>
        </CardContent>
      </Card>

      {showReplacementForm && (
        <ReplacementRequestForm
          orderId={orderId}
          replacementPolicy={eligibility.replacementPolicy}
          deliveryDate={eligibility.deliveryDate}
          replacementDeadline={eligibility.replacementDeadline}
          daysRemaining={eligibility.daysRemaining}
          onClose={() => setShowReplacementForm(false)}
          onSuccess={() => {
            checkEligibility()
            if (onReplacementRequested) onReplacementRequested()
          }}
        />
      )}
    </>
  )
} 