"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingBag, Star, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

interface ProductRecommendationsProps {
  currentProducts: any[]
  category: string
}

const recommendedProducts = [
  {
    id: 101,
    name: "Linen Blend Casual Shirt",
    price: 2400,
    originalPrice: 2999,
    rating: 4.6,
    reviews: 89,
    image: "/placeholder.svg?height=300&width=250",
    badge: "Recommended",
    reason: "Based on your browsing",
  },
  {
    id: 102,
    name: "Organic Cotton Polo",
    price: 1699,
    originalPrice: 2199,
    rating: 4.4,
    reviews: 156,
    image: "/placeholder.svg?height=300&width=250",
    badge: "Popular",
    reason: "Customers also bought",
  },
  {
    id: 103,
    name: "Stretch Denim Jeans",
    price: 2899,
    originalPrice: 3499,
    rating: 4.7,
    reviews: 203,
    image: "/placeholder.svg?height=300&width=250",
    badge: "Trending",
    reason: "Perfect match",
  },
  {
    id: 104,
    name: "Merino Wool Sweater",
    price: 3999,
    originalPrice: 4999,
    rating: 4.8,
    reviews: 67,
    image: "/placeholder.svg?height=300&width=250",
    badge: "Premium",
    reason: "Complete the look",
  },
]

export default function ProductRecommendations({ currentProducts, category }: ProductRecommendationsProps) {
  const [wishlist, setWishlist] = useState<number[]>([])

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

  return (
    <div className="mt-12 sm:mt-16 animate-fade-in">
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-emerald-600" />
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Recommended for You</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {recommendedProducts.map((product, index) => (
            <Card
              key={product.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 bg-white animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <Link href={`/products/${product.id}`}>
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={250}
                      height={300}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                  </Link>

                  <Button
                    size="icon"
                    variant="outline"
                    className={`absolute top-3 right-3 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 touch-target ${
                      wishlist.includes(product.id) ? "text-red-500" : "text-gray-600"
                    }`}
                    onClick={() => toggleWishlist(product.id)}
                  >
                    <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? "fill-red-500" : ""}`} />
                    <span className="sr-only">
                      {wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    </span>
                  </Button>

                  <Badge className="absolute top-3 left-3 bg-emerald-600 text-xs">{product.badge}</Badge>
                </div>

                <div className="p-3 sm:p-4">
                  <p className="text-xs text-emerald-600 font-medium mb-1">{product.reason}</p>
                  <Link href={`/products/${product.id}`}>
                    <h4 className="font-medium text-gray-800 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2 text-sm sm:text-base">
                      {product.name}
                    </h4>
                  </Link>

                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm sm:text-base">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-gray-500 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-sm sm:text-base px-3 sm:px-4 py-2"
                  >
                    <ShoppingBag className="w-3 h-3 mr-1" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-sm sm:text-base px-3 sm:px-4 py-2"
          >
            View More Recommendations
          </Button>
        </div>
      </div>
    </div>
  )
}
