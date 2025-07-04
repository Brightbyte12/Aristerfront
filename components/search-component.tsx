"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, X, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

// Mock data for search suggestions (unchanged)
const searchSuggestions = [
  "cotton shirts",
  "silk sarees",
  "kurtas for men",
  "traditional wear",
  "wedding collection",
  "casual wear",
  "formal shirts",
  "ethnic dresses",
  "handloom sarees",
  "designer kurtis",
]

interface Product {
  id: string
  name: string
  price: number
  salePrice?: number | null
  imageUrl?: string[]
  category: string
  colorImages?: { color: string; images: { url: string; publicId: string }[] }[];
  images?: { url: string }[];
}

interface SearchComponentProps {
  onClose?: () => void
  autoFocus?: boolean
  className?: string
}

export default function SearchComponent({ onClose, autoFocus = false, className = "" }: SearchComponentProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [trendingSearches, setTrendingSearches] = useState<string[]>([])
  const [trendingLoading, setTrendingLoading] = useState(false)
  const [trendingError, setTrendingError] = useState("")

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await axios.get<Product[]>(`${API_BASE_URL}/products`)
        const productsData = response.data.map(p => ({
          id: p.id || (p as any)._id,
          name: p.name,
          price: p.price,
          salePrice: p.salePrice || null,
          imageUrl: p.colorImages && p.colorImages.length > 0 && p.colorImages[0].images && p.colorImages[0].images.length > 0
            ? [p.colorImages[0].images[0].url]
            : p.images?.map((img: any) => img.url) || ["/placeholder.svg"],
          category: p.category,
          colorImages: p.colorImages || [],
          images: p.images || [],
        }))
        setProducts(productsData)
      } catch (err: any) {
        console.error("Error fetching products:", err)
        setError(err.message || "Failed to fetch products")
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Auto-focus input
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Fetch trending searches from backend
  useEffect(() => {
    const fetchTrending = async () => {
      setTrendingLoading(true)
      setTrendingError("")
      try {
        const res = await axios.get(`${API_BASE_URL}/settings/public`)
        setTrendingSearches(res.data.trendingSearches || [])
      } catch (err: any) {
        setTrendingError("Failed to load trending searches")
      } finally {
        setTrendingLoading(false)
      }
    }
    fetchTrending()
  }, [])

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Add to recent searches
    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem("recentSearches", JSON.stringify(updated))

    // Navigate to search results
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    setIsOpen(false)
    onClose?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query)
    }
    if (e.key === "Escape") {
      setIsOpen(false)
      onClose?.()
    }
  }

  const handleProductClick = () => {
    setIsOpen(false)
    onClose?.()
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("recentSearches")
  }

  const filteredSuggestions = searchSuggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(query.toLowerCase()),
  )

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for products, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 h-10 sm:h-12 text-sm sm:text-base border-mocha focus:border-bronze focus:ring-bronze bg-cream text-darkGreen"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto touch-target"
          >
            <X className="w-4 h-4 text-gray-400" />
          </Button>
        )}
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-darkGreen/20 z-40" onClick={() => { setIsOpen(false); onClose?.(); }} />

          {/* Search Results Dropdown */}
          <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-80 sm:max-h-96 overflow-y-auto animate-fade-in bg-cream">
            <CardContent className="p-3 sm:p-4">
              {isLoading ? (
                  <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-500 text-sm">Loading products...</p>
                </div>
              ) : error ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              ) : query ? (
                <div>
                  {/* Search Suggestions */}
                  {filteredSuggestions.length > 0 && (
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-3">Suggestions</h3>
                      <div className="space-y-1 sm:space-y-2">
                        {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearch(suggestion)}
                            className="flex items-center w-full text-left p-2 hover:bg-beige rounded-md transition-colors touch-target animate-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <Search className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-darkGreen">{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Suggestions */}
                  {filteredProducts.length > 0 && (
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-3">Products</h3>
                      <div className="space-y-2 sm:space-y-3">
                        {filteredProducts.slice(0, 4).map((product, index) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            onClick={handleProductClick}
                            className="flex items-center p-2 hover:bg-beige rounded-md transition-colors touch-target animate-slide-up"
                            style={{
                              animationDelay: `${(filteredSuggestions.length > 0 ? 5 : 0) * 50 + index * 50}ms`,
                            }}
                          >
                            <div className="relative w-10 h-10 sm:w-12 sm:h-12 mr-3 rounded-md overflow-hidden flex-shrink-0">
                              <Image
                                src={product.imageUrl?.[0] || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-darkGreen truncate">{product.name}</p>
                              <p className="text-xs text-gray-500 truncate">{product.category}</p>
                              <p className="text-xs sm:text-sm font-semibold text-darkGreen">
                                ₹{product.salePrice || product.price}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredSuggestions.length === 0 && filteredProducts.length === 0 && (
                    <div className="text-center py-6 sm:py-8">
                      <p className="text-gray-500 text-sm">No suggestions or products found</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 sm:p-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="mb-4 sm:mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs sm:text-sm font-medium text-gray-500">Recent Searches</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearRecentSearches}
                          className="text-xs text-gray-400 hover:text-darkGreen h-auto p-1"
                        >
                          Clear all
                        </Button>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearch(search)}
                            className="flex items-center w-full text-left p-2 hover:bg-beige rounded-md transition-colors touch-target animate-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <Clock className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-darkGreen truncate">{search}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Searches */}
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-gray-500" />
                      Trending
                    </h3>
                    {trendingLoading ? (
                      <div className="text-xs text-gray-400">Loading...</div>
                    ) : trendingError ? (
                      <div className="text-xs text-red-500">{trendingError}</div>
                    ) : (
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {trendingSearches.map((trend, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer bg-beige text-darkGreen hover:bg-mocha hover:text-cream transition-colors text-xs touch-target animate-bounce-in"
                            style={{ animationDelay: `${(recentSearches.length > 0 ? 5 : 0) * 50 + index * 50}ms` }}
                            onClick={() => handleSearch(trend)}
                          >
                            {trend}
                          </Badge>
                        ))}
                        {trendingSearches.length === 0 && (
                          <span className="text-xs text-gray-400">No trending searches set</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}