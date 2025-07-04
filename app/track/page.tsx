"use client";

import { useState, useEffect, FC } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AlertCircle, Package, ArrowRight, Truck, CheckCircle, Clock, X, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

interface Order {
  _id: string;
  orderId: string;
  total: number;
  status: string;
  createdAt: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    image?: string;
    color?: string;
    size?: string;
  }[];
  shipping: {
    courier: string;
    status: string;
    awbCode: string;
    shiprocketOrderId: string;
    tracking: any;
    expectedDeliveryDate?: string;
  };
  cancellationReason?: string;
  cancellationRequested: boolean;
  codCharge: number;
}

const OrderListSkeleton: FC = () => (
  <div className="container mx-auto p-4 md:p-6 lg:p-8">
    <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Orders</h1>
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="overflow-hidden shadow-md">
          <CardHeader className="bg-gray-50 p-4 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-md flex-shrink-0" />
                <div className="flex-grow space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t text-right">
              <Skeleton className="h-7 w-28 ml-auto" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const TrackOrdersPage: FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/users/orders", { withCredentials: true });
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to fetch orders");
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch orders." });
    } finally {
      setLoading(false);
    }
  };

  const getUnifiedStatus = (order: Order) => {
    if (order.status?.toLowerCase() === "cancelled" || order.shipping?.status?.toLowerCase() === "cancelled") {
      return "Cancelled";
    }
    if (order.shipping?.awbCode) {
      return order.shipping.status || "Shipped";
    }
    if (order.shipping?.shiprocketOrderId) {
      return "Processing";
    }
    return order.status || "Pending";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return "bg-green-100 text-green-800";
      case "shipped": case "in transit": return "bg-blue-100 text-blue-800";
      case "processing": case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": case "rto": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const formatTrackingStatus = (status: string) => {
    if (!status) return "Pending";
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return <OrderListSkeleton />;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Your Orders</h1>
        <Button variant="outline" onClick={fetchOrders} disabled={loading}>
          <Loader2 className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : 'hidden'}`} />
          Refresh Status
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {orders.length === 0 && !error ? (
        <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700">No Orders Found</h2>
          <p className="mt-2 text-gray-500">You haven't placed any orders yet.</p>
          <Button onClick={() => router.push('/')} className="mt-6">
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => {
            const shiprocketTrackingUrl = order.shipping?.shiprocketOrderId
              ? `https://shiprocket.co/tracking/order/${order.orderId}?company_id=${process.env.NEXT_PUBLIC_SHIPROCKET_COMPANY_ID}`
              : null;

            console.log('COD Charge:', order.codCharge);
            console.log('Order Items:', order.items);
            console.log('Shiprocket Total:', order.total);
            console.log('Shiprocket Payload:', {
              order_id: order.orderId,
              order_items: order.items,
              total: order.total,
              // ...other fields
            });

            return (
              <Card key={order._id} className="flex flex-col overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gray-50 p-4 border-b">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div className="mb-2 sm:mb-0">
                      <p className="font-semibold text-gray-800">Order ID: {order.orderId}</p>
                      <p className="text-sm text-gray-500">
                        Placed on: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(getUnifiedStatus(order))}>
                        {formatTrackingStatus(getUnifiedStatus(order))}
                      </Badge>
                      {shiprocketTrackingUrl ? (
                        <a href={shiprocketTrackingUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="whitespace-nowrap">
                            Track Order <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </a>
                      ) : (
                          <Button variant="outline" size="sm" className="whitespace-nowrap" disabled>
                            Track Order <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow flex flex-col">
                  <div className="space-y-4 flex-grow">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          {item.color && (
                            <p className="text-sm text-gray-500">Color: {item.color}</p>
                          )}
                          {item.size && (
                            <p className="text-sm text-gray-500">Size: {item.size}</p>
                          )}
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-800 whitespace-nowrap">
                          ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t text-right">
                    <p className="text-lg font-bold text-gray-900">Total: ₹{order.total.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrackOrdersPage; 