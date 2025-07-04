"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, ShoppingBag, Star, Heart, Settings, LogOut, Loader2, Trash2, Edit } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { useReviews } from "@/components/review-provider";
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
  }[];
}

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

export default function AccountPage() {
  const { state, logout } = useAuth();
  const { user, isAuthenticated, isLoading } = state;
  const { cartItems } = useCart();
  const { getUserReviews } = useReviews();
  const router = useRouter();

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
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
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeFetched, setPincodeFetched] = useState(false);

  // Order state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  // Indian states for dropdown
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  ];

  // Redirect based on loading status and authentication
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  // Fetch addresses on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAddresses();
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const response = await axios.get("/api/users/address", { withCredentials: true });
      if (response.data.success) {
        setAddresses(response.data.addresses);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch addresses." });
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const response = await axios.get("/api/users/orders", { withCredentials: true });
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch orders." });
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Validate pincode and auto-fill city/state via proxy
  const validateAndFetchPincode = async (pincode: string) => {
    if (!/^\d{6}$/.test(pincode)) {
      setAddressErrors((prev) => ({ ...prev, postalCode: "Enter a valid 6-digit postal code" }));
      return;
    }
    setPincodeLoading(true);
    try {
      const response = await axios.get(`/api/users/pincode/${pincode}`, { withCredentials: true });
      if (response.data[0].Status === "Success" && response.data[0].PostOffice) {
        const postOffice = response.data[0].PostOffice[0];
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
      setAddressErrors((prev) => ({ ...prev, postalCode: error.response?.data?.error || "Failed to validate pincode" }));
    } finally {
      setPincodeLoading(false);
    }
  };

  // Validate address form
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

  // Handle address form input changes
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

  // Handle state dropdown change
  const handleStateChange = (value: string) => {
    setAddressForm((prev) => ({ ...prev, state: value }));
    setAddressErrors((prev) => ({ ...prev, state: "" }));
  };

  // Handle isDefault checkbox change
  const handleDefaultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setAddressForm((prev) => ({ ...prev, isDefault: isChecked }));
    if (isChecked) {
      toast({ description: "This will unset other default addresses." });
    }
  };

  // Handle address form submission
  const handleAddressSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validateAddressForm();
    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }
    setIsAddressLoading(true);
    try {
      if (editingAddressId) {
        const response = await axios.put(`/api/users/address/${editingAddressId}`, addressForm, { withCredentials: true });
        if (response.data.success) {
          setAddresses((prev) =>
            prev.map((addr) => (addr._id === editingAddressId ? response.data.address : { ...addr, isDefault: addr._id === editingAddressId ? addressForm.isDefault : false }))
          );
          toast({ title: "Success", description: "Address updated successfully." });
        }
      } else {
        const response = await axios.post("/api/users/address", addressForm, { withCredentials: true });
        if (response.data.success) {
          setAddresses((prev) => [
            ...prev.map((addr) => ({ ...addr, isDefault: addressForm.isDefault ? false : addr.isDefault })),
            response.data.address,
          ]);
          toast({ title: "Success", description: "Address added successfully." });
        }
      }
      resetAddressForm();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "Failed to save address.",
      });
    } finally {
      setIsAddressLoading(false);
    }
  };

  // Handle edit address
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
    setPincodeFetched(true); // Prevent re-fetching pincode on edit
    setIsAddressFormOpen(true);
  };

  // Handle delete address
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    setIsAddressLoading(true);
    try {
      const response = await axios.delete(`/api/users/address/${addressId}`, { withCredentials: true });
      if (response.data.success) {
        setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));
        toast({ title: "Success", description: "Address deleted successfully." });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "Failed to delete address.",
      });
    } finally {
      setIsAddressLoading(false);
    }
  };

  // Reset address form
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

  // Show loading state while fetching user data
  if (isLoading || !user) {
    return (
      <div className="container-responsive py-16 text-center animate-fade-in">
        <Loader2 className="w-12 h-12 text-emerald-700 animate-spin mx-auto mb-4" />
        <p className="text-responsive-base text-gray-600">Loading user data...</p>
      </div>
    );
  }

  // Fetch user reviews based on user._id
  const userReviews = getUserReviews(user._id);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="container-responsive py-8 sm:py-12 lg:py-16 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-responsive-3xl font-bold text-gray-800 mb-2">My Account</h1>
          <p className="text-responsive-base text-gray-600">Welcome back, {user.name}!</p>
          {!user.emailVerified && (
            <Badge variant="destructive" className="mt-2 text-responsive-sm">
              Email Not Verified! Please check your email for the verification link.
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Profile Section */}
          <div className="md:col-span-1 animate-slide-up animation-delay-200">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-responsive-lg">{user.name}</h3>
                    <p className="text-responsive-sm text-gray-600">{user.email}</p>
                    <p className="text-responsive-sm text-gray-600">{user.phone}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="spacing-responsive-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-responsive-sm text-gray-600">Member since</span>
                    <span className="text-responsive-sm">
                      {user.createdAt ? new Date(user.createdAt).getFullYear() : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-responsive-sm text-gray-600">Reviews written</span>
                    <Badge variant="secondary" className="text-responsive-xs">
                      {/* {userReviews.length} */}0
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-responsive-sm text-gray-600">Cart items</span>
                    <Badge variant="secondary" className="text-responsive-xs">
                      {cartItems.length}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  {/* <Link href="/account/orders">
                    <Button variant="outline" className="w-full justify-start btn-responsive">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      My Orders
                    </Button>
                  </Link> */}
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <Button variant="outline" className="w-full mt-2 justify-start btn-responsive">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 btn-responsive"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions and Address Section */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Link href="/track">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-32 flex items-center group">
                  <CardContent className="spacing-responsive-sm flex items-center h-full">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <ShoppingBag className="w-6 h-6 text-blue-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-responsive-lg">My Orders</h3>
                        <p className="text-responsive-sm text-gray-600">View your order history</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/wishlist">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-32 flex items-center group">
                  <CardContent className="spacing-responsive-sm flex items-center h-full">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Heart className="w-6 h-6 text-red-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-responsive-lg">Wishlist</h3>
                        <p className="text-responsive-sm text-gray-600">Saved items</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Address Management Section */}
            <Card className="mt-6 animate-slide-up animation-delay-700 shadow-sm border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-responsive-xl">My Addresses</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="btn-responsive"
                  onClick={() => setIsAddressFormOpen(true)}
                >
                  Add New Address
                </Button>
              </CardHeader>
              <CardContent className="spacing-responsive-sm">
                {isAddressFormOpen && (
                  <form onSubmit={handleAddressSubmit} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Recipient Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={addressForm.name}
                          onChange={handleAddressChange}
                          placeholder="Enter recipient name"
                        />
                        {addressErrors.name && <p className="text-red-500 text-sm">{addressErrors.name}</p>}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={addressForm.phone}
                          onChange={handleAddressChange}
                          placeholder="Enter 10-digit phone number"
                        />
                        {addressErrors.phone && <p className="text-red-500 text-sm">{addressErrors.phone}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="addressLine1">Address Line 1</Label>
                      <Input
                        id="addressLine1"
                        name="addressLine1"
                        value={addressForm.addressLine1}
                        onChange={handleAddressChange}
                        placeholder="Flat, House no., Building"
                      />
                      {addressErrors.addressLine1 && <p className="text-red-500 text-sm">{addressErrors.addressLine1}</p>}
                    </div>
                    <div>
                      <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                      <Input
                        id="addressLine2"
                        name="addressLine2"
                        value={addressForm.addressLine2}
                        onChange={handleAddressChange}
                        placeholder="Apartment, suite, unit"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={addressForm.postalCode}
                          onChange={handleAddressChange}
                          placeholder="Enter 6-digit postal code"
                          disabled={pincodeLoading}
                        />
                        {addressErrors.postalCode && <p className="text-red-500 text-sm">{addressErrors.postalCode}</p>}
                        {pincodeLoading && <p className="text-sm text-gray-500">Validating pincode...</p>}
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={addressForm.city}
                          onChange={handleAddressChange}
                          placeholder="Enter city"
                          disabled={pincodeLoading || pincodeFetched}
                        />
                        {addressErrors.city && <p className="text-red-500 text-sm">{addressErrors.city}</p>}
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
                      {addressErrors.state && <p className="text-red-500 text-sm">{addressErrors.state}</p>}
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={addressForm.country}
                        disabled
                        placeholder="India"
                      />
                      {addressErrors.country && <p className="text-red-500 text-sm">{addressErrors.country}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        name="isDefault"
                        checked={addressForm.isDefault}
                        onChange={handleDefaultChange}
                      />
                      <Label htmlFor="isDefault">Set as default address</Label>
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" disabled={isAddressLoading || pincodeLoading} className="flex-1">
                        {isAddressLoading ? <Loader2 className="animate-spin" /> : editingAddressId ? "Update Address" : "Add Address"}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetAddressForm} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <p className="text-responsive-sm text-gray-600">No addresses saved yet.</p>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className="p-4 bg-crem rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center border-2 border-orange-800 shadow-sm"
                      >
                        <div className="mb-2 sm:mb-0">
                          <p className="text-responsive-sm font-medium">{address.name}</p>
                          <p className="text-responsive-sm text-gray-600">{address.phone}</p>
                          <p className="text-responsive-sm text-gray-600">
                            {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}
                          </p>
                          <p className="text-responsive-sm text-gray-600">
                            {address.city}, {address.state} - {address.postalCode}
                          </p>
                          <p className="text-responsive-sm text-gray-600">{address.country}</p>
                          {address.isDefault && (
                            <Badge variant="secondary" className="mt-1">Default</Badge>
                          )}
                        </div>
                        <div className="flex space-x-2 mt-2 sm:mt-0">
                          <Button size="icon" variant="outline" onClick={() => handleEditAddress(address)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="destructive" onClick={() => handleDeleteAddress(address._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
