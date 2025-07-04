"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "@/components/wishlist-provider"
import { useReviews } from "@/components/review-provider"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { getAllProducts, getPublicSettings } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

// Product interface (aligned with backend and ProductList)
interface Product {
  _id: string
  name: string
  price: number
  salePrice?: number
  images: { url: string; publicId: string }[]
  category: string
  gender: string
  createdAt: string
  isFeatured: boolean
  badges?: string[]
  colorImages?: { color: string; images: { url: string; publicId: string }[] }[];
}

export default function FeaturedProducts() {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { getAverageRating, getProductReviews, loadProductReviews } = useReviews()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [hoveredImageIndex, setHoveredImageIndex] = useState<{ [key: string]: number }>({})
  const [hoverIntervals, setHoverIntervals] = useState<{ [key: string]: NodeJS.Timeout }>({})
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true)
        const allProducts = await getAllProducts()
        const featured = allProducts.filter((p: Product) => p.isFeatured)
        setProducts(featured)
        setIsLoading(false)
      } catch (err) {
        setError("Failed to load featured products")
        setIsLoading(false)
      }
    }
    fetchFeaturedProducts()
    // Fetch settings (badges)
    getPublicSettings().then(setSettings).catch(() => {});
  }, [])

  // Load reviews for featured products
  useEffect(() => {
    products.forEach((product) => {
      loadProductReviews(product._id);
    });
  }, [products, loadProductReviews]);

  // Force refresh reviews on mount to ensure fresh data
  useEffect(() => {
    if (products.length > 0) {
      const refreshReviews = async () => {
        for (const product of products) {
          try {
            await loadProductReviews(product._id);
          } catch (error) {
            console.error(`Failed to refresh reviews for product ${product._id}:`, error);
          }
        }
      };
      refreshReviews();
    }
  }, [products, loadProductReviews]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(hoverIntervals).forEach(interval => {
        clearInterval(interval);
      });
    };
  }, [hoverIntervals]);

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id)
    } else {
      addToWishlist({
        id: product._id,
        name: product.name,
        price: product.salePrice || product.price,
        image: product.images[0]?.url || "/placeholder.svg",
        gender: product.gender,
        category: product.category,
      })
    }
  }

  const handleAddToCart = (product: Product) => {
    // Navigate to product detail page instead of adding to cart directly
    router.push(`/products/${product._id}`);
  }

  const handleProductHover = (productId: string, images: string[]) => {
    if (images.length <= 1) return;
    
    // Clear any existing interval for this product
    if (hoverIntervals[productId]) {
      clearInterval(hoverIntervals[productId]);
    }
    
    setHoveredProduct(productId);
    setHoveredImageIndex(prev => ({ ...prev, [productId]: 0 }));
    
    // Start cycling through images
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % images.length;
      setHoveredImageIndex(prev => ({ ...prev, [productId]: currentIndex }));
    }, 1000); // Change image every 1 second
    
    // Store interval ID
    setHoverIntervals(prev => ({ ...prev, [productId]: interval }));
  };

  const handleProductLeave = (productId: string) => {
    // Clear interval for this product
    if (hoverIntervals[productId]) {
      clearInterval(hoverIntervals[productId]);
      setHoverIntervals(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    }
    
    setHoveredProduct(null);
    setHoveredImageIndex(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
  };

  const getBadge = (product: Product) => {
    if (product.salePrice && product.salePrice < product.price) return "Sale"
    const createdDate = new Date(product.createdAt)
    const isNew = Date.now() - createdDate.getTime() < 30 * 24 * 60 * 60 * 1000
    if (isNew) return "New"
    return "Bestseller" // Default for featured products
  }

  const staggerContainerVariants = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>
  }

  return (
    <section className="mt-16 sm:mt-20 container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
      <div className="text-center mb-8 sm:mb-12">
        <motion.h3
          className="text-3xl sm:text-4xl font-bold text-darkGreen mb-4"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }}
          viewport={{ once: true, amount: 0.3 }}
        >
          Featured Products
        </motion.h3>
        <motion.p
          className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.2 } }}
          viewport={{ once: true, amount: 0.3 }}
        >
          Explore our curated selection of high-quality products, each designed with you in mind. From timeless classics
          to modern essentials, find something that resonates with your style.
        </motion.p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-72 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainerVariants}
        >
          {products.map((product) => {
            const rating = getAverageRating(product._id) || 4.5 // Fallback rating
            const reviews = getProductReviews(product._id)?.length || 0
            const badge = getBadge(product)

            return (
              <motion.div key={product._id} variants={itemVariants}>
                <Card 
                  className="relative overflow-hidden rounded-lg shadow-lg group hover:shadow-xl transition-all duration-300 border-0 bg-beige"
                  onMouseEnter={() => {
                    const images = product.colorImages && product.colorImages.length > 0 && product.colorImages[0].images && product.colorImages[0].images.length > 0
                      ? product.colorImages[0].images.map(img => img.url)
                      : product.images.map(img => img.url);
                    handleProductHover(product._id, images);
                  }}
                  onMouseLeave={() => handleProductLeave(product._id)}
                >
                  <div className="relative overflow-hidden">
                    <Link href={`/products/${product._id}`}>
                      <div className="w-full aspect-[4/5] bg-white relative">
                        <Image
                          src={
                            hoveredProduct === product._id && product.colorImages && product.colorImages.length > 0 && product.colorImages[0].images && product.colorImages[0].images.length > 1
                              ? product.colorImages[0].images[hoveredImageIndex[product._id] || 0]?.url || product.colorImages[0].images[0].url
                              : hoveredProduct === product._id && product.images.length > 1
                              ? product.images[hoveredImageIndex[product._id] || 0]?.url || product.images[0].url
                              : product.colorImages && product.colorImages.length > 0 && product.colorImages[0].images && product.colorImages[0].images.length > 0
                              ? product.colorImages[0].images[0].url
                              : product.images[0]?.url || "/placeholder.svg"
                          }
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-lg"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        />
                      </div>
                    </Link>

                    {/* Product Badges */}
                    {Array.isArray(product.badges) && product.badges.length > 0 && (
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {product.badges.slice(0, 2).map((badge, index) => {
                          let badgeStyle = {};
                          if (settings && settings.badges) {
                            const found = settings.badges.find((b: any) => b.name.toLowerCase() === badge.toLowerCase());
                            if (found) {
                              badgeStyle = { backgroundColor: found.color, color: found.fontColor };
                            }
                          }
                          return (
                            <Badge
                              key={index}
                              style={badgeStyle}
                              className="text-xs px-2 py-1"
                            >
                              {badge}
                            </Badge>
                          );
                        })}
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 touch-target"
                      onClick={() => toggleWishlist(product)}
                    >
                      <Heart
                        className={`w-5 h-5 ${isInWishlist(product._id) ? "fill-bronze text-bronze" : "text-gray-600"}`}
                      />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-semibold text-darkGreen">{product.name}</h4>
                    </div>
                    <div className="flex items-center mb-3">
                      <div className="flex text-bronze">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-bronze" : ""}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">({reviews})</span>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-xl font-bold text-darkGreen">
                        ₹{(product.salePrice || product.price).toLocaleString()}
                      </span>
                      {product.salePrice && product.salePrice < product.price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ₹{product.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      className="w-full flex items-center justify-center gap-2 rounded-md text-cream text-base font-medium h-10 px-4 py-2 bg-darkGreen hover:bg-darkGreen/90"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      View Details
                    </motion.button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </section>
  )
}
