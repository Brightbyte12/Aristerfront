import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit, Eye, CheckCircle, Truck, X, Loader2, AlertCircle, Package, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, isAfter, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import OrderBill from "./OrderBill";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
  sku?: string;
  cancellationRequestedAt?: string;
  adminCancellationReason?: string;
  createdAt: string;
}

interface OrderAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface OrderShipping {
  courier?: string;
  status?: string;
  shipmentId?: string;
  shiprocketOrderId?: string;
  awbCode?: string;
  pickupStatus?: string;
  manifestUrl?: string;
  labelUrl?: string;
  invoiceUrl?: string;
  tracking?: any;
}

interface OrderUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Order {
  _id: string;
  orderId: string;
  user: OrderUser;
  status: string;
  address: OrderAddress;
  items: OrderItem[];
  total: number;
  subTotal: number;
  discount: number;
  codCharge: number;
  discountCode?: string;
  payment: {
    method: string;
    paymentId: string;
    orderId: string;
    status: string;
  };
  shipping: OrderShipping;
  cancellationReason?: string;
  cancelledAt?: string;
  cancellationRequested?: boolean;
  cancellationRequestedAt?: string;
  adminCancellationReason?: string;
  createdAt: string;
}

export type { Order };

interface OrderListProps {
  orders: Order[];
  onUpdate: () => void;
}

interface CalendarHeaderProps {
  displayMonth: number;
  displayYear: number;
}

const CalendarHeader = ({ displayMonth, displayYear }: CalendarHeaderProps) => (
  <div className="flex items-center justify-center text-sm font-medium">
    {"< "}{format(new Date(displayYear, displayMonth), "MMMM yyyy")}{" >"}
  </div>
);

