"use client"

import { useState, useEffect, useCallback,useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  BarChart,
  DollarSign,
  FileText,
  Megaphone,
  ListTree,
  Search,
  Plug,
  Palette,
  ScrollText,
  HardDrive,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Save,
  X,
  Loader2,
  RefreshCw,
  Mail,
  ShieldCheck,
  HelpCircle,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"
import ProductForm from "./products/ProductForm"
import ProductList from "./products/ProductList"
import AnnouncementForm from "./announcements/AnnouncementForm"
import AnnouncementList from "./announcements/AnnouncementList"
import CustomerList from "./customers/CustomerList"
import BrandIdentity from "./brand/BrandIdentity";
import NextImage from "next/image"
import OrderList from "./orders/OrderList"
import AdminReplacementManagement from "@/components/admin-replacement-management"
import CodStatusCard from "@/components/cod-status-card"
import dynamic from "next/dynamic";
import ContentEditor from "./content/ContentEditor";
import AdminSettings from "./settings/AdminSettings";
import BadgeManagement from "./settings/BadgeManagement";
import InventoryList from "./inventory/InventoryList";

const NewsletterAdminPage = dynamic(() => import("./newsletter/page"), { ssr: false });
const PromotionPage = dynamic(() => import("./promotions/page"), { ssr: false });
const CodManagement = dynamic(() => import("./settings/CodManagement"), { ssr: false });

const API_BASE_URL = "https://arister.onrender.com/api"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://arister.onrender.com/api";

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  discountPercentage?: number | null;
  stock: number;
  category: string;
  status?: string;
  description?: string;
  imageUrl?: string[];
  material?: string;
  weight?: string;
  dimensions?: string;
  care?: string;
  origin?: string;
  careInstructionsList?: string[];
  gender?: string;
  sizes?: string[];
  colors?: string[];
  images?: { url: string; publicId: string }[];
  isFeatured?: boolean;
  badges?: string[];
  replacementPolicy?: {
    days: number;
    policy: string;
  };
  colorImages?: { color: string; images: { url: string; publicId: string }[] }[];
}

// interface Order {
//   id: string;
//   customer: string;
//   total: number;
//   status: string;
//   date: string;
// }



