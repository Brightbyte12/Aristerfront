"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  User,
  Package,
  Truck,
  CheckSquare,
  Loader2
} from "lucide-react"
import { 
  approveReplacement, 
  rejectReplacement, 
  getAllReplacementRequests,
  completeReplacement
} from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ReplacementRequest {
  orderId: string
  user: {
    name: string
    email: string
    phone: string
  }
  items: any[]
  total: number
  replacementRequestedAt: string
  replacementReason: string
  replacementStatus: string
  replacementApprovedAt?: string
  replacementRejectedAt?: string
  replacementRejectionReason?: string
  replacementCompletedAt?: string
  replacementTrackingNumber?: string
  replacementCourier?: string
  replacementShiprocketOrderId?: string
  replacementAdminNotes?: string
  orderDate: string
  shipping: any
}

export default function AdminReplacementManagement() {
  const [replacements, setReplacements] = useState<ReplacementRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  const fetchReplacements = async () => {
    try {
      setLoading(true)
      const result = await getAllReplacementRequests()
      setReplacements(result.replacements)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch replacement requests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReplacements()
  }, [])

  const handleApprove = async (orderId: string) => {
    setActionLoading(orderId)
    try {
      await approveReplacement(orderId, adminNotes)
      toast({
        title: "Replacement Approved",
        description: "Shiprocket order created successfully",
      })
      fetchReplacements()
      setAdminNotes("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve replacement",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (orderId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Rejection reason is required",
        variant: "destructive",
      })
      return
    }

    setActionLoading(orderId)
    try {
      await rejectReplacement(orderId, rejectionReason, adminNotes)
      toast({
        title: "Replacement Rejected",
        description: "Replacement request has been rejected",
      })
      fetchReplacements()
      setRejectionReason("")
      setAdminNotes("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject replacement",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleComplete = async (orderId: string) => {
    setActionLoading(orderId)
    try {
      await completeReplacement(orderId, adminNotes)
      toast({
        title: "Replacement Completed",
        description: "Replacement has been marked as completed",
      })
      fetchReplacements()
      setAdminNotes("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to complete replacement",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending Review", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", text: "Approved", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected", icon: XCircle },
      completed: { color: "bg-blue-100 text-blue-800", text: "Completed", icon: CheckSquare }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading replacement requests...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Replacement Management</h2>
        <Button onClick={fetchReplacements} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {replacements.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Replacement Requests</h3>
            <p className="text-gray-500">There are no pending replacement requests at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {replacements.map((replacement) => (
            <Card key={replacement.orderId} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <CardTitle className="text-lg">Order #{replacement.orderId}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Requested on {new Date(replacement.replacementRequestedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(replacement.replacementStatus)}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₹{replacement.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{replacement.items.length} item(s)</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Customer Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {replacement.user.name}</p>
                      <p><span className="font-medium">Email:</span> {replacement.user.email}</p>
                      <p><span className="font-medium">Phone:</span> {replacement.user.phone}</p>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Truck className="w-4 h-4 mr-2" />
                      Shipping Address
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>{replacement.shipping.name}</p>
                      <p>{replacement.shipping.addressLine1}</p>
                      {replacement.shipping.addressLine2 && <p>{replacement.shipping.addressLine2}</p>}
                      <p>{replacement.shipping.city}, {replacement.shipping.state} {replacement.shipping.postalCode}</p>
                      <p>{replacement.shipping.country}</p>
                      <p>Phone: {replacement.shipping.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Items
                  </h4>
                  <div className="space-y-2">
                    {replacement.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} | Size: {item.size} | Color: {item.color}
                          </p>
                        </div>
                        <p className="font-medium">₹{item.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Replacement Reason */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Replacement Reason</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {replacement.replacementReason}
                  </p>
                </div>

                {/* Tracking Information (if approved) */}
                {replacement.replacementStatus === 'approved' && replacement.replacementTrackingNumber && (
                  <div className="mt-6">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-1">Shiprocket Order Created</div>
                        <div className="text-sm space-y-1">
                          <p>• Tracking Number: {replacement.replacementTrackingNumber}</p>
                          <p>• Courier: {replacement.replacementCourier}</p>
                          <p>• Shiprocket Order ID: {replacement.replacementShiprocketOrderId}</p>
                          <p>• Approved on: {new Date(replacement.replacementApprovedAt!).toLocaleDateString()}</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Rejection Information (if rejected) */}
                {replacement.replacementStatus === 'rejected' && replacement.replacementRejectionReason && (
                  <div className="mt-6">
                    <Alert>
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-1">Replacement Rejected</div>
                        <div className="text-sm space-y-1">
                          <p>• Reason: {replacement.replacementRejectionReason}</p>
                          <p>• Rejected on: {new Date(replacement.replacementRejectedAt!).toLocaleDateString()}</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Admin Notes */}
                {replacement.replacementAdminNotes && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Admin Notes</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {replacement.replacementAdminNotes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {replacement.replacementStatus === 'pending' && (
                  <div className="mt-6 flex gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve & Create Shiprocket Order
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Replacement</DialogTitle>
                          <DialogDescription>
                            This will create a Shiprocket order for the replacement. The customer will receive a free replacement.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                            <Textarea
                              id="adminNotes"
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add any notes about this replacement..."
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleApprove(replacement.orderId)}
                              disabled={actionLoading === replacement.orderId}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {actionLoading === replacement.orderId ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              )}
                              Approve Replacement
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setAdminNotes("")}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Replacement</DialogTitle>
                          <DialogDescription>
                            Please provide a reason for rejecting this replacement request.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                            <Textarea
                              id="rejectionReason"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Explain why this replacement request is being rejected..."
                              rows={3}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                            <Textarea
                              id="adminNotes"
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add any additional notes..."
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleReject(replacement.orderId)}
                              disabled={actionLoading === replacement.orderId || !rejectionReason.trim()}
                              variant="destructive"
                            >
                              {actionLoading === replacement.orderId ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-2" />
                              )}
                              Reject Replacement
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setRejectionReason("")
                                setAdminNotes("")
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* Complete Button (if approved) */}
                {replacement.replacementStatus === 'approved' && (
                  <div className="mt-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckSquare className="w-4 h-4 mr-2" />
                          Mark as Completed
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Complete Replacement</DialogTitle>
                          <DialogDescription>
                            Mark this replacement as completed once the customer has received the replacement.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                            <Textarea
                              id="adminNotes"
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add any notes about the completion..."
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleComplete(replacement.orderId)}
                              disabled={actionLoading === replacement.orderId}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {actionLoading === replacement.orderId ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <CheckSquare className="w-4 h-4 mr-2" />
                              )}
                              Mark as Completed
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setAdminNotes("")}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 