const OrderList: React.FC<OrderListProps> = ({ orders, onUpdate }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCancellationDialogOpen, setIsCancellationDialogOpen] = useState(false);
  const [cancellationAction, setCancellationAction] = useState<"approve" | "reject">("approve");
  const [adminReason, setAdminReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelOrderDialogOpen, setIsCancelOrderDialogOpen] = useState(false);
  const [cancelOrderReason, setCancelOrderReason] = useState("");
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [createShiprocketLoading, setCreateShiprocketLoading] = useState<string | null>(null);
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailData, setTestEmailData] = useState({
    to: "",
    subject: "Email Configuration Test",
    message: ""
  });
  const router = useRouter();
  const [filters, setFilters] = useState({
    status: "all",
    paymentStatus: "all",
    search: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });
  const [isBillDialogOpen, setIsBillDialogOpen] = useState(false);
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<Order | null>(null);
  const [orderDiscount, setOrderDiscount] = useState<number | null>(null);
  const [orderDiscountCode, setOrderDiscountCode] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddToShiprocket = async (orderId: string) => {
    setCreateShiprocketLoading(orderId);
    try {
      const response = await axios.post(`/api/orders/admin/add-to-shiprocket/${orderId}`, {}, { withCredentials: true });
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
        });
        onUpdate();
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to add order to Shiprocket",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error adding order to Shiprocket:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add order to Shiprocket",
        variant: "destructive",
      });
    } finally {
      setCreateShiprocketLoading(null);
    }
  };

  const handleCancellationRequest = async () => {
    if (!selectedOrder) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(`/api/orders/admin/cancellation/${selectedOrder.orderId}/${cancellationAction}`, {
        adminReason: adminReason.trim()
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: `Cancellation request ${cancellationAction}d successfully`,
        });
        setIsCancellationDialogOpen(false);
        setAdminReason("");
        onUpdate();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to process cancellation request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCancellationDialog = (order: Order) => {
    setSelectedOrder(order);
    setCancellationAction("approve");
    setAdminReason("");
    setIsCancellationDialogOpen(true);
  };

  const openCancelOrderDialog = (order: Order) => {
    setOrderToCancel(order);
    setCancelOrderReason("");
    setIsCancelOrderDialogOpen(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(`/api/orders/admin/cancel/${orderToCancel.orderId}`, {
        reason: cancelOrderReason.trim()
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Order cancelled successfully and removed from Shiprocket",
        });
        setIsCancelOrderDialogOpen(false);
        setCancelOrderReason("");
        setOrderToCancel(null);
        onUpdate();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to cancel order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setTestEmailLoading(true);
    try {
      const response = await axios.post('/api/orders/test-email', testEmailData, { withCredentials: true });
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: `Test email sent to ${response.data.to}`,
        });
        setTestEmailDialogOpen(false);
        setTestEmailData({ to: "", subject: "Email Configuration Test", message: "" });
      } else {
        toast({
          title: "Error",
          description: response.data.error || "Failed to send test email",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setTestEmailLoading(false);
    }
  };

  // Update the Calendar onSelect handlers with better date handling
  const handleStartDateSelect = (date: Date | undefined) => {
    setFilters(prev => ({
      ...prev,
      startDate: date ? startOfDay(date) : undefined,
      // Reset end date if it's before the new start date
      endDate: prev.endDate && date && isAfter(date, prev.endDate) ? undefined : prev.endDate
    }));
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setFilters(prev => ({
      ...prev,
      endDate: date ? startOfDay(date) : undefined
    }));
  };

  // Filter orders based on selected filters
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (filters.status !== "all" && order.status.toLowerCase() !== filters.status.toLowerCase()) {
      return false;
    }

    // Payment status filter
    if (filters.paymentStatus !== "all" && order.payment.status.toLowerCase() !== filters.paymentStatus.toLowerCase()) {
      return false;
    }

    // Search filter (Order ID or Customer Name)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesOrderId = order.orderId.toLowerCase().includes(searchLower);
      const matchesCustomerName = order.user.name.toLowerCase().includes(searchLower);
      if (!matchesOrderId && !matchesCustomerName) {
        return false;
      }
    }

    // Date range filter
    if (filters.startDate) {
      const orderDate = new Date(order.createdAt);
      if (orderDate < filters.startDate) {
        return false;
      }
    }
    if (filters.endDate) {
      const orderDate = new Date(order.createdAt);
      if (orderDate > filters.endDate) {
        return false;
      }
    }

    return true;
  });

  const handleGenerateBill = (order: Order) => {
    setSelectedOrderForBill(order);
    setIsBillDialogOpen(true);
  };

  // Fetch discount and discountCode when an order is selected
  useEffect(() => {
    if (selectedOrder && selectedOrder.orderId) {
      fetch('http://localhost:5000/api/orders/discount/' + selectedOrder.orderId)
        .then(res => res.json())
        .then(data => {   
          if (data.success) {
            setOrderDiscount(data.discount);
            setOrderDiscountCode(data.discountCode);
            
          } else {
            setOrderDiscount(null);
            setOrderDiscountCode(null);
          }
        });
    }
  }, [selectedOrder?.orderId]);

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Order Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status Filter */}
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select
                value={filters.paymentStatus}
                onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Filter */}
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search by Order ID or Customer"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex flex-col gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.startDate ? format(filters.startDate, "PPP") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.startDate}
                      onSelect={handleStartDateSelect}
                      disabled={(date) => 
                        isAfter(date, new Date()) ||
                        (filters.endDate ? isAfter(date, filters.endDate) : false)
                      }
                      initialFocus
                      className="rounded-md border shadow bg-white"
                      classNames={{
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        caption: "flex justify-center p-2 relative text-sm font-medium before:content-['<_'] after:content-['_>']",
                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      }}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.endDate ? format(filters.endDate, "PPP") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.endDate}
                      onSelect={handleEndDateSelect}
                      disabled={(date) => 
                        isAfter(date, new Date()) ||
                        (filters.startDate ? isBefore(date, filters.startDate) : false)
                      }
                      initialFocus
                      className="rounded-md border shadow bg-white"
                      classNames={{
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        caption: "flex justify-center p-2 relative text-sm font-medium before:content-['<_'] after:content-['_>']",
                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Reset Filters Button */}
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setFilters({
              status: "all",
              paymentStatus: "all",
              search: "",
              startDate: undefined,
              endDate: undefined,
            })}
          >
            Reset Filters
          </Button>
        </CardContent>
      </Card>

      {/* Orders Table - Update to use filteredOrders instead of orders */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Shipping</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
                {filteredOrders.map((order) => (
            <TableRow key={order._id}>
              <TableCell className="font-medium">{order.orderId}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{order.user.name}</div>
                  <div className="text-sm text-gray-500">{order.user.email}</div>
                </div>
              </TableCell>
              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>₹{order.total.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={order.payment.method === 'cod' ? 'destructive' : 'default'}>
                  {order.payment.method.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
                {order.cancellationRequested && (
                  <Badge variant="destructive" className="ml-1">
                    Cancellation Requested
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {order.shipping?.awbCode ? (
                  <div>
                    <div className="text-sm font-medium">AWB: {order.shipping.awbCode}</div>
                    <div className="text-xs text-gray-500">{order.shipping.courier}</div>
                  </div>
                ) : (
                  <span className="text-gray-500">Not shipped</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View Order Details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {!order.shipping?.shiprocketOrderId && order.status !== "cancelled" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddToShiprocket(order.orderId)}
                            disabled={createShiprocketLoading === order.orderId}
                          >
                            {createShiprocketLoading === order.orderId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Truck className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add to Shiprocket</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {order.cancellationRequested && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openCancellationDialog(order)}
                            disabled={isLoading}
                          >
                            <AlertCircle className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Process Cancellation Request</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {order.status !== "cancelled" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openCancelOrderDialog(order)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Cancel Order & Remove from Shiprocket</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleGenerateBill(order)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Generate Bill</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderId}</DialogTitle>
            <DialogDescription>
              Complete order information and customer details
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p>{selectedOrder.user.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p>{selectedOrder.user.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p>{selectedOrder.user.phone || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Order Date</Label>
                      <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{selectedOrder.address.name}</p>
                  <p>{selectedOrder.address.addressLine1}</p>
                  {selectedOrder.address.addressLine2 && <p>{selectedOrder.address.addressLine2}</p>}
                  <p>{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.postalCode}</p>
                  <p>{selectedOrder.address.country}</p>
                  <p>Phone: {selectedOrder.address.phone}</p>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Discount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              {item.sku && <div className="text-sm text-gray-500">SKU: {item.sku}</div>}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded border" />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded border text-xs text-gray-400">No Image</div>
                            )}
                          </TableCell>
                          <TableCell>{item.color || <span className="text-gray-400">N/A</span>}</TableCell>
                          <TableCell>{item.size || <span className="text-gray-400">N/A</span>}</TableCell>
                          <TableCell>₹{item.price.toFixed(2)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                          <TableCell>
  {orderDiscountCode ? (
    <div>
      <span>{orderDiscountCode}</span>
      {orderDiscount && orderDiscount > 0 && (
        <span className="ml-2 text-green-700">
          (-₹{(orderDiscount ?? 0).toFixed(2)})
        </span>
      )}
    </div>
  ) : (
    '-'
  )}
</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 text-right">
                    {orderDiscount && orderDiscount > 0 && (
                      <div className="text-base font-semibold text-green-700 mb-1">Discount: -₹{(orderDiscount ?? 0).toFixed(2)}</div>
                    )}
                    <div className="text-lg font-bold">Total: ₹{selectedOrder.total.toFixed(2)}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Payment Method</Label>
                      <p>{selectedOrder.payment.method}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Payment Status</Label>
                      <p>{selectedOrder.payment.status}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Payment ID</Label>
                      <p className="font-mono text-sm">{selectedOrder.payment.paymentId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Order ID</Label>
                      <p className="font-mono text-sm">{selectedOrder.payment.orderId}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <p>{selectedOrder.shipping.status || "Pending"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Courier</Label>
                      <p>{selectedOrder.shipping.courier || "Not assigned"}</p>
                    </div>
                    {selectedOrder.shipping.awbCode && (
                      <div>
                        <Label className="text-sm font-medium">AWB Code</Label>
                        <p className="font-mono text-sm font-bold text-blue-600">{selectedOrder.shipping.awbCode}</p>
                      </div>
                    )}
                    {selectedOrder.shipping.shiprocketOrderId && (
                      <div>
                        <Label className="text-sm font-medium">Shiprocket Order ID</Label>
                        <p className="font-mono text-sm">{selectedOrder.shipping.shiprocketOrderId}</p>
                      </div>
                    )}
                    {selectedOrder.shipping.shipmentId && (
                      <div>
                        <Label className="text-sm font-medium">Shipment ID</Label>
                        <p className="font-mono text-sm">{selectedOrder.shipping.shipmentId}</p>
                      </div>
                    )}
                    {selectedOrder.shipping.pickupStatus && (
                      <div>
                        <Label className="text-sm font-medium">Pickup Status</Label>
                        <p>{selectedOrder.shipping.pickupStatus}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Tracking Documents */}
                  {(selectedOrder.shipping.manifestUrl || selectedOrder.shipping.labelUrl || selectedOrder.shipping.invoiceUrl) && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium">Documents</Label>
                      <div className="flex space-x-2 mt-2">
                        {selectedOrder.shipping.manifestUrl && (
                          <a href={selectedOrder.shipping.manifestUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">📄 Manifest</a>
                        )}
                        {selectedOrder.shipping.labelUrl && (
                          <a href={selectedOrder.shipping.labelUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">🏷️ Label</a>
                        )}
                        {selectedOrder.shipping.invoiceUrl && (
                          <a href={selectedOrder.shipping.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">🧾 Invoice</a>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cancellation Information */}
              {selectedOrder.cancellationRequested && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cancellation Request</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">Requested At</Label>
                        <p>{new Date(selectedOrder.cancellationRequestedAt!).toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Reason</Label>
                        <p>{selectedOrder.cancellationReason}</p>
                      </div>
                      {selectedOrder.adminCancellationReason && (
                        <div>
                          <Label className="text-sm font-medium">Admin Response</Label>
                          <p>{selectedOrder.adminCancellationReason}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancellation Request Dialog */}
      <Dialog open={isCancellationDialogOpen} onOpenChange={setIsCancellationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Cancellation Request</DialogTitle>
            <DialogDescription>
              Review and process the cancellation request for order {selectedOrder?.orderId}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Action</Label>
              <Select value={cancellationAction} onValueChange={(value: "approve" | "reject") => setCancellationAction(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve Cancellation</SelectItem>
                  <SelectItem value="reject">Reject Cancellation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Admin Reason (Optional)</Label>
              <Textarea
                value={adminReason}
                onChange={(e) => setAdminReason(e.target.value)}
                placeholder="Provide a reason for your decision..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCancellationDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCancellationRequest}
                disabled={isLoading}
                variant={cancellationAction === "approve" ? "destructive" : "default"}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {cancellationAction === "approve" ? "Approve" : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={isCancelOrderDialogOpen} onOpenChange={setIsCancelOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order {orderToCancel?.orderId}? This action will:
              <br />• Cancel the order immediately
              <br />• Remove it from Shiprocket (if exists)
              <br />• Send cancellation email to customer
              <br />• This action cannot be undone
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Reason for cancellation *</Label>
              <Textarea
                value={cancelOrderReason}
                onChange={(e) => setCancelOrderReason(e.target.value)}
                placeholder="Provide a reason for cancelling this order..."
                rows={3}
              />
            </div>
            
            {orderToCancel && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Order Details:</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Customer:</strong> {orderToCancel.user.name}</p>
                  <p><strong>Total:</strong> ₹{orderToCancel.total.toFixed(2)}</p>
                  <p><strong>Items:</strong> {orderToCancel.items.length} product{orderToCancel.items.length !== 1 ? 's' : ''}</p>
                  <p><strong>Status:</strong> {orderToCancel.status}</p>
                  {orderToCancel.shipping?.awbCode && (
                    <p><strong>AWB:</strong> {orderToCancel.shipping.awbCode}</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCancelOrderDialogOpen(false)}>
                Keep Order
              </Button>
              <Button 
                onClick={handleCancelOrder}
                disabled={!cancelOrderReason.trim() || isLoading}
                variant="destructive"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Cancel Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={testEmailDialogOpen} onOpenChange={setTestEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Email Configuration</DialogTitle>
            <DialogDescription>
              Send a test email to verify your email configuration is working correctly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-email-to">Email Address</Label>
              <Input
                id="test-email-to"
                type="email"
                placeholder="Enter email address to send test to"
                value={testEmailData.to}
                onChange={(e) => setTestEmailData(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="test-email-subject">Subject</Label>
              <Input
                id="test-email-subject"
                type="text"
                placeholder="Email subject"
                value={testEmailData.subject}
                onChange={(e) => setTestEmailData(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="test-email-message">Custom Message (Optional)</Label>
              <Textarea
                id="test-email-message"
                placeholder="Add a custom message to the test email..."
                value={testEmailData.message}
                onChange={(e) => setTestEmailData(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">What this test will do:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Send a test email to verify configuration</li>
                <li>• Check if emails are being sent properly</li>
                <li>• Help identify any email setup issues</li>
                <li>• If no email server is configured, emails will be logged to console</li>
              </ul>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setTestEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleTestEmail}
                disabled={!testEmailData.to.trim() || testEmailLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {testEmailLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Send Test Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedOrderForBill && (
        <OrderBill
          order={selectedOrderForBill}
          isOpen={isBillDialogOpen}
          onClose={() => {
            setIsBillDialogOpen(false);
            setSelectedOrderForBill(null);
          }}
        />
      )}
    </div>
  );
};

export default OrderList; 