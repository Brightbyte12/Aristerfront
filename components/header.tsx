"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Search, User, Heart, ShoppingBag, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "@/components/wishlist-provider"
import { useAuth } from "@/components/auth-provider"
import SearchComponent from "@/components/search-component"
import { useState, useEffect } from "react"
import axios from "axios"

interface BrandSettings {
  brandName: string;
  brandLogo: string;
  logoWidth: number;
  brandFont: string;
}

interface Announcement {
  id: string
  title: string
  message: string
  type: string
  active: boolean
  created: string
}

const API_BASE_URL = "http://localhost:5000/api"

const Header = () => {
  const pathname = usePathname()
  const { cartItems } = useCart()
  const { wishlistCount } = useWishlist()
  const { state } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileMenuMounted, setIsMobileMenuMounted] = useState(false)
  const [isMobileMenuAnimating, setIsMobileMenuAnimating] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([]) // Dynamic announcements
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0)
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(true)
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    brandName: "ARISTER",
    brandLogo: "",
    logoWidth: 80,
    brandFont: 'inherit',
  });

  // Fetch brand settings
  useEffect(() => {
    const fetchBrandSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings/public');
        if (data) {
          setBrandSettings({
            brandName: data.brandName || "ARISTER",
            brandLogo: data.brandLogo || "",
            logoWidth: data.logoWidth || 80,
            brandFont: data.brandFont || 'inherit',
          });
        }
      } catch (error) {
        console.error("Error fetching brand settings:", error);
      }
    };
    fetchBrandSettings();
  }, []);

  // Fetch announcements from backend
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsAnnouncementsLoading(true)
      try {
        const response = await axios.get<Announcement[]>(`${API_BASE_URL}/announcements`)
        const activeAnnouncements = response.data
          .filter((a) => a.active) // Only active announcements
          .map((a) => ({
            ...a,
            id: a.id || (a as any)._id.toString(),
            created: new Date(a.created).toLocaleDateString(),
          }))
        setAnnouncements(activeAnnouncements)
      } catch (err) {
        console.error("Error fetching announcements:", err)
        // Fallback to static messages if backend fails
        setAnnouncements([
          {
            id: "1",
            title: "Sale",
            message: "🎉 50% OFF on all sweaters! Limited time offer!",
            type: "info",
            active: true,
            created: new Date().toLocaleDateString(),
          },
          {
            id: "2",
            title: "Shipping",
            message: "🚚 Free shipping on orders over ₹1500!",
            type: "info",
            active: true,
            created: new Date().toLocaleDateString(),
          },
          {
            id: "3",
            title: "New Arrivals",
            message: "✨ New arrivals every week! Explore our latest collection.",
            type: "info",
            active: true,
            created: new Date().toLocaleDateString(),
          },
          {
            id: "4",
            title: "Gift",
            message: "🎁 Get a free gift with purchases over ₹3000!",
            type: "info",
            active: true,
            created: new Date().toLocaleDateString(),
          },
        ])
      } finally {
        setIsAnnouncementsLoading(false)
      }
    }
    fetchAnnouncements()
  }, [])

  // Rotate announcements
  useEffect(() => {
    if (announcements.length === 0) return
    const interval = setInterval(() => {
      setCurrentAnnouncementIndex((prevIndex) => (prevIndex + 1) % announcements.length)
    }, 5000) // Change message every 5 seconds
    return () => clearInterval(interval)
  }, [announcements.length])

  // Mobile menu animation
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (isMobileMenuOpen) {
      setIsMobileMenuMounted(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsMobileMenuAnimating(true)
        })
      })
    } else {
      setIsMobileMenuAnimating(false)
      timeoutId = setTimeout(() => {
        setIsMobileMenuMounted(false)
      }, 500)
    }
    return () => clearTimeout(timeoutId)
  }, [isMobileMenuOpen])

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const isActive = (path: string) => {
    return pathname === path
  }

  const navigationLinks = [
    { href: "/collections/men", label: "MEN" },
    { href: "/collections/women", label: "WOMEN" },
    { href: "/collections", label: "COLLECTIONS" },
    { href: "/about", label: "ABOUT" },
    { href: "/contact", label: "CONTACT" },
  ]

  if (!hasMounted) return null

  return (
    <header className="bg-background text-darkGreen sticky top-0 z-50 safe-area-inset-top border-b border-gray-200">
      {/* Announcement Bar */}
      {!isAnnouncementsLoading && announcements.length > 0 && (
        <div className="text-darkGreen text-center py-2 text-xs sm:text-sm font-medium overflow-hidden">
          <div className="animate-slide-left">{announcements[currentAnnouncementIndex].message}</div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              {brandSettings.brandLogo && (
                <img 
                  src={brandSettings.brandLogo} 
                  alt={`${brandSettings.brandName} Logo`} 
                  style={{ width: `${brandSettings.logoWidth}px`, height: 'auto' }}
                  className="h-auto" 
                />
              )}
              <span 
                className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wider text-darkGreen"
                style={{ fontFamily: brandSettings.brandFont }}
              >
                {brandSettings.brandName}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium hover:text-darkGreen transition-colors ${
                  isActive(link.href) ? "text-darkGreen" : "text-gray-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-darkGreen hover:text-bronze hover:bg-gray-100 touch-target"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
              <span className="sr-only">Search</span>
            </Button>

            {/* User Account */}
            {state.user ? (
              <Link href="/account">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-darkGreen hover:text-bronze hover:bg-gray-100 touch-target"
                >
                  <User className="w-5 h-5" />
                  <span className="sr-only">Account</span>
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-darkGreen hover:text-bronze hover:bg-gray-100 touch-target"
                >
                  <User className="w-5 h-5" />
                  <span className="sr-only">Login</span>
                </Button>
              </Link>
            )}

            {/* Wishlist */}
            <Link href="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-darkGreen hover:text-bronze hover:bg-gray-100 touch-target"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                    {wishlistCount}
                  </Badge>
                )}
                <span className="sr-only">Wishlist ({wishlistCount} items)</span>
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-darkGreen hover:text-bronze hover:bg-gray-100 touch-target"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs bg-darkGreen text-cream">
                    {cartItems.length}
                  </Badge>
                )}
                <span className="sr-only">Cart ({cartItems.length} items)</span>
              </Button>
            </Link>

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-darkGreen hover:text-bronze hover:bg-gray-100 p-2 rounded touch-target transition-colors"
              >
                <Menu className="w-5 h-5" />
                <span className="sr-only">Menu</span>
              </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuMounted && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className={cn(
                    "fixed inset-0 bg-black transition-opacity duration-500 ease-in-out",
                    isMobileMenuAnimating ? "opacity-50" : "opacity-0",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <div
                  className={cn(
                    "fixed right-0 top-0 h-full w-full max-w-sm bg-background text-darkGreen border-l border-gray-200 transform transition-transform duration-500 ease-in-out",
                    isMobileMenuAnimating ? "translate-x-0" : "translate-x-full",
                  )}
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-darkGreen">Menu</h2>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-darkGreen hover:text-bronze p-2 rounded transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-6 p-6">
                    {navigationLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-lg font-medium hover:text-bronze py-2 border-b border-gray-200 last:border-b-0 text-darkGreen"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}

                    {/* Mobile-only links */}
                    <div className="pt-4 border-t border-gray-200">
                      <Link
                        href="/account"
                        className="text-base text-gray-600 hover:text-darkGreen py-2 block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Account
                      </Link>
                      <Link
                        href="/cart"
                        className="text-base text-gray-600 hover:text-darkGreen py-2 block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Cart ({cartItems.length})
                      </Link>
                      <Link
                        href="/wishlist"
                        className="text-base text-gray-600 hover:text-darkGreen py-2 block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Wishlist
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-background z-50 safe-area-inset-top">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-darkGreen text-lg font-semibold">Search</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(false)}
                className="text-darkGreen hover:text-bronze touch-target"
              >
                <X className="w-5 h-5" />
                <span className="sr-only">Close search</span>
              </Button>
            </div>
            <SearchComponent onClose={() => setIsSearchOpen(false)} autoFocus className="w-full" />
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