interface Order {
  _id: string;
  orderId: string;
  user: OrderUser;
  status: string;
  address: OrderAddress;
  items: OrderItem[];
  total: number;
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

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
  sku?: string;
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
interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  status: string;
  phone?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

interface CategoryImage {
  category: string
  contentType: 'images' | 'video'
  imageUrls?: { url: string; publicId: string }[]
  videoUrl?: string
  videoPublicId?: string
}

interface Promotion {
  id: number;
  code: string;
  discount: number;
  type: string;
  status: string;
  uses: number;
  description?: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  active: boolean;
  created: string;
}

interface Category {
  id: string;
  name: string;
}

const initialProductFormState: Product = {
  id: '',
  name: '',
  price: 0,
  salePrice: null,
  discountPercentage: null,
  stock: 0,
  category: '',
  status: 'Active',
  description: '',
  imageUrl: [],
  material: '',
  weight: '',
  dimensions: '',
  care: '',
  origin: '',
  careInstructionsList: [],
  gender: '',
  sizes: [],
  colors: [],
  isFeatured: false,
  badges: [],
  replacementPolicy: {
    days: 7,
    policy: 'Replace within 7 days for manufacturing defects. Product must be unused and in original packaging.'
  },
};

const initialAnnouncementFormState: Announcement = {
  id: '',
  title: '',
  message: '',
  type: 'info',
  active: true,
  created: new Date().toISOString(),
};

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "customers", label: "Customers", icon: Users },
  { id: "replacements", label: "Replacements", icon: RefreshCw },
  { id: "inventory", label: "Inventory", icon: ListTree },
  { id: "promotions", label: "Promotions", icon: Megaphone },
  { id: "announcements", label: "Announcements", icon: ScrollText },
  { id: "newsletter", label: "Newsletter Subscribers", icon: Mail },
  { id: "contact", label: "Contact Management", icon: Mail },
  { id: "privacy-policy", label: "Privacy Policy", icon: ShieldCheck },
  { id: "terms-of-service", label: "Terms of Service", icon: FileText },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "appearance", label: "Appearance", icon: HardDrive },
  { id: "brand", label: "Brand Identity", icon: Palette },
  { id: "logs", label: "Logs", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function AdminPage() {
  const { state, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [activeSection, setActiveSection] = useState("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProductFormOpen, setIsProductFormOpen] = useState(false)
  const [isAddMode, setIsAddMode] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [isProductsLoading, setIsProductsLoading] = useState(true)
  const [productError, setProductError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isCustomersLoading, setIsCustomersLoading] = useState(true)
  const [customerError, setCustomerError] = useState<string | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(true)
  const [announcementError, setAnnouncementError] = useState<string | null>(null)
  const [isAnnouncementFormOpen, setIsAnnouncementFormOpen] = useState(false)
  const [announcementFormState, setAnnouncementFormState] = useState<Announcement>(initialAnnouncementFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Product | Announcement | null>(null)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [formState, setFormState] = useState<Product>(initialProductFormState)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isCustomerViewOpen, setIsCustomerViewOpen] = useState(false)
  // const [categoryImages, setCategoryImages] = useState([
  //   { category: 'hero', imageUrl: '' },
  //   { category: 'new-arrivals', imageUrl: '' },
  //   { category: 'men', imageUrl: '' },
  //   { category: 'women', imageUrl: '' },
  // ]);
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([
    { category: 'hero', contentType: 'images', imageUrls: [], videoUrl: '', videoPublicId: '' },
    { category: 'new-arrivals', contentType: 'images', imageUrls: [], videoUrl: '', videoPublicId: '' },
    { category: 'men', contentType: 'images', imageUrls: [], videoUrl: '', videoPublicId: '' },
    { category: 'women', contentType: 'images', imageUrls: [], videoUrl: '', videoPublicId: '' },
  ])
  const [heroContentType, setHeroContentType] = useState<'images' | 'video'>('images')
  const slideshowRef = useRef<NodeJS.Timeout | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  
  
  const [isLoading, setIsLoading] = useState({
    products: false,
    users: false,
    categories: false,
    announcements: false,
    categoryImages: false,
    orders: false,
  });
  const [error, setError] = useState({
    products: null as string | null,
    users: null as string | null,
    categories: null as string | null,
    announcements: null as string | null,
    categoryImages: null as string | null,
    orders: null as string | null,
  });
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [isOrdersLoading, setIsOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState("");
  const [contentData, setContentData] = useState<any>(null);
  const [currentContentSlug, setCurrentContentSlug] = useState<string | null>(null);
 

 
  // useEffect(() => {
  //   if (!state.isLoading && !state.user) {
  //     router.push("/login")
  //   }
  // }, [state.user, state.isLoading, router, toast])


  useEffect(() => {
    if (!state.isLoading) {
      if (!state.user) {
        console.log("No user logged in, redirecting to login");
        router.push("/login");
      } else if (state.user.role !== "admin") {
        console.log("Non-admin user attempted access:", state.user);
        toast({
          title: "Access Denied",
          description: "Only admin users can access the admin panel.",
          variant: "destructive",
        });
        router.push("/");
      }
    }
  }, [state.isLoading, state.user, router, toast]);

  const handleAppearanceSettingsChange = useCallback((newSettings: AppearanceSettingsType) => {
    setAppearanceSettings(newSettings);
    // Apply settings to document (e.g., update CSS variables)
    document.documentElement.style.setProperty("--primary-color", newSettings.primaryColor);
    document.documentElement.className = newSettings.theme;
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsProductsLoading(true)
    setProductError(null)
    try {
      const response = await axios.get<Product[]>(`${API_BASE_URL}/products`)
      const productsData = response.data.map(p => ({
        ...p,
        id: p.id || (p as any)._id,
        imageUrl: p.images?.map((img: any) => img.url) || []
      }))
      setProducts(productsData)
    } catch (err: any) {
      console.error("Error fetching products:", err)
      setProductError(err.message || "Failed to fetch products")
      toast({
        title: "Error",
        description: "Failed to fetch products. Please ensure your backend is running.",
        variant: "destructive",
      })
    } finally {
      setIsProductsLoading(false)
    }
  }, [toast])

  const fetchCategories = useCallback(async () => {
    setIsCategoriesLoading(true)
    setCategoryError(null)
    try {
      const response = await axios.get<Category[]>(`${API_BASE_URL}/categories`)
      setCategories(response.data)
    } catch (err: any) {
      console.error("Error fetching categories:", err)
      setCategoryError(err.message || "Failed to fetch categories")
      setCategories([
        { id: "mock-cat-1", name: "Electronics" },
        { id: "mock-cat-2", name: "Clothing" },
        { id: "mock-cat-3", name: "Home Goods" },
        { id: "mock-cat-4", name: "Books" },
      ])
      toast({
        title: "Info",
        description: "Could not fetch categories from backend. Using dummy categories for now.",
        variant: "default",
      })
    } finally {
      setIsCategoriesLoading(false)
    }
  }, [toast])

  // const fetchCategoryImages = useCallback(async () => {
  //   setIsLoading((prev) => ({ ...prev, categoryImages: true }));
  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/category-images`);
  //     const fetchedImages = response.data;
  //     setCategoryImages((prev) =>
  //       prev.map((cat) => {
  //         const fetched = fetchedImages.find((img: any) => img.category === cat.category);
  //         return fetched ? { category: cat.category, imageUrl: fetched.imageUrl } : cat;
  //       })
  //     );
  //     setError((prev) => ({ ...prev, categoryImages: null }));
  //   } catch (err: any) {
  //     setError((prev) => ({ ...prev, categoryImages: err.message }));
  //   } finally {
  //     setIsLoading((prev) => ({ ...prev, categoryImages: false }));
  //   }
  // }, []);
  

  const fetchCategoryImages = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, categoryImages: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/category-images`, {
        withCredentials: true,
      });
      const fetchedImages = response.data;
      console.log('Fetched category images:', fetchedImages);
      setCategoryImages((prev) =>
        prev.map((cat) => {
          const fetched = fetchedImages.find((img: any) => img.category === cat.category);
          return fetched
            ? {
                category: cat.category,
                contentType: fetched.contentType || 'images',
                imageUrls: fetched.imageUrls?.length
                  ? fetched.imageUrls.map((img: { url: string; publicId: string }) => ({
                      url: img.url,
                      publicId: img.publicId || img.url,
                    }))
                  : [{ url: cat.category === 'hero' ? '/placeholder.svg?height=1080&width=1920' : '/placeholder.svg?height=600&width=800', publicId: '' }],
                videoUrl: fetched.videoUrl || '',
                videoPublicId: fetched.videoPublicId || '',
              }
            : cat;
        })
      );
      setError((prev) => ({ ...prev, categoryImages: null }));
      const hero = fetchedImages.find((img: any) => img.category === 'hero');
      if (hero) {
        console.log('Hero section data:', hero);
        setHeroContentType(hero.contentType || 'images');
      }
    } catch (err: any) {
      console.error('Error fetching category images:', err);
      setError((prev) => ({ ...prev, categoryImages: err.message }));
      toast({
        title: 'Error',
        description: 'Failed to fetch category images: ' + (err.response?.data?.message || err.message),
        variant: 'destructive',
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, categoryImages: false }));
    }
  }, [toast]);

  useEffect(() => {
    const hero = categoryImages.find(cat => cat.category === 'hero')
    if (hero?.contentType === 'images' && hero.imageUrls && hero.imageUrls.length > 1) {
      slideshowRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % hero.imageUrls!.length)
      }, 5000)
      return () => {
        if (slideshowRef.current) {
          clearInterval(slideshowRef.current)
        }
      }
    }
  }, [categoryImages])
  const fetchAnnouncements = useCallback(async () => {
    setIsAnnouncementsLoading(true)
    setAnnouncementError(null)
    try {
      const response = await axios.get<Announcement[]>(`${API_BASE_URL}/announcements`)
      const announcementsData = response.data.map(a => ({
        ...a,
        id: a.id || (a as any)._id.toString(),
        created: new Date(a.created).toLocaleDateString(),
      }))
      setAnnouncements(announcementsData)
    } catch (err: any) {
      console.error("Error fetching announcements:", err)
      setAnnouncementError(err.message || "Failed to fetch announcements")
      toast({
        title: "Error",
        description: "Failed to fetch announcements.",
        variant: "destructive",
      })
    } finally {
      setIsAnnouncementsLoading(false)
    }
  }, [toast])

  const fetchCustomers = useCallback(async () => {
    setIsCustomersLoading(true)
    setCustomerError(null)
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        withCredentials: true,
      })
      console.log("API Response:", response.data)
      let users = response.data;
      // Ensure response.data is an array
      if (!Array.isArray(users)) {
        if (users?.users && Array.isArray(users.users)) {
          users = users.users; // Handle nested { users: [...] }
        } else {
          users = []; // Fallback to empty array
        }
      }
      const customersData = users.map((user: any) => ({
        id: user._id || user.id,
        name: user.name || "Unknown",
        email: user.email || "No email",
        phone: user.phone || "No phone",
        orders: user.orders || 0,
        spent: user.spent || 0,
        status: user.emailVerified ? "Verified" : "Unverified",
        emailVerified: user.emailVerified || false,
        createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown",
      }))
      setCustomers(customersData)
    } catch (err: any) {
      console.error("Error fetching customers:", err)
      setCustomerError(err.message || "Failed to fetch customers")
      toast({
        title: "Error",
        description: "Failed to fetch customers. Please ensure your backend is running.",
        variant: "destructive",
      })
    } finally {
      setIsCustomersLoading(false)
    }
  }, [toast])

  // const fetchOrders = useCallback(async () => {
  //   setIsOrdersLoading(true)
  //   setOrdersError(null)
  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/orders/admin/all`, {
  //       withCredentials: true
  //     })
  //     console.log("Orders API Response:", response.data)
  //     let ordersData = response.data.orders || [];
  //     const formattedOrders = ordersData.map((order: any) => ({
  //       id: order._id || order.id,
  //       customer: order.user?.name || "Unknown Customer",
  //       total: order.total || 0,
  //       status: order.status || "pending",
  //       date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Unknown",
  //     }))
  //     setOrders(formattedOrders)
      
  //     // Calculate total revenue
  //     const revenue = formattedOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
  //     setTotalRevenue(revenue)
  //   } catch (err: any) {
  //     console.error("Error fetching orders:", err)
  //     setOrdersError(err.message || "Failed to fetch orders")
  //     toast({
  //       title: "Error",
  //       description: "Failed to fetch orders. Please ensure your backend is running.",
  //       variant: "destructive",
  //     })
  //   } finally {
  //     setIsOrdersLoading(false)
  //   }
  // }, [toast])

  const fetchOrders = useCallback(async () => {
    setIsOrdersLoading(true);
    setOrdersError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/admin/all`, {
        withCredentials: true,
      });
      console.log("Orders API Response:", response.data);
      let ordersData = response.data.orders || [];
      const formattedOrders = ordersData.map((order: any) => ({
        _id: order._id || order.id,
        orderId: order.orderId || order._id,
        user: {
          _id: order.user?._id || "",
          name: order.user?.name || "Unknown Customer",
          email: order.user?.email || "No email",
          phone: order.user?.phone || "",
        },
        status: order.status || "pending",
        address: {
          name: order.address?.name || "Unknown",
          phone: order.address?.phone || "No phone",
          addressLine1: order.address?.addressLine1 || "",
          addressLine2: order.address?.addressLine2 || "",
          city: order.address?.city || "",
          state: order.address?.state || "",
          postalCode: order.address?.postalCode || "",
          country: order.address?.country || "",
        },
        items: order.items || [],
        total: order.total || 0,
        payment: {
          method: order.payment?.method || "Unknown",
          paymentId: order.payment?.paymentId || "",
          orderId: order.payment?.orderId || "",
          status: order.payment?.status || "pending",
        },
        shipping: {
          courier: order.shipping?.courier || "",
          status: order.shipping?.status || "",
          shipmentId: order.shipping?.shipmentId || "",
          shiprocketOrderId: order.shipping?.shiprocketOrderId || "",
          awbCode: order.shipping?.awbCode || "",
          pickupStatus: order.shipping?.pickupStatus || "",
          manifestUrl: order.shipping?.manifestUrl || "",
          labelUrl: order.shipping?.labelUrl || "",
          invoiceUrl: order.shipping?.invoiceUrl || "",
          tracking: order.shipping?.tracking || {},
        },
        cancellationReason: order.cancellationReason || "",
        cancelledAt: order.cancelledAt || "",
        cancellationRequested: order.cancellationRequested || false,
        cancellationRequestedAt: order.cancellationRequestedAt || "",
        adminCancellationReason: order.adminCancellationReason || "",
        createdAt: order.createdAt || new Date().toISOString(),
      }));
      setOrders(formattedOrders);
  
      // Calculate total revenue
      const revenue = formattedOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
      setTotalRevenue(revenue);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setOrdersError(err.message || "Failed to fetch orders");
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please ensure your backend is running.",
        variant: "destructive",
      });
    } finally {
      setIsOrdersLoading(false);
    }
  }, [toast]);
  useEffect(() => {
    if (state.user && state.user.role === "admin") {
      fetchProducts()
      fetchCategories()
      fetchAnnouncements()
      fetchCustomers()
      fetchOrders()
      fetchCategoryImages()
    }
  }, [state.user, fetchProducts, fetchCategories, fetchAnnouncements, fetchCustomers, fetchOrders, fetchCategoryImages])

  // Add a new useEffect to update customers with order info
  type CustomerWithOrderInfo = Customer & { orders: number; spent: number };

  useEffect(() => {
    // Only run if both customers and orders are loaded
    if (!isCustomersLoading && !isOrdersLoading && customers.length > 0) {
      // Create a map of customerId to {orders, spent}
      const orderStats: Record<string, { orders: number; spent: number }> = {};
      orders.forEach(order => {
        const userId = order.user?._id;
        if (!userId) return;
        if (!orderStats[userId]) {
          orderStats[userId] = { orders: 0, spent: 0 };
        }
        orderStats[userId].orders += 1;
        orderStats[userId].spent += order.total || 0;
      });
      // Update customers with calculated order info
      setCustomers(prevCustomers =>
        prevCustomers.map(c => ({
          ...c,
          orders: orderStats[c.id]?.orders || 0,
          spent: orderStats[c.id]?.spent || 0,
        }))
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCustomersLoading, isOrdersLoading, orders]);

  


  const handleAddProductClick = useCallback(() => {
    setFormState(initialProductFormState)
    setIsAddMode(true)
    setIsProductFormOpen(true)
  }, [])

  const handleEditProduct = useCallback(async (id: string) => {
    setIsSubmitting(true)
    try {
      const response = await axios.get<Product>(`${API_BASE_URL}/products/${id}`)
      const productToEdit = response.data
      productToEdit.id = productToEdit.id || (productToEdit as any)._id
      productToEdit.careInstructionsList = Array.isArray(productToEdit.careInstructionsList)
        ? productToEdit.careInstructionsList
        : []
      productToEdit.sizes = Array.isArray(productToEdit.sizes)
        ? productToEdit.sizes
        : []
      productToEdit.colors = Array.isArray(productToEdit.colors)
        ? productToEdit.colors
        : []
      productToEdit.salePrice = productToEdit.salePrice === undefined || productToEdit.salePrice === null ? null : productToEdit.salePrice
      productToEdit.discountPercentage = productToEdit.discountPercentage === undefined || productToEdit.discountPercentage === null ? null : productToEdit.discountPercentage
      productToEdit.imageUrl = productToEdit.images?.map((img: any) => img.url) || []
      productToEdit.colorImages = productToEdit.colorImages || [];
      productToEdit.colors = productToEdit.colors || [];
      setFormState(productToEdit)
      setIsAddMode(false)
      setIsProductFormOpen(true)
    } catch (err: any) {
      console.error("Error fetching product for edit:", err)
      toast({
        title: "Error",
        description: "Failed to load product for editing. " + (err.response?.data?.message || err.message),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [toast])

  const handleAddAnnouncementClick = useCallback(() => {
    setAnnouncementFormState(initialAnnouncementFormState)
    setIsAddMode(true)
    setIsAnnouncementFormOpen(true)
  }, [])

  const handleEditAnnouncement = useCallback(async (id: string) => {
    setIsSubmitting(true)
    try {
      const response = await axios.get<Announcement>(`${API_BASE_URL}/announcements/${id}`)
      const announcementToEdit = {
        ...response.data,
        id: response.data.id || (response.data as any)._id.toString(),
        created: new Date(response.data.created).toISOString(),
      }
      setAnnouncementFormState(announcementToEdit)
      setIsAddMode(false)
      setIsAnnouncementFormOpen(true)
    } catch (err: any) {
      console.error("Error fetching announcement:", err)
      toast({
        title: "Error",
        description: "Failed to load announcement for editing.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [toast])

  const handleDeleteConfirmClick = useCallback((item: Product | Announcement) => {
    console.log("Setting item to delete:", item);
    setItemToDelete(item);
    setIsDeleteAlertOpen(true);
  }, []);


  const handleDeleteItem = useCallback(async () => {
    if (!itemToDelete || typeof itemToDelete !== 'object') {
      console.error("Invalid itemToDelete:", itemToDelete);
      toast({
        title: "Error",
        description: "Invalid item selected for deletion.",
        variant: "destructive",
      });
      setIsDeleteAlertOpen(false);
      setItemToDelete(null);
      return;
    }
    try {
      if ('name' in itemToDelete) {
        console.log("Deleting product with ID:", itemToDelete.id, "Token:", state.token ? "Token present" : "No token");
        await axios.delete(`${API_BASE_URL}/products/${itemToDelete.id}`, {
          withCredentials: true,
        });
        setProducts(prev => prev.filter(p => p.id !== itemToDelete.id));
        toast({
          title: "Success",
          description: `Product "${itemToDelete.name}" successfully deleted.`,
        });
      } else {
        console.log("Deleting announcement with ID:", itemToDelete.id, "Token:", state.token ? "Token present" : "No token");
        await axios.delete(`${API_BASE_URL}/announcements/${itemToDelete.id}`, {
          withCredentials: true,
        });
        setAnnouncements(prev => prev.filter(a => a.id !== itemToDelete.id));
        toast({
          title: "Success",
          description: `Announcement "${itemToDelete.title}" deleted.`,
        });
      }
    } catch (err: any) {
      console.error("Error deleting item:", err.response?.data || err.message);
      toast({
        title: "Error",
        description: `Failed to delete ${'name' in itemToDelete ? 'product' : 'announcement'}: ${err.response?.data?.message || err.message}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleteAlertOpen(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, toast, state.token]);

  const handleUpdate = useCallback(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleViewCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer)
    setIsCustomerViewOpen(true)
  }, [])

  const handleEditCustomer = useCallback(async (customer: Customer) => {
    setIsSubmitting(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${customer.id}`, {
        withCredentials: true,
      })
      const userToEdit = {
        id: response.data._id.toString(),
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
        emailVerified: response.data.emailVerified,
        status: response.data.emailVerified ? "Verified" : "Unverified",
        orders: 0,
        spent: 0,
        createdAt: new Date(response.data.createdAt).toLocaleDateString(),
      }
      setSelectedCustomer(userToEdit)
      setIsCustomerViewOpen(true)
      toast({
        title: "Info",
        description: "Edit form is a placeholder. Update functionality not yet implemented.",
        variant: "default",
      })
    } catch (err: any) {
      console.error("Error fetching user for edit:", err)
      toast({
        title: "Error",
        description: "Failed to load user for editing.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [toast])

  const handleProductFormSubmit = useCallback(
    async (
      e: React.FormEvent,
      colorImages: { color: string; images: File[] }[],
      newMainImages: File[] = [],
      variantsFromForm: { color: string; size?: string; stock: number }[]
    ) => {
      e.preventDefault();
      setIsSubmitting(true);
      const formData = new FormData();
      for (const key in formState) {
        const value = formState[key as keyof Product];
        if (key === 'replacementPolicy') {
          if (value && typeof value === 'object') {
            const replacementPolicy = value as { days: number; policy: string };
            formData.append('replacementPolicy[days]', String(replacementPolicy.days));
            formData.append('replacementPolicy[policy]', replacementPolicy.policy);
          }
        } else if (key === 'imageUrl' && Array.isArray(value)) {
          // Always send existing images as objects with { url, publicId }
          const existingImagesObj = value.map(url => ({
            url,
            publicId: getPublicIdFromUrl(url)
          }));
          formData.append('existingImages', JSON.stringify(existingImagesObj));
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            value.forEach(item => {
              if (typeof item === 'string' || typeof item === 'number') {
                formData.append(`${key}[]`, String(item));
              }
            });
          }
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        } else if (value === null) {
          if (key === 'salePrice' || key === 'discountPercentage') {
            formData.append(key, '');
          }
        }
      }
      // Prepare colorImages JSON and append only new files
      const isColorImageObj = (img: any): img is { url: string; publicId: string } => {
        return img && typeof img === 'object' && typeof img.url === 'string' && typeof img.publicId === 'string';
      };
      const colorImagesJson = colorImages.map(({ color, images }) => ({
        color,
        images: images.map((img) => {
          if (img instanceof File) {
            return img.name;
          } else if (isColorImageObj(img)) {
            return { url: img.url, publicId: img.publicId };
          }
          return null;
        }).filter(Boolean),
      }));
      formData.append('colorImages', JSON.stringify(colorImagesJson));
      colorImages.forEach(({ images }) => {
        images.forEach((img) => {
          if (img instanceof File) {
            formData.append('colorImages', img, img.name);
          }
        });
      });
      // No main images handling - only color-specific images
      // if (newMainImages && newMainImages.length > 0) {
      //   newMainImages.forEach((file) => {
      //     formData.append('images', file, file.name);
      //   });
      // }
      // Add variants as JSON string to FormData (from ProductForm)
      if (variantsFromForm && Array.isArray(variantsFromForm)) {
        console.log('DEBUG: variantsFromForm before submit:', variantsFromForm);
        formData.append('variants', JSON.stringify(variantsFromForm));
      }
      try {
        let response: any;
        if (isAddMode) {
          response = await axios.post(`${API_BASE_URL}/products`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          setProducts((prevProducts) => [
            ...prevProducts,
            {
              ...response.data.product,
              id: response.data.product._id || response.data.product.id,
              imageUrl: response.data.product.images?.map((img: any) => img.url) || [],
            },
          ]);
          toast({
            title: 'Success',
            description: 'Product successfully added.',
          });
        } else {
          response = await axios.put(`${API_BASE_URL}/products/${formState.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          setProducts((prevProducts) =>
            prevProducts.map((p) =>
              p.id === formState.id
                ? {
                    ...response.data.product,
                    id: response.data.product._id || response.data.product.id,
                    imageUrl: response.data.product.images?.map((img: any) => img.url) || [],
                  }
                : p
            )
          );
          toast({
            title: 'Success',
            description: 'Product successfully updated.',
          });
        }
        setIsProductFormOpen(false);
        setFormState(initialProductFormState);
      } catch (err: any) {
        console.error('Error submitting product:', err.response?.data || err.message);
        toast({
          title: 'Error',
          description: 'Failed to save product. ' + (err.response?.data?.message || err.message),
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState, isAddMode, toast]
  );

  const handleAnnouncementFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      try {
        let response
        if (isAddMode) {
          response = await axios.post(`${API_BASE_URL}/announcements`, announcementFormState)
          setAnnouncements(prev => [
            ...prev,
            {
              ...response.data,
              id: response.data._id || response.data.id.toString(),
              created: new Date(response.data.created).toLocaleDateString(),
            },
          ])
          toast({
            title: "Success",
            description: "Announcement added.",
          })
        } else {
          response = await axios.put(
            `${API_BASE_URL}/announcements/${announcementFormState.id}`,
            announcementFormState
          )
          setAnnouncements(prev => prev.map(a =>
            a.id === announcementFormState.id
              ? {
                  ...response.data,
                  id: response.data._id || response.data.id.toString(),
                  created: new Date(response.data.created).toLocaleDateString(),
                }
              : a
          ))
          toast({
            title: "Success",
            description: "Announcement updated.",
          })
        }
        setIsAnnouncementFormOpen(false)
        setAnnouncementFormState(initialAnnouncementFormState)
      } catch (err: any) {
        console.error("Error submitting announcement:", err)
        toast({
          title: "Error",
          description: "Failed to save announcement.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [announcementFormState, isAddMode, toast]
  )

  const handleAddNewCategory = useCallback(async (category: string) => {
    try {
      const response = await axios.post<Category>(`${API_BASE_URL}/categories`, { name: category })
      setCategories(prev => [...prev, response.data])
      toast({
        title: "Success",
        description: `Category "${category}" added.`,
      })
    } catch (err: any) {
      console.error("Error adding new category:", err)
      toast({
        title: "Error",
        description: "Failed to add new category. " + (err.response?.data?.message || err.message),
        variant: "destructive",
      })
      setCategories(prev => [...prev, { id: `mock-${Date.now()}`, name: category }])
    }
  }, [toast])

  // Helper to load content by slug
  const loadContent = async (slug: string) => {
    setContentLoading(true);
    setContentError("");
    try {
      const res = await fetch(`${API_URL}/content-pages/slug/${slug}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setContentData(data);
    } catch (err) {
      setContentError("Content not found.");
      setContentData(null);
    }
    setContentLoading(false);
  };

  // Helper to save content by slug
  const saveContent = async (slug: string, data: any) => {
    setContentLoading(true);
    setContentError("");
    try {
      // If contentData exists, update; else, create
      if (contentData && contentData._id) {
        await fetch(`${API_URL}/content-pages/${contentData._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify(data),
        });
      } else {
        await fetch(`${API_URL}/content-pages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({ ...data, slug }),
        });
      }
      await loadContent(slug);
    } catch (err) {
      setContentError("Failed to save content.");
    }
    setContentLoading(false);
  };

  const renderContent = useCallback(() => {
    // if (state.isLoading) {
    //   return (
    //     <div className="flex justify-center items-center h-full min-h-[calc(100vh-200px)]">
    //       <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
    //       <span className="ml-3 text-lg text-emerald-600">Loading admin panel...</span>
    //     </div>
    //   )
    // }

    // if (!state.user) return null

    if (state.isLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <span className="ml-3 text-lg text-emerald-600">Checking authentication...</span>
        </div>
      );
    }
    
    if (!state.user || state.user.role !== "admin") {
      return null; // Prevent rendering until redirected
    }

    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="animate-fade-in">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-gray-500">Currently in store</p>
                </CardContent>
              </Card>
              <Card className="animate-fade-in animation-delay-100">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                  <ListTree className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{categories.length}</div>
                  <p className="text-xs text-gray-500">Various categories</p>
                </CardContent>
              </Card>
              <Card className="animate-fade-in animation-delay-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isOrdersLoading ? "..." : orders.length}</div>
                  <p className="text-xs text-gray-500">{isOrdersLoading ? "Loading..." : "All time orders"}</p>
                </CardContent>
              </Card>
              <Card className="animate-fade-in animation-delay-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{isOrdersLoading ? "..." : totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">{isOrdersLoading ? "Loading..." : "All time revenue"}</p>
                </CardContent>
              </Card>
              <Card className="animate-fade-in animation-delay-400">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customers.length}</div>
                  <p className="text-xs text-gray-500">Registered users</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <CodStatusCard onOpenSettings={() => setActiveSection("settings")} />
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button onClick={handleAddProductClick} className="flex items-center">
                      <Plus className="h-5 w-5 mr-2" /> Add New Product
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "products":
        return (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Products</h3>
              <Button onClick={handleAddProductClick}>
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </div>
            {isProductsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="mr-2 h-8 w-8 animate-spin text-gray-500" />
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : productError ? (
              <div className="text-center text-red-500 py-8">
                <p className="mb-2">Error loading products: {productError}</p>
                <Button onClick={fetchProducts}>Try Reloading Products</Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center text-gray-600 py-8">No products found. Click "Add Product" to create a new one!</div>
            ) : (
              <ProductList
                products={products}
                onEdit={handleEditProduct}
                onDelete={handleDeleteConfirmClick}
                onUpdate={handleUpdate}
              />
            )}
            <Dialog open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
              <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>{isAddMode ? "Add New Product" : "Edit Product"}</DialogTitle>
                  <DialogDescription>
                    {isAddMode ? "Fill in details to add a new product." : "Edit the product details."}
                  </DialogDescription>
                </DialogHeader>
                <ProductForm
                  onSubmit={handleProductFormSubmit}
                  onCancel={() => {
                    setIsProductFormOpen(false)
                    setFormState(initialProductFormState)
                  }}
                  formState={formState}
                  setFormState={setFormState}
                  isSubmitting={isSubmitting}
                  categories={categories}
                  onAddNewCategory={handleAddNewCategory}
                />
              </DialogContent>
            </Dialog>
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the{' '}
                    {'name' in (itemToDelete || {}) ? `product "${itemToDelete?.name}"` : `announcement "${itemToDelete?.title}"`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsDeleteAlertOpen(false)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteItem}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )

      case "orders":
        return (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Order Management</h3>
              <Button 
                variant="outline" 
                onClick={fetchOrders}
                disabled={isLoading.orders}
                className="btn-responsive"
              >
                {isLoading.orders ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh Orders
              </Button>
            </div>
            {isLoading.orders ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="mr-2 h-8 w-8 animate-spin text-gray-500" />
                <p className="text-gray-500">Loading orders...</p>
              </div>
            ) : error.orders ? (
              <div className="text-center text-red-500 py-8">
                <p className="mb-2">Error loading orders: {error.orders}</p>
                <Button onClick={fetchOrders}>Try Reloading Orders</Button>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center text-gray-600 py-8">No orders found.</div>
            ) : (
              <OrderList
                orders={orders}
                onUpdate={fetchOrders}
              />
            )}
          </div>
        )

      case "customers":
        return (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">Customer Management</h3>
              <Button variant="outline" disabled>
                <Plus className="h-4 w-4 mr-2" /> Add Customer (Placeholder)
              </Button>
            </div>
            {isCustomersLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="mr-2 h-8 w-8 animate-spin text-gray-600" />
                <p className="text-gray-600">Loading customers...</p>
              </div>
            ) : customerError ? (
              <div className="text-center text-red-600 py-8">
                <p className="mb-2">Error loading customers: {customerError}</p>
                <Button onClick={fetchCustomers}>Try Reloading Customers</Button>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center text-gray-600 py-8">No customers found.</div>
            ) : (
              <CustomerList
                customers={customers}
                onView={handleViewCustomer}
                onEdit={handleEditCustomer}
              />
            )}
            <Dialog open={isCustomerViewOpen} onOpenChange={setIsCustomerViewOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Customer Details</DialogTitle>
                  <DialogDescription>View customer information.</DialogDescription>
                </DialogHeader>
                {selectedCustomer && (
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <p className="text-gray-800">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-gray-800">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="text-gray-800">{selectedCustomer.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <Label>Orders</Label>
                      <p className="text-gray-800">{selectedCustomer.orders}</p>
                    </div>
                    <div>
                      <Label>Total Spent</Label>
                      <p className="text-gray-800">₹{selectedCustomer.spent.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <p className="text-gray-800">
                        <Badge variant={selectedCustomer.status === "Verified" ? "default" : "secondary"}>
                          {selectedCustomer.status}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <Label>Registered On</Label>
                      <p className="text-gray-800">{selectedCustomer.createdAt || 'N/A'}</p>
                    </div>
                  </div>
                )}
                <Button onClick={() => setIsCustomerViewOpen(false)} className="mt-4">
                  Close
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        )

      case "replacements":
        return (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <AdminReplacementManagement />
          </div>
        )

      case "inventory":
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Inventory Management</h3>
            <InventoryList
              products={products}
              onUpdateStock={async (id, newStock, variantIndex) => {
                const product = products.find((p) => p.id === id || p._id === id);
                if (!product) return;
                try {
                  if (typeof variantIndex === 'number') {
                    // Update variant stock
                    const response = await axios.patch(`/api/products/${id}`, { stock: newStock, variantIndex });
                    setProducts((prev) => prev.map((p) => {
                      if (p.id === id || p._id === id) {
                        const updatedVariants = [...(p.variants || [])];
                        updatedVariants[variantIndex] = {
                          ...updatedVariants[variantIndex],
                          stock: newStock
                        };
                        return { ...p, variants: updatedVariants };
                      }
                      return p;
                    }));
                    toast({ title: "Stock Updated", description: `Stock for ${product.name} (${product.variants[variantIndex].color}${product.variants[variantIndex].size ? ' / ' + product.variants[variantIndex].size : ''}) updated to ${newStock}.` });
                  } else {
                    // Update product-level stock
                    const response = await axios.patch(`/api/products/${id}`, { stock: newStock });
                    setProducts((prev) => prev.map((p) => (p.id === id || p._id === id ? { ...p, stock: newStock } : p)));
                    toast({ title: "Stock Updated", description: `Stock for ${product.name} updated to ${newStock}.` });
                  }
                } catch (err) {
                  toast({ title: "Error", description: "Failed to update stock.", variant: "destructive" });
                }
              }}
            />
          </div>
        )

      case "promotions":
        return <PromotionPage />

      case "announcements":
        return (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Announcement List</h3>
              <Button onClick={handleAddAnnouncementClick}>
                <Plus className="h-4 w-4 mr-2" /> Add Announcement
              </Button>
            </div>
            {isAnnouncementsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="mr-2 h-8 w-8 animate-spin text-gray-600" />
                <p className="text-gray-600">Loading announcements...</p>
              </div>
            ) : announcementError ? (
              <div className="text-center text-red-600 py-8">
                <p className="mb-2">Error loading announcements: {announcementError}</p>
                <Button onClick={fetchAnnouncements}>Try Reloading Announcements</Button>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center text-gray-600 py-8">
                No announcements found. Click "Add Announcement" to create a new one!
              </div>
            ) : (
              <AnnouncementList
                announcements={announcements}
                onEdit={handleEditAnnouncement}
                onDelete={handleDeleteConfirmClick}
              />
            )}
            <Dialog open={isAnnouncementFormOpen} onOpenChange={setIsAnnouncementFormOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {isAddMode ? "Add New Announcement" : "Edit Announcement"}
                  </DialogTitle>
                  <DialogDescription>
                    {isAddMode
                      ? "Fill in details to add a new announcement."
                      : "Edit the announcement details."}
                  </DialogDescription>
                </DialogHeader>
                <AnnouncementForm
                  onSubmit={handleAnnouncementFormSubmit}
                  onCancel={() => {
                    setIsAnnouncementFormOpen(false)
                    setAnnouncementFormState(initialAnnouncementFormState)
                  }}
                  formState={announcementFormState}
                  setFormState={setAnnouncementFormState}
                  isSubmitting={isSubmitting}
                />
              </DialogContent>
            </Dialog>
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the{' '}
                    {itemToDelete && typeof itemToDelete === 'object' && 'name' in itemToDelete
                      ? `product "${itemToDelete.name}"`
                      : itemToDelete && typeof itemToDelete === 'object' && 'title' in itemToDelete
                        ? `announcement "${itemToDelete.title}"`
                        : 'item'} from your store.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsDeleteAlertOpen(false)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteItem}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )

      case "privacy-policy":
        return (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Edit Privacy Policy</h3>
            {contentLoading ? <div>Loading...</div> : contentError ? <div className="text-red-500">{contentError}</div> : (
              <ContentEditor
                initialData={contentData ? {
                  ...contentData,
                  type: "privacy-policy",
                  slug: "privacy-policy",
                } : { type: "privacy-policy", slug: "privacy-policy", title: "Privacy Policy", content: "", status: "published" }}
                onSave={data => saveContent("privacy-policy", { ...data, type: "privacy-policy", slug: "privacy-policy" })}
                onCancel={() => setActiveSection("dashboard")}
              />
            )}
          </div>
        );
      case "terms-of-service":
        return (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Edit Terms of Service</h3>
            {contentLoading ? <div>Loading...</div> : contentError ? <div className="text-red-500">{contentError}</div> : (
              <ContentEditor
                initialData={contentData ? {
                  ...contentData,
                  type: "terms-of-service",
                  slug: "terms-of-service",
                } : { type: "terms-of-service", slug: "terms-of-service", title: "Terms of Service", content: "", status: "published" }}
                onSave={data => saveContent("terms-of-service", { ...data, type: "terms-of-service", slug: "terms-of-service" })}
                onCancel={() => setActiveSection("dashboard")}
              />
            )}
          </div>
        );
      case "faq":
        return (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Edit FAQ</h3>
            {contentLoading ? <div>Loading...</div> : contentError ? <div className="text-red-500">{contentError}</div> : (
              <ContentEditor
                initialData={contentData ? {
                  ...contentData,
                  type: "faq",
                  slug: "faq",
                } : { type: "faq", slug: "faq", title: "FAQ", content: "", status: "published" }}
                onSave={data => saveContent("faq", { ...data, type: "faq", slug: "faq" })}
                onCancel={() => setActiveSection("dashboard")}
              />
            )}
          </div>
        );

      case "appearance":
            return (
              <Card className="p-6 bg-cream">
                <CardHeader>
                  <CardTitle className="text-darkGreen">Homepage Images</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading.categoryImages ? (
                    <div className="space-y-4">
                      {['hero', 'new-arrivals', 'men', 'women'].map((category) => (
                        <div key={category} className="space-y-2">
                          <div className="h-6 bg-beige rounded animate-pulse" />
                          <div className="h-10 bg-beige rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : error.categoryImages ? (
                    <div className="text-center text-red-500 py-8">
                      <p className="mb-2">Error loading category images: {error.categoryImages}</p>
                      <Button onClick={fetchCategoryImages}>Try Reloading Images</Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {categoryImages.map((cat) => (
                        <div key={cat.category} className="space-y-4">
                          <Label className="text-sm font-medium text-darkGreen capitalize">
                            {cat.category.replace('-', ' ')} Section
                          </Label>
                          {cat.category === 'hero' ? (
                            <div className="space-y-4">
                              <Select
                                value={heroContentType}
                                onValueChange={(value: 'images' | 'video') => setHeroContentType(value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select content type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="images">Images (Slideshow)</SelectItem>
                                  <SelectItem value="video">Video</SelectItem>
                                </SelectContent>
                              </Select>
                              {heroContentType === 'images' ? (
                                <>
                                  <Input
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif"
                                    multiple
                                    onChange={async (e) => {
                                      if (e.target.files && e.target.files.length > 0) {
                                        if (e.target.files.length > 4) {
                                          toast({
                                            title: "Error",
                                            description: "Maximum 4 images allowed for hero section.",
                                            variant: "destructive",
                                          });
                                          return;
                                        }
                                        setIsSubmitting(true);
                                        setUploadProgress(0);
                                        try {
                                          const formData = new FormData();
                                          Array.from(e.target.files).forEach(file => {
                                            formData.append('file', file);
                                          });
                                          formData.append('category', cat.category);
                                          formData.append('contentType', 'images');
                                          const response = await axios.post(
                                            `${API_BASE_URL}/category-images`,
                                            formData,
                                            {
                                              headers: {
                                                'Content-Type': 'multipart/form-data',
                                                Authorization: `Bearer ${state.token}`,
                                              },
                                              onUploadProgress: (progressEvent) => {
                                                if (progressEvent.total) {
                                                  setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                                                }
                                              },
                                            }
                                          );
                                          setCategoryImages((prev) =>
                                            prev.map((c) =>
                                              c.category === cat.category
                                                ? {
                                                    ...c,
                                                    contentType: 'images',
                                                    imageUrls: response.data.imageUrls?.map((img: { url: string; publicId: string }) => ({
                                                      url: img.url,
                                                      publicId: img.publicId || img.url,
                                                    })) || [{ url: '/placeholder.svg?height=1080&width=1920', publicId: '' }],
                                                    videoUrl: '',
                                                    videoPublicId: '',
                                                  }
                                                : c
                                            )
                                          );
                                          toast({
                                            title: 'Success',
                                            description: `Updated ${response.data.imageUrls?.length || 0} images for ${cat.category} section`,
                                          });
                                        } catch (err: any) {
                                          console.error('Error uploading images:', err);
                                          toast({
                                            title: 'Error',
                                            description: 'Failed to upload images: ' + (err.response?.data?.message || err.message),
                                            variant: 'destructive',
                                          });
                                        } finally {
                                          setIsSubmitting(false);
                                          setUploadProgress(null);
                                        }
                                      }
                                    }}
                                    disabled={isSubmitting}
                                    className="bg-cream border-mocha text-darkGreen"
                                  />
                                  {uploadProgress !== null && (
                                    <div className="w-full bg-gray-200 rounded h-3 mb-2 relative">
                                      <div
                                        className="bg-emerald-500 h-3 rounded"
                                        style={{ width: `${uploadProgress}%`, transition: 'width 0.2s' }}
                                      />
                                      <span className="text-xs text-gray-700 absolute right-2 top-0">{uploadProgress}%</span>
                                    </div>
                                  )}
                                  {cat.imageUrls && cat.imageUrls.length > 0 && cat.imageUrls[0].url && !cat.imageUrls[0].url.includes('placeholder') ? (
                                    <div className="flex flex-row gap-4 mt-4">
                                      {cat.imageUrls.slice(0, 4).map((img, idx) => (
                                        <div key={idx} className="relative w-48 h-32">
                                          <NextImage
                                            src={img.url}
                                            alt={`${cat.category} preview ${idx + 1}`}
                                            fill
                                            className="object-cover rounded border border-mocha"
                                            onError={(e) => {
                                              console.error(`Image load error for ${cat.category} preview ${idx + 1}:`, e);
                                              e.currentTarget.src = '/placeholder.svg?height=1080&width=1920';
                                            }}
                                          />
                                          {/* Remove button for hero section images */}
                                          {cat.category === 'hero' && (
                                            <button
                                              type="button"
                                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-800 z-10"
                                              onClick={async () => {
                                                setIsSubmitting(true);
                                                try {
                                                  await axios.delete(`${API_BASE_URL}/category-images/${cat.category}/image`, {
                                                    data: { publicId: img.publicId },
                                                    headers: { Authorization: `Bearer ${state.token}` },
                                                  });
                                                  setCategoryImages(prev =>
                                                    prev.map(c =>
                                                      c.category === cat.category
                                                        ? { ...c, imageUrls: c.imageUrls.filter(i => i.publicId !== img.publicId) }
                                                        : c
                                                    )
                                                  );
                                                  toast({ title: 'Success', description: 'Image removed.' });
                                                } catch (err) {
                                                  toast({ title: 'Error', description: 'Failed to remove image.', variant: 'destructive' });
                                                } finally {
                                                  setIsSubmitting(false);
                                                }
                                              }}
                                              disabled={isSubmitting}
                                              aria-label="Remove image"
                                            >
                                              ×
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-gray-600">No images uploaded for hero section.</p>
                                  )}
                                </>
                              ) : (
                                <>
                                  <Input
                                    type="file"
                                    accept="video/mp4,video/webm,video/ogg"
                                    onChange={async (e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        if (e.target.files.length > 1) {
                                          toast({
                                            title: "Error",
                                            description: "Only one video allowed.",
                                            variant: "destructive",
                                          });
                                          return;
                                        }
                                        setIsSubmitting(true);
                                        setUploadProgress(0);
                                        try {
                                          const formData = new FormData();
                                          formData.append('file', e.target.files[0]);
                                          formData.append('category', cat.category);
                                          formData.append('contentType', 'video');
                                          const response = await axios.post(
                                            `${API_BASE_URL}/category-images`,
                                            formData,
                                            {
                                              headers: {
                                                'Content-Type': 'multipart/form-data',
                                                Authorization: `Bearer ${state.token}`,
                                              },
                                              onUploadProgress: (progressEvent) => {
                                                if (progressEvent.total) {
                                                  setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                                                }
                                              },
                                            }
                                          );
                                          console.log('Video upload response:', response.data);
                                          setCategoryImages((prev) =>
                                            prev.map((c) =>
                                              c.category === cat.category
                                                ? {
                                                    ...c,
                                                    contentType: 'video',
                                                    imageUrls: [],
                                                    videoUrl: response.data.videoUrl || '',
                                                    videoPublicId: response.data.videoPublicId || '',
                                                  }
                                                : c
                                            )
                                          );
                                          toast({
                                            title: 'Success',
                                            description: `Updated video for ${cat.category} section`,
                                          });
                                        } catch (err: any) {
                                          console.error('Error uploading video:', err);
                                          toast({
                                            title: 'Error',
                                            description: 'Failed to upload video: ' + (err.response?.data?.message || err.message),
                                            variant: 'destructive',
                                          });
                                        } finally {
                                          setIsSubmitting(false);
                                          setUploadProgress(null);
                                        }
                                      }
                                    }}
                                    disabled={isSubmitting}
                                    className="bg-cream border-mocha text-darkGreen"
                                  />
                                  {uploadProgress !== null && (
                                    <div className="w-full bg-gray-200 rounded h-3 mb-2 relative">
                                      <div
                                        className="bg-emerald-500 h-3 rounded"
                                        style={{ width: `${uploadProgress}%`, transition: 'width 0.2s' }}
                                      />
                                      <span className="text-xs text-gray-700 absolute right-2 top-0">{uploadProgress}%</span>
                                    </div>
                                  )}
                                  {cat.videoUrl ? (
                                    <div className="relative w-full h-64 mt-2">
                                      <video
                                        src={cat.videoUrl}
                                        controls
                                        autoPlay={false}
                                        muted
                                        className="w-full h-full object-contain rounded border border-mocha"
                                        onError={(e) => console.error('Video playback error:', e)}
                                      >
                                        Your browser does not support the video tag.
                                      </video>
                                    </div>
                                  ) : (
                                    <p className="text-gray-600">No video uploaded for hero section.</p>
                                  )}
                                </>
                              )}
                            </div>
                          ) : (
                            <>
                              <Input
                                type="file"
                                accept="image/jpeg,image/png,image/gif"
                                onChange={async (e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setIsSubmitting(true);
                                    setUploadProgress(0);
                                    try {
                                      const formData = new FormData();
                                      formData.append('file', e.target.files[0]);
                                      formData.append('category', cat.category);
                                      formData.append('contentType', 'images');
                                      const response = await axios.post(
                                        `${API_BASE_URL}/category-images`,
                                        formData,
                                        {
                                          headers: {
                                            'Content-Type': 'multipart/form-data',
                                            Authorization: `Bearer ${state.token}`,
                                          },
                                          onUploadProgress: (progressEvent) => {
                                            if (progressEvent.total) {
                                              setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                                            }
                                          },
                                        }
                                      );
                                      console.log('Non-hero image upload response:', response.data);
                                      setCategoryImages((prev) =>
                                        prev.map((c) =>
                                          c.category === cat.category
                                            ? {
                                                ...c,
                                                contentType: 'images',
                                                imageUrls: [
                                                  { url: response.data.imageUrls[0]?.url || '/placeholder.svg?height=600&width=800', publicId: response.data.imageUrls[0]?.publicId || '' },
                                                ],
                                                videoUrl: '',
                                                videoPublicId: '',
                                              }
                                            : c
                                        )
                                      );
                                      toast({
                                        title: 'Success',
                                        description: `Updated image for ${cat.category} section`,
                                      });
                                    } catch (err: any) {
                                      console.error('Error uploading image:', err);
                                      toast({
                                        title: 'Error',
                                        description: 'Failed to upload image: ' + (err.response?.data?.message || err.message),
                                        variant: 'destructive',
                                      });
                                    } finally {
                                      setIsSubmitting(false);
                                      setUploadProgress(null);
                                    }
                                  }
                                }}
                                disabled={isSubmitting}
                                className="bg-cream border-mocha text-darkGreen"
                              />
                              {uploadProgress !== null && (
                                <div className="w-full bg-gray-200 rounded h-3 mb-2 relative">
                                  <div
                                    className="bg-emerald-500 h-3 rounded"
                                    style={{ width: `${uploadProgress}%`, transition: 'width 0.2s' }}
                                  />
                                  <span className="text-xs text-gray-700 absolute right-2 top-0">{uploadProgress}%</span>
                                </div>
                              )}
                              {cat.imageUrls && cat.imageUrls.length > 0 && cat.imageUrls[0].url ? (
                                <div className="relative w-48 h-32 mt-2">
                                  <NextImage
                                    src={cat.imageUrls[0].url}
                                    alt={`${cat.category} preview`}
                                    fill
                                    className="object-cover rounded border border-mocha"
                                    onError={(e) => {
                                      console.error(`Image load error for ${cat.category}:`, e);
                                      e.currentTarget.src = '/placeholder.svg?height=600&width=800';
                                    }}
                                  />
                                </div>
                              ) : (
                                <p className="text-gray-600">No image uploaded for {cat.category} section.</p>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
    
  
      case "logs":
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">System Logs</h3>
            <Card className="p-6"><p className="text-center text-gray-600">System logs placeholder</p></Card>
          </div>
        )

      case "backup-restore":
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Backup & Restore</h3>
            <Card className="p-6"><p className="text-center text-gray-600">Backup & restore placeholder</p></Card>
          </div>
        )

      case "settings":
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Admin Settings</h3>
            <Tabs defaultValue="cod" className="space-y-4">
              <TabsList>
                <TabsTrigger value="cod">COD Management</TabsTrigger>
                <TabsTrigger value="general">General Settings</TabsTrigger>
                <TabsTrigger value="badges">Badge Management</TabsTrigger>
              </TabsList>
              <TabsContent value="cod">
                <CodManagement />
              </TabsContent>
              <TabsContent value="general">
                <AdminSettings />
              </TabsContent>
              <TabsContent value="badges">
                <BadgeManagement />
              </TabsContent>
            </Tabs>
          </div>
        )

      case "newsletter":
        return <NewsletterAdminPage />;

      case "contact":
        return (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Contact Management</h3>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-600">
                    To manage contact information and view messages, please visit the dedicated{' '}
                    <Link href="/admin/contact" className="text-blue-600 hover:underline">
                      Contact Management Page
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "brand":
        return <BrandIdentity />;

      default:
        return null
    }
  }, [
    activeSection,
    state.isLoading,
    state.user,
    products,
    isProductsLoading,
    productError,
    orders,
    customers,
    isCustomersLoading,
    customerError,
    promotions,
    announcements,
    isAnnouncementsLoading,
    announcementError,
    isProductFormOpen,
    formState,
    isSubmitting,
    categories,
    isAddMode,
    itemToDelete,
    isDeleteAlertOpen,
    isAnnouncementFormOpen,
    announcementFormState,
    selectedCustomer,
    isCustomerViewOpen,
    fetchProducts,
    fetchAnnouncements,
    fetchCustomers,
    handleProductFormSubmit,
    handleEditProduct,
    handleDeleteConfirmClick,
    handleAddProductClick,
    handleAddAnnouncementClick,
    handleEditAnnouncement,
    handleAnnouncementFormSubmit,
    handleAddNewCategory,
    handleDeleteItem,
    handleViewCustomer,
    handleEditCustomer,
    fetchOrders,
    isLoading,
    error,
    categoryImages,
    heroContentType,
    currentSlide,
    fetchCategoryImages,
    contentLoading,
    contentError,
    contentData,
    currentContentSlug
  ])

  const CreditCard = DollarSign
  const Activity = BarChart

  // Function to get publicId from URL
  function getPublicIdFromUrl(url) {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }

  return (
    <div className="flex h-screen w-full flex-col sm:flex-row bg-gray-50">
      <aside className="hidden w-64 flex-col border-r bg-white p-4 sm:flex shadow-lg">
        <div className="mb-8 mt-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "secondary" : "ghost"}
              className="w-full justify-start text-base hover:bg-gray-100"
              onClick={() => {
                setActiveSection(item.id);
                setCurrentContentSlug(item.id === "privacy-policy" ? "privacy-policy" : item.id === "terms-of-service" ? "terms-of-service" : item.id === "faq" ? "faq" : null);
              }}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-base hover:bg-red-100 text-red-600"
            onClick={logout}
          >
            <BarChart className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b bg-white p-4 sm:hidden shadow-md">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="touch-target">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-white p-6">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-base hover:bg-gray-100"
                    onClick={() => {
                      setActiveSection(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-base hover:bg-red-100 text-red-600 mt-4"
                  onClick={() => {
                    logout()
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <BarChart className="w-5 h-5 mr-3" />
                  Logout
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="mb-6">
            <h2 className="text-responsive-2xl font-bold text-gray-800 capitalize">
              {activeSection.replace("-", " ")}
            </h2>
            <p className="text-gray-600">
              Manage your {activeSection.replace("-", " ")} settings and data.
            </p>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

