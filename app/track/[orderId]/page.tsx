"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertCircle, Package, Truck, CheckCircle, Clock, MapPin, Calendar, Info, X, Loader2, Home, ShoppingBag, ArrowRight, Phone, Mail, ExternalLink, RefreshCw } from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TrackingActivity {
  date: string;
  status: string;
  activity: string;
  location: string;
}

interface TrackingData {
  track_status: number;
  shipment_status: number;
  shipment_track: TrackingActivity[];
  shipment_track_activities: TrackingActivity[];
  track_url: string;
}

interface OrderInfo {
  orderId: string;
  status: string;
  shipping: {
    courier: string;
    status: string;
    awbCode: string;
    shiprocketOrderId: string;
    tracking: any;
    expectedDeliveryDate?: string;
  };
  payment: {
    method: string;
  };
  createdAt: string;
  total: number;
  items: {
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
  cancellationRequested?: boolean;
}

const TrackingPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAWB, setHasAWB] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  const fetchOrderData = async () => {
    try {
      // First try to get tracking data
      const trackingResponse = await axios.get(`/api/orders/track/${orderId}`, { 
        withCredentials: true 
      });

      if (trackingResponse.data.success) {
        setTrackingData(trackingResponse.data.tracking);
        setHasAWB(true);
        
        // Also get order info for additional details like expected delivery date
        try {
          const orderResponse = await axios.get(`/api/orders/info/${orderId}`, { 
            withCredentials: true 
          });
          
          if (orderResponse.data.success) {
            setOrderInfo(orderResponse.data.order);
          }
        } catch (orderErr) {
          console.error("Failed to get order info:", orderErr);
          // Don't fail the whole request if order info fails
        }
      }
    } catch (err: any) {
      // If tracking fails (likely no AWB), get basic order info
      if (err.response?.status === 400) {
        try {
          const orderResponse = await axios.get(`/api/orders/info/${orderId}`, { 
            withCredentials: true 
          });
          
          if (orderResponse.data.success) {
            setOrderInfo(orderResponse.data.order);
            setHasAWB(false);
            
            // Sync status from Shiprocket if order has Shiprocket ID
            if (orderResponse.data.order.shipping?.shiprocketOrderId) {
              try {
                const syncResponse = await axios.get(`/api/orders/sync-status/${orderId}`, { withCredentials: true });
                if (syncResponse.data.success && syncResponse.data.order.status === "cancelled") {
                  // Refresh order info if it was cancelled
                  const refreshedResponse = await axios.get(`/api/orders/info/${orderId}`, { withCredentials: true });
                  if (refreshedResponse.data.success) {
                    setOrderInfo(refreshedResponse.data.order);
                    toast({ 
                      title: "Order Cancelled", 
                      description: "This order has been cancelled by admin in Shiprocket." 
                    });
                  }
                }
              } catch (syncError) {
                console.error("Failed to sync status from Shiprocket:", syncError);
              }
            }
          }
        } catch (orderErr: any) {
          const errorMessage = orderErr.response?.data?.error || orderErr.message || "Failed to fetch order information";
          setError(errorMessage);
          toast({ 
            variant: "destructive", 
            title: "Error", 
            description: errorMessage 
          });
        }
      } else {
        const errorMessage = err.response?.data?.error || err.message || "Failed to fetch tracking data";
        setError(errorMessage);
        toast({ 
          variant: "destructive", 
          title: "Error", 
          description: errorMessage 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSyncStatus = async () => {
    if (!orderInfo?.shipping?.shiprocketOrderId) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Order not found in Shiprocket" 
      });
      return;
    }

    setLoading(true);
    try {
      const syncResponse = await axios.get(`/api/orders/sync-status/${orderId}`, { withCredentials: true });
      if (syncResponse.data.success) {
        if (syncResponse.data.order.status === "cancelled") {
          // Refresh order info
          const refreshedResponse = await axios.get(`/api/orders/info/${orderId}`, { withCredentials: true });
          if (refreshedResponse.data.success) {
            setOrderInfo(refreshedResponse.data.order);
            toast({ 
              title: "Order Cancelled", 
              description: "This order has been cancelled by admin in Shiprocket." 
            });
          }
        } else {
          toast({ 
            title: "Status Synced", 
            description: "Order status checked from Shiprocket." 
          });
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to sync status";
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Please provide a reason for cancellation" 
      });
      return;
    }

    setCancelling(true);
    try {
      const response = await axios.post(`/api/orders/request-cancellation/${orderId}`, {
        reason: cancelReason
      }, { withCredentials: true });

      if (response.data.success) {
        toast({ 
          title: "Cancellation Request Submitted", 
          description: "Your request has been sent to our admin team for review." 
        });
        setShowCancelDialog(false);
        setCancelReason("");
        // Refresh order data
        fetchOrderData();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to submit cancellation request";
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: errorMessage 
      });
    } finally {
      setCancelling(false);
    }
  };

  const renderStatus = (status: number) => {
    switch (status) {
      case 1: return "Order Placed";
      case 2: return "Order Confirmed";
      case 3: return "Order Shipped";
      case 4: return "Out for Delivery";
      case 5: return "Delivered";
      default: return "Unknown";
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1: return <ShoppingBag className="w-5 h-5 text-blue-600" />;
      case 2: return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 3: return <Truck className="w-5 h-5 text-orange-600" />;
      case 4: return <Truck className="w-5 h-5 text-purple-600" />;
      case 5: return <Home className="w-5 h-5 text-green-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getOrderStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered')) return 'bg-green-100 text-green-800 border-green-200';
    if (statusLower.includes('shipped') || statusLower.includes('out for delivery')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (statusLower.includes('processing') || statusLower.includes('confirmed')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (statusLower.includes('cancelled')) return 'bg-red-100 text-red-800 border-red-200';
    if (statusLower.includes('pending')) return 'bg-gray-100 text-gray-800 border-gray-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const canCancelOrder = (status: string, orderInfo?: OrderInfo) => {
    if (!orderInfo) return false;
    
    // Don't allow cancellation if already requested
    if (orderInfo.cancellationRequested) return false;
    
    // Don't allow cancellation if order is cancelled
    if (status.toLowerCase().includes('cancelled')) return false;
    
    // Don't allow cancellation if order is delivered
    if (status.toLowerCase().includes('delivered')) return false;
    
    // Don't allow cancellation if order is shipped and has AWB
    if (orderInfo.shipping?.awbCode && orderInfo.shipping?.status === 'shipped') return false;
    
    // Allow cancellation for pending, processing, confirmed orders
    const allowedStatuses = ['pending', 'processing', 'confirmed'];
    return allowedStatuses.some(allowed => status.toLowerCase().includes(allowed));
  };

  const isOrderShipped = (status: string, orderInfo?: OrderInfo) => {
    if (!orderInfo) return false;
    
    // Check if order status indicates shipping
    const shippedStatuses = ['shipped', 'out for delivery', 'in transit'];
    if (shippedStatuses.some(shipped => status.toLowerCase().includes(shipped))) {
      return true;
    }
    
    // Check if shipping status indicates shipped
    if (orderInfo.shipping?.status && shippedStatuses.includes(orderInfo.shipping.status.toLowerCase())) {
      return true;
    }
    
    // Check if order has AWB code
    if (orderInfo.shipping?.awbCode) {
      return true;
    }
    
    return false;
  };

  const getDeliveryProgress = () => {
    if (!trackingData) return 0;
    
    const status = trackingData.track_status;
    switch (status) {
      case 1: return 20; // Order Placed
      case 2: return 40; // Order Confirmed
      case 3: return 60; // Order Shipped
      case 4: return 80; // Out for Delivery
      case 5: return 100; // Delivered
      default: return 0;
    }
  };

  const getCurrentStatusText = () => {
    if (!trackingData) return "Processing";
    
    const status = trackingData.track_status;
    switch (status) {
      case 1: return "Order Placed";
      case 2: return "Order Confirmed";
      case 3: return "Shipped";
      case 4: return "Out for Delivery";
      case 5: return "Delivered";
      default: return "Processing";
    }
  };

  const getCurrentStatusColor = () => {
    if (!trackingData) return "text-gray-600";
    
    const status = trackingData.track_status;
    switch (status) {
      case 1: return "text-blue-600";
      case 2: return "text-green-600";
      case 3: return "text-orange-600";
      case 4: return "text-purple-600";
      case 5: return "text-green-600";
      default: return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => window.history.back()} variant="outline" className="w-full">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show order info when no AWB is assigned
  if (!hasAWB && orderInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Package</h1>
                <p className="text-gray-600">Order #{orderInfo.orderId}</p>
              </div>
              {orderInfo.shipping?.shiprocketOrderId && (
                <Button 
                  variant="outline" 
                  onClick={handleSyncStatus}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Refresh Status
                </Button>
              )}
            </div>
          </div>

          {/* Status Card */}
          <Card className="mb-6 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Confirmed</h2>
                <p className="text-gray-600 mb-4">
                  Your order has been confirmed and is being processed. You'll receive tracking information once it ships.
                </p>
                
                {orderInfo.shipping?.expectedDeliveryDate && (
                  <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">
                      Expected Delivery: {new Date(orderInfo.shipping.expectedDeliveryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="mb-6 border-0 shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-2xl font-bold text-gray-800">Order Details</CardTitle>
                <div className="mt-2 sm:mt-0 flex items-center gap-2">
                  <Badge className={getOrderStatusColor(orderInfo.status)}>{orderInfo.status}</Badge>
                  {orderInfo.payment?.method && (
                    <Badge 
                      variant={orderInfo.payment.method.toLowerCase() === 'cod' ? 'destructive' : 'default'}
                      className="whitespace-nowrap"
                    >
                      {orderInfo.payment.method.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">{orderInfo.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span>{new Date(orderInfo.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold">₹{orderInfo.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span>{orderInfo.items.length} product{orderInfo.items.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  {/* Order Items with Images */}
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Items</h4>
                    <div className="space-y-3">
                      {orderInfo.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 border rounded p-2 bg-gray-50">
                          <img
                            src={item.image || '/placeholder.svg'}
                            alt={item.name}
                            className="w-14 h-14 object-cover rounded border"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                            <div className="text-sm text-gray-500">₹{item.price.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Shipping Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getOrderStatusColor(orderInfo.status)}>
                        {orderInfo.status}
                      </Badge>
                    </div>
                    {orderInfo.shipping?.shiprocketOrderId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shiprocket ID:</span>
                        <span className="font-mono text-sm">{orderInfo.shipping.shiprocketOrderId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button onClick={() => window.history.back()} variant="outline">
              Back to Orders
            </Button>
            
            {canCancelOrder(orderInfo.status, orderInfo) && (
              <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    <span className="ml-2">Cancel Order</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Request Order Cancellation</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to request cancellation for order #{orderInfo.orderId}? 
                      This request will be reviewed by our admin team.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cancelReason">Reason for cancellation *</Label>
                      <Textarea
                        id="cancelReason"
                        placeholder="Please provide a reason for cancelling this order..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="mt-2"
                        rows={3}
                      />
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => {
                      setShowCancelDialog(false);
                      setCancelReason("");
                    }}>
                      Keep Order
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelOrder}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={!cancelReason.trim() || cancelling}
                    >
                      {cancelling ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Submit Request
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!trackingData?.shipment_track?.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Package</h1>
            <p className="text-gray-600">Order #{orderId}</p>
          </div>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tracking Information Available</h3>
              <p className="text-gray-600 mb-6">
                Tracking information for this order is not available yet. Please check back later.
              </p>
              <Button onClick={() => window.history.back()} variant="outline">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { track_status, shipment_status, shipment_track } = trackingData;
  const progress = getDeliveryProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Package</h1>
          <p className="text-gray-600">Order #{orderId}</p>
        </div>

        {/* Main Status Card */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className={`text-2xl font-bold ${getCurrentStatusColor()} mb-2`}>
                {getCurrentStatusText()}
              </h2>
              {orderInfo?.shipping?.expectedDeliveryDate && (
                <p className="text-gray-600">
                  Expected delivery: {new Date(orderInfo.shipping.expectedDeliveryDate).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Order Placed</span>
                <span>Delivered</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>{progress}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Courier Information */}
            {orderInfo?.shipping?.awbCode && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Courier</div>
                  <div className="font-semibold text-gray-900">{orderInfo.shipping.courier || "Not assigned"}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Tracking Number</div>
                  <div className="font-mono text-sm font-semibold text-gray-900">{orderInfo.shipping.awbCode}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Expected Delivery</div>
                  <div className="font-semibold text-gray-900">
                    {orderInfo.shipping.expectedDeliveryDate 
                      ? new Date(orderInfo.shipping.expectedDeliveryDate).toLocaleDateString()
                      : "3-5 business days"
                    }
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tracking Timeline */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Tracking History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {shipment_track.map((activity, index) => (
                <div key={index} className="relative">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{activity.activity}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{activity.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(activity.date).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-4">
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {index < shipment_track.length - 1 && (
                    <div className="absolute left-4 top-8 w-0.5 h-6 bg-gray-200"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button onClick={() => window.history.back()} variant="outline">
            Back to Orders
          </Button>
          
          {orderInfo?.shipping?.awbCode && (
            <a 
              href={`https://track.shiprocket.in/track/${orderInfo.shipping.awbCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Track on Shiprocket
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingPage; 