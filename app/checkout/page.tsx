"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Edit, CreditCard, DollarSign, XCircle, CheckCircle, Landmark, Smartphone, Wallet, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface RazorpayWindow extends Window {
  Razorpay: any;
}

declare const window: RazorpayWindow;

interface Address {
  _id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface CartItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  color?: string;
  size?: string;
}

export default function CheckoutPage() {
  const { state } = useAuth();
  const { user, isAuthenticated } = state;
  const { cartItems, clearCart } = useCart();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Only for order placement and navigation
  const [isAddressLoading, setIsAddressLoading] = useState(false); // For address form
  const [isNavigating, setIsNavigating] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeFetched, setPincodeFetched] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [codCharge, setCodCharge] = useState(0);
  const [codAvailable, setCodAvailable] = useState(true);
  const [codLoading, setCodLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [onlinePaymentSettings, setOnlinePaymentSettings] = useState<any>(null);
  const [onlinePaymentAvailable, setOnlinePaymentAvailable] = useState(true);
  const [onlinePaymentLoading, setOnlinePaymentLoading] = useState(true);
  const [orderButtonDisabled, setOrderButtonDisabled] = useState(false);
  const [showOnlinePaymentUnavailable, setShowOnlinePaymentUnavailable] = useState(false);

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  ];

  const subTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const totalAmount = useMemo(() => subTotal - discount + codCharge, [subTotal, discount, codCharge]);

  useEffect(() => {
    if (!isAuthenticated && !state.isLoading) router.push("/login");
  }, [isAuthenticated, state.isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAddresses();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (window.Razorpay) {
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    fetchOnlinePaymentSettings();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get("/api/users/address", { withCredentials: true });
      if (response.data.success) {
        setAddresses(response.data.addresses);
        const defaultAddress = response.data.addresses.find((addr: Address) => addr.isDefault);
        setSelectedAddress(defaultAddress || null);
      }
    } catch (error: any) {
      console.error("Fetch addresses error:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch addresses." });
    }
  };

  const fetchOnlinePaymentSettings = async () => {
    try {
      setOnlinePaymentLoading(true);
      const { data } = await axios.get('/api/settings/public');
      setOnlinePaymentSettings(data.onlinePayment);
      setOnlinePaymentAvailable(isOnlinePaymentAvailable(data.onlinePayment));
    } catch (error) {
      console.error("Fetch online payment settings error:", error);
      setOnlinePaymentAvailable(true); // Fallback to true to avoid blocking checkout
    } finally {
      setOnlinePaymentLoading(false);
    }
  };

  const isOnlinePaymentAvailable = (settings: any) => {
    if (!settings?.enabled) return false;
    const tr = settings.timeRestrictions;
    if (!tr?.enabled) return true;
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    const currentDay = now.getDay();
    if (tr.daysOfWeek && Array.isArray(tr.daysOfWeek) && tr.daysOfWeek.length > 0 && !tr.daysOfWeek.includes(currentDay)) {
      return false;
    }
    if (currentTime < tr.startTime || currentTime > tr.endTime) {
      return false;
    }
    return true;
  };

  const validateAndFetchPincode = async (pincode: string) => {
    if (!/^\d{6}$/.test(pincode)) {
      setAddressErrors((prev) => ({ ...prev, postalCode: "Enter a valid 6-digit postal code" }));
      return;
    }
    setPincodeLoading(true);
    try {
      const response = await axios.get(`/api/users/pincode/${pincode}`, { withCredentials: true });
      if (response.data[0]?.Status === "Success" && response.data[0]?.PostOffice?.length) {
        const postOffice = response.data[0].PostOffice[0];
        if (!postOffice.City && !postOffice.District && !postOffice.State) {
          throw new Error("Invalid pincode data: Missing City, District, or State");
        }
        setAddressForm((prev) => ({
          ...prev,
          city: postOffice.City || postOffice.District,
          state: postOffice.State,
        }));
        setAddressErrors((prev) => ({ ...prev, postalCode: "", city: "", state: "" }));
        setPincodeFetched(true);
      } else {
        setAddressErrors((prev) => ({ ...prev, postalCode: "Invalid pincode" }));
      }
    } catch (error: any) {
      console.error("Pincode fetch error:", error.message, error.response?.data);
      setAddressErrors((prev) => ({
        ...prev,
        postalCode: error.response?.data?.error || error.message || "Failed to validate pincode",
      }));
    } finally {
      setPincodeLoading(false);
    }
  };

  const validateAddressForm = () => {
    const errors: Record<string, string> = {};
    if (!addressForm.name) errors.name = "Recipient name is required";
    if (!addressForm.phone || !/^\d{10}$/.test(addressForm.phone)) errors.phone = "Enter a valid 10-digit phone number";
    if (!addressForm.addressLine1) errors.addressLine1 = "Address line 1 is required";
    if (!addressForm.city) errors.city = "City is required";
    if (!addressForm.state) errors.state = "State is required";
    if (!addressForm.postalCode || !/^\d{6}$/.test(addressForm.postalCode)) errors.postalCode = "Enter a valid 6-digit postal code";
    if (!addressForm.country) errors.country = "Country is required";
    return errors;
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
    setAddressErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "postalCode") {
      setPincodeFetched(false);
      if (value.length !== 6) {
        setAddressForm((prev) => ({ ...prev, city: "", state: "" }));
      }
      if (value.length === 6) {
        validateAndFetchPincode(value);
      }
    }
  };

  const handleStateChange = (value: string) => {
    setAddressForm((prev) => ({ ...prev, state: value }));
    setAddressErrors((prev) => ({ ...prev, state: "" }));
  };

  const handleDefaultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setAddressForm((prev) => ({ ...prev, isDefault: isChecked }));
    if (isChecked) {
      toast({ description: "This will unset other default addresses." });
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validateAddressForm();
    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }
    setIsAddressLoading(true);
    try {
      // Debug: Log addressForm before sending
      console.log('Submitting addressForm:', addressForm);
      if (editingAddressId) {
        const response = await axios.put(`/api/users/address/${editingAddressId}`, addressForm, { withCredentials: true });
        if (response.data.success) {
          setAddresses((prev) =>
            prev.map((addr) => (addr._id === editingAddressId ? response.data.address : { ...addr, isDefault: addr._id === editingAddressId ? addressForm.isDefault : false }))
          );
          setSelectedAddress(response.data.address);
          toast({ title: "Success", description: "Address updated successfully." });
        }
      } else {
        const response = await axios.post("/api/users/address", addressForm, { withCredentials: true });
        if (response.data.success) {
          setAddresses((prev) => [
            ...prev.map((addr) => ({ ...addr, isDefault: addressForm.isDefault ? false : addr.isDefault })),
            response.data.address,
          ]);
          setSelectedAddress(response.data.address);
          toast({ title: "Success", description: "Address added successfully." });
        }
      }
      resetAddressForm();
    } catch (error: any) {
      console.error("Address submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "Failed to save address.",
      });
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    setAddressForm({
      name: address.name,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setEditingAddressId(address._id);
    setPincodeFetched(true);
    setIsAddressFormOpen(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    setIsLoading(true);
    try {
      const response = await axios.delete(`/api/users/address/${addressId}`, { withCredentials: true });
      if (response.data.success) {
        setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));
        if (selectedAddress?._id === addressId) {
          const defaultAddress = addresses.find((addr) => addr.isDefault && addr._id !== addressId);
          setSelectedAddress(defaultAddress || addresses[0] || null);
        }
        toast({ title: "Success", description: "Address deleted successfully." });
      }
    } catch (error: any) {
      console.error("Delete address error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "Failed to delete address.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      isDefault: false,
    });
    setAddressErrors({});
    setIsAddressFormOpen(false);
    setEditingAddressId(null);
    setPincodeFetched(false);
  };

  const validateAddressForCheckout = async (address: Address) => {
    try {
      const response = await axios.get(`/api/users/pincode/${address.postalCode}`, { withCredentials: true });
      if (!response.data || !Array.isArray(response.data) || response.data[0]?.Status !== "Success" || !response.data[0]?.PostOffice?.length) {
        throw new Error(`Invalid pincode: ${address.postalCode}`);
      }
      const postOffice = response.data[0].PostOffice[0];
      if (!postOffice) {
        throw new Error("Invalid pincode data: Missing PostOffice");
      }
      const apiCity = postOffice.City || postOffice.District;
      const apiState = postOffice.State;
      if (!apiCity || !apiState) {
        throw new Error(`Invalid pincode data: Missing ${!apiCity ? "City/District" : "State"}`);
      }
      const cityMatch = apiCity.toLowerCase() === address.city.toLowerCase();
      const stateMatch = apiState.toLowerCase() === address.state.toLowerCase();
      if (!cityMatch) {
        throw new Error(`City does not match pincode: expected ${apiCity}, got ${address.city}`);
      }
      if (!stateMatch) {
        throw new Error(`State does not match pincode: expected ${apiState}, got ${address.state}`);
      }
      return true;
    } catch (error: any) {
      console.error("Validation Error:", error.message, error.response?.data);
      toast({
        variant: "destructive",
        title: "Invalid Address",
        description: error.message || "Failed to validate address.",
      });
      return false;
    }
  };

  const fetchCodCharge = async () => {
    if (!selectedAddress || cartItems.length === 0) {
      setCodAvailable(false);
      setCodCharge(0);
      return;
    }

    setCodLoading(true);
    try {
      const response = await axios.post("/api/orders/check-cod", {
        cartItems,
        address: selectedAddress,
        orderTime: new Date().toISOString(),
      }, { withCredentials: true });

      if (response.data.available) {
        setCodCharge(response.data.codCharge);
        setCodAvailable(true);
        toast({ title: "Success", description: `COD available with ₹${response.data.codCharge} charge.` });
      } else {
        setCodCharge(0);
        setCodAvailable(false);
        toast({
          variant: "destructive",
          title: "COD Not Available",
          description: response.data.reason || "COD is not available for this order.",
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch COD charge", error);
      setCodCharge(0);
      setCodAvailable(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.reason || "Failed to check COD availability.",
      });
    } finally {
      setCodLoading(false);
    }
  };

  useEffect(() => {
    if (paymentMethod === 'cod' && selectedAddress && cartItems.length > 0) {
      fetchCodCharge();
    } else if (paymentMethod !== 'cod') {
      setCodCharge(0);
      setCodAvailable(true); // Reset COD availability when not selected
    }
  }, [paymentMethod, selectedAddress, cartItems]);

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setPromoError("");
    try {
      const { data } = await axios.post('/api/promotions/apply', {
        code: promoCode,
        cartTotal: subTotal,
      }, { withCredentials: true });
      setDiscount(data.discount);
      toast({ title: "Success", description: data.message });
    } catch (error: any) {
      setDiscount(0);
      const message = error.response?.data?.message || "Failed to apply promo code.";
      setPromoError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handlePlaceOrder = async () => {
    setOrderButtonDisabled(true);
    setIsLoading(true);
    try {
      if (!selectedAddress || !user) {
        toast({ title: "Error", description: "Please select a shipping address.", variant: "destructive" });
        return;
      }

      if (paymentMethod === 'cod' && !codAvailable) {
        toast({ title: "Error", description: "COD is not available for this order.", variant: "destructive" });
        return;
      }

      const isAddressValid = await validateAddressForCheckout(selectedAddress);
      if (!isAddressValid) return;

      const orderDetails = {
        cartItems,
        address: selectedAddress,
        paymentMethod,
        promoCode: discount > 0 ? promoCode : undefined,
      };

      if (paymentMethod === 'cod') {
        try {
          const { data: newOrder } = await axios.post("/api/orders", orderDetails, { withCredentials: true });
          toast({ title: "Success", description: `Order ${newOrder.orderId} placed successfully!` });
          clearCart();
          setIsNavigating(true);
          router.push(`/track/${newOrder.orderId}`);
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.response?.data?.error || "Failed to place COD order.",
          });
        }
      } else {
        try {
          const { data: razorpayOrder } = await axios.post("/api/orders/create-razorpay-order", { amount: totalAmount }, { withCredentials: true });

          const options = {
            key: razorpayOrder.key_id,
            amount: razorpayOrder.amount,
            currency: "INR",
            name: "Arister",
            order_id: razorpayOrder.order_id,
            handler: async function (response: any) {
              const paymentResult = {
                id: response.razorpay_payment_id,
                status: 'captured',
              };
              const finalOrderDetails = { ...orderDetails, paymentResult };
              const { data: newOrder } = await axios.post("/api/orders", finalOrderDetails, { withCredentials: true });
              toast({ title: "Success", description: "Payment successful! Order placed." });
              clearCart();
              setIsNavigating(true);
              router.push(`/track/${newOrder.orderId}`);
            },
            prefill: {
              name: user.name,
              email: user.email,
              contact: selectedAddress.phone,
            },
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.response?.data?.error || "Failed to initiate online payment.",
          });
        }
      }
    } catch (error) {
      console.error("Place order error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred.",
      });
    } finally {
      setIsLoading(false);
      setOrderButtonDisabled(false);
    }
  };

  // Remove loader after navigation
  useEffect(() => {
    if (!isNavigating) return;
    const handleRouteChange = () => setIsNavigating(false);
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [isNavigating]);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      {/* Global Loader overlay when placing order */}
      {(isLoading || isNavigating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
            <span className="ml-2 text-lg text-emerald-700 mt-2">
              {isNavigating ? "Redirecting to order tracking..." : "Placing your order..."}
            </span>
          </div>
        </div>
      )}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Main Checkout Sections */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Delivery Address */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-semibold">Delivery Address</CardTitle>
              {!isAddressFormOpen && (
                <Button variant="outline" size="sm" onClick={() => setIsAddressFormOpen(true)}>
                  Add New Address
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isAddressFormOpen ? (
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Recipient Name</Label>
                      <Input id="name" name="name" value={addressForm.name} onChange={handleAddressChange} placeholder="Enter recipient name" />
                      {addressErrors.name && <p className="text-red-500 text-xs mt-1">{addressErrors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" value={addressForm.phone} onChange={handleAddressChange} placeholder="10-digit phone number" />
                      {addressErrors.phone && <p className="text-red-500 text-xs mt-1">{addressErrors.phone}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input id="addressLine1" name="addressLine1" value={addressForm.addressLine1} onChange={handleAddressChange} placeholder="Flat, House no., Building" />
                    {addressErrors.addressLine1 && <p className="text-red-500 text-xs mt-1">{addressErrors.addressLine1}</p>}
                  </div>
                  <div>
                    <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                    <Input id="addressLine2" name="addressLine2" value={addressForm.addressLine2} onChange={handleAddressChange} placeholder="Apartment, suite, unit" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input id="postalCode" name="postalCode" value={addressForm.postalCode} onChange={handleAddressChange} placeholder="6-digit postal code" disabled={pincodeLoading} />
                      {addressErrors.postalCode && <p className="text-red-500 text-xs mt-1">{addressErrors.postalCode}</p>}
                      {pincodeLoading && <p className="text-xs text-gray-500 mt-1">Validating pincode...</p>}
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" value={addressForm.city} onChange={handleAddressChange} placeholder="City" disabled={pincodeLoading || pincodeFetched} />
                      {addressErrors.city && <p className="text-red-500 text-xs mt-1">{addressErrors.city}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select onValueChange={handleStateChange} value={addressForm.state} disabled={pincodeLoading || pincodeFetched}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {addressErrors.state && <p className="text-red-500 text-xs mt-1">{addressErrors.state}</p>}
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" name="country" value={addressForm.country} disabled />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="isDefault" name="isDefault" checked={addressForm.isDefault} onChange={handleDefaultChange} className="h-4 w-4" />
                    <Label htmlFor="isDefault">Set as default address</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isAddressLoading || pincodeLoading} className="flex-1">
                      {isAddressLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingAddressId ? "Update Address" : "Add Address"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetAddressForm} className="flex-1">Cancel</Button>
                  </div>
                </form>
              ) : (
                <div>
                  {addresses.length === 0 ? (
                    <p className="text-gray-600">No addresses saved. Click "Add New Address" to get started.</p>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address: Address) => (
                        <div
                          key={address._id}
                          className={`p-4 rounded-lg border flex justify-between items-start cursor-pointer transition-all ${selectedAddress?._id === address._id ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-gray-50"}`}
                          onClick={() => setSelectedAddress(address)}
                        >
                          <div>
                            <p className="font-medium">{address.name}</p>
                            <p className="text-xs text-gray-600">{address.phone}</p>
                            <p className="text-xs text-gray-600">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}</p>
                            <p className="text-xs text-gray-600">{address.city}, {address.state} - {address.postalCode}</p>
                            <p className="text-xs text-gray-600">{address.country}</p>
                            {address.isDefault && <Badge variant="secondary" className="mt-1 text-xs">Default</Badge>}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); handleEditAddress(address); }}><Edit className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); handleDeleteAddress(address._id); }} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Online Payment */}
                <button
                  type="button"
                  onClick={async () => {
                    // Always re-check online payment status on click
                    setOnlinePaymentLoading(true);
                    try {
                      const { data } = await axios.get('/api/settings/public');
                      const available = isOnlinePaymentAvailable(data.onlinePayment);
                      setOnlinePaymentSettings(data.onlinePayment);
                      setOnlinePaymentAvailable(available);
                      if (available) {
                        setPaymentMethod('online');
                        setShowOnlinePaymentUnavailable(false);
                      } else {
                        setShowOnlinePaymentUnavailable(true);
                      }
                    } catch (error) {
                      setShowOnlinePaymentUnavailable(true);
                    } finally {
                      setOnlinePaymentLoading(false);
                    }
                  }}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all focus:outline-none w-full
                    ${paymentMethod === 'online' ? 'border-emerald-500 bg-emerald-50 shadow' : 'border-gray-200 bg-white'}
                    ${!onlinePaymentAvailable || onlinePaymentLoading ? 'opacity-60 cursor-not-allowed' : 'hover:border-emerald-400'}
                  `}
                  disabled={onlinePaymentLoading}
                  aria-pressed={paymentMethod === 'online'}
                >
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="font-medium text-base">Online Payment</span>
                    <span className="text-xs text-gray-500 mt-1">Pay securely via Razorpay (UPI, Card, Netbanking, Wallets)</span>
                    {showOnlinePaymentUnavailable && (
                      <span className="text-xs text-red-600 flex items-center gap-1 mt-1"><XCircle className="w-4 h-4" /> Not available, try again later.</span>
                    )}
                  </div>
                  {paymentMethod === 'online' && <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />}
                </button>
                {/* COD */}
                <button
                  type="button"
                  onClick={() => codAvailable && !codLoading && setPaymentMethod('cod')}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all focus:outline-none w-full
                    ${paymentMethod === 'cod' ? 'border-yellow-500 bg-yellow-50 shadow' : 'border-gray-200 bg-white'}
                    ${!codAvailable || codLoading ? 'opacity-60 cursor-not-allowed' : 'hover:border-yellow-400'}
                  `}
                  disabled={!codAvailable || codLoading}
                  aria-pressed={paymentMethod === 'cod'}
                >
                  <span className="w-6 h-6 flex items-center justify-center text-yellow-600 text-xl font-bold">₹</span>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="font-medium text-base">Cash on Delivery</span>
                    {codLoading && <span className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Loader2 className="w-4 h-4 animate-spin" /> Checking availability...</span>}
                    {!codAvailable && !codLoading && (
                      <span className="text-xs text-red-600 flex items-center gap-1 mt-1"><XCircle className="w-4 h-4" /> Not Available</span>
                    )}
                    {codAvailable && codCharge > 0 && (
                      <span className="text-xs text-blue-700 flex items-center gap-1 mt-1">+₹{codCharge} COD charge</span>
                    )}
                  </div>
                  {paymentMethod === 'cod' && <CheckCircle className="w-5 h-5 text-yellow-500 ml-auto" />}
                </button>
              </div>
              {/* Info/Warnings */}
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <span className="text-xs text-gray-600">100% Secure Payments via Razorpay. We accept UPI, Cards, Netbanking, Wallets.</span>
              </div>
              {paymentMethod === 'online' && !onlinePaymentAvailable && !onlinePaymentLoading && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg mt-2">
                  <p className="text-sm text-red-700">Online payment is not available at this time. Please select another payment method.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Sticky Order Summary & Place Order */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 flex flex-col gap-6">
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <p className="text-gray-600">Your cart is empty.</p>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={`${item.id}-${item.color || ''}-${item.size || ''}`} className="flex items-center gap-4 border-b py-4">
                        <div className="w-12 h-12 flex-shrink-0 rounded bg-gray-100 border overflow-hidden">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{item.name}</div>
                          {item.color && (
                            <div className="text-sm text-gray-500">Color: {item.color}</div>
                          )}
                          {item.size && (
                            <div className="text-sm text-gray-500">Size: {item.size}</div>
                          )}
                          <div className="text-xs text-gray-600">{item.quantity} x ₹{item.price.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>
                        Discount
                        {discount === 0 && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="link" className="text-xs px-1 py-0 h-auto align-baseline">Apply Now</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-sm w-full">
                              <DialogHeader>
                                <DialogTitle>Apply Promotion Code</DialogTitle>
                              </DialogHeader>
                              <div className="flex gap-2 mb-2">
                                <Input placeholder="Enter promo code" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} />
                                <Button onClick={handleApplyPromo}>Apply</Button>
                              </div>
                              {promoError && <p className="text-red-500 text-sm mt-1">{promoError}</p>}
                              {discount > 0 && <p className="text-green-600 text-sm mt-1">Promo applied! -₹{discount.toFixed(2)}</p>}
                              <DialogFooter>
                                <Button variant="ghost" onClick={() => setPromoCode("")}>Clear</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </span>
                      {discount > 0 ? (
                        <span className="text-green-600">- ₹{discount.toFixed(2)}</span>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                    {paymentMethod === 'cod' && codCharge > 0 && (
                      <div className="flex justify-between">
                        <span>COD Charge</span>
                        <span>+ ₹{codCharge.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <span>Total</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">Place Order</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={handlePlaceOrder} disabled={orderButtonDisabled || isLoading || cartItems.length === 0 || !selectedAddress || (paymentMethod === 'cod' && !codAvailable)}>
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
