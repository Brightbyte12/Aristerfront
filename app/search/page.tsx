"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingBag, Star, Filter, Search, Grid, List } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import SearchComponent from "@/components/search-component"
import ProductFilters from "@/components/product-filters"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "axios"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "@/components/wishlist-provider"
import { useReviews } from "@/components/review-provider"
import { useToast } from "@/hooks/use-toast"

const API_BASE_URL = "https://arister.onrender.com/api"

interface Product {
  id: string
  name: string
  price: number
  salePrice?: number | null
  imageUrl?: string[]
  category: string
  rating?: number
  reviews?: number
  colors?: string[]
  sizes?: string[]
  isNew?: boolean
  isOnSale?: boolean
  images?: { url: string }[]
  gender?: string
  colorImages?: { color: string; images: { url: string; publicId: string }[] }[];
}

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [products, setProducts] = useState<Product[]>([])
  const [filteredResults, setFilteredResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<string>("relevance")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { getAverageRating, getProductReviews, loadProductReviews } = useReviews()
  const { toast } = useToast()
  const [categories, setCategories] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [colors, setColors] = useState<{ name: string; value: string }[]>([])

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
            : p.images?.map((img: any) => img.url) || [],
          category: p.category,
          rating: p.rating || 4.0, // Default if not provided
          reviews: p.reviews || 0,
          colors: p.colors || [],
          sizes: p.sizes || [],
          isNew: p.isNew || false,
          isOnSale: !!p.salePrice,
          images: p.images,
          gender: p.gender,
          colorImages: p.colorImages || [],
        }))
        setProducts(productsData)
        setFilteredResults(productsData)
      } catch (err: any) {
        console.error("Error fetching products:", err)
        setError(err.message || "Failed to fetch products")
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Filter results based on query
  useEffect(() => {
    if (!query) {
      setFilteredResults(products)
      return
    }
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()),
    )
    setFilteredResults(filtered)
  }, [query, products])

  // Apply filters
  useEffect(() => {
    let results = products.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );

    // Price range filter
    results = results.filter(p => (p.salePrice || p.price) >= priceRange[0] && (p.salePrice || p.price) <= priceRange[1]);

    // Category filter
    if (selectedCategories.length > 0) {
      results = results.filter(p => selectedCategories.includes(p.category));
    }

    // Size filter
    if (selectedSizes.length > 0) {
      results = results.filter(p => p.sizes?.some(s => selectedSizes.includes(s)));
    }

    // Color filter
    if (selectedColors.length > 0) {
      results = results.filter(p => p.colors?.some(c => selectedColors.includes(c)));
    }

    setFilteredResults(results);

  }, [query, products, priceRange, selectedCategories, selectedSizes, selectedColors]);

  useEffect(() => {
    products.forEach((product) => {
      loadProductReviews(product.id);
    });
  }, [products, loadProductReviews]);

  // Force refresh reviews on mount to ensure fresh data
  useEffect(() => {
    if (products.length > 0) {
      const refreshReviews = async () => {
        for (const product of products) {
          try {
            await loadProductReviews(product.id);
          } catch (error) {
            console.error(`Failed to refresh reviews for product ${product.id}:`, error);
          }
        }
      };
      refreshReviews();
    }
  }, [products, loadProductReviews]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, sizeRes, colorRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/categories`),
          axios.get(`${API_BASE_URL}/sizes`),
          axios.get(`${API_BASE_URL}/colors`),
        ]);
        setCategories(catRes.data.categories || []);
        setSizes(sizeRes.data.sizes || []);
        setColors(colorRes.data.colors || []);
      } catch (err) {
        setCategories([]);
        setSizes([]);
        setColors([]);
      }
    };
    fetchFilters();
  }, []);

  const handleFiltersChange = (filters: any) => {
    setPriceRange(filters.priceRange || [0, 10000]);
    setSelectedCategories(filters.selectedCategories || []);
    setSelectedSizes(filters.selectedSizes || []);
    setSelectedColors(filters.selectedColors || []);
  }

  const handleSort = (sortOption: string) => {
    setSortBy(sortOption)
    const sorted = [...filteredResults]

    switch (sortOption) {
      case "price-low":
        sorted.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price))
        break
      case "price-high":
        sorted.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price))
        break
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case "newest":
        sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      default:
        break
    }

    setFilteredResults(sorted)
  }

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.salePrice || product.price,
        image: product.imageUrl?.[0] || "/placeholder.svg",
        gender: product.gender,
        category: product.category,
      })
    }
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.imageUrl?.[0] || "/placeholder.svg",
      quantity: 1,
    })
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    })
  }

  return (
    <div className="min-h-screen bg-cream animate-fade-in">
      <div className="container-responsive py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="mb-4">
            <SearchComponent className="max-w-2xl mx-auto" />
          </div>

          {query && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="text-responsive-2xl font-bold text-darkGreen">Search Results for "{query}"</h1>
                <p className="text-responsive-base text-gray-500 mt-1">{filteredResults.length} products found</p>
              </div>

              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="border border-mocha rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze bg-cream text-darkGreen btn-responsive"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0 animate-slide-right">
            <div className="sticky top-24">
              <ProductFilters
                availableCategories={categories}
                availableSizes={sizes}
                availableColors={colors.map(c => ({ name: c.name, hex: c.value }))}
                availableMaterials={[]}
                availableFits={[]}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden fixed bottom-4 left-4 z-40 animate-bounce-in">
            <Sheet>
              <SheetTrigger asChild>
                <Button className="rounded-full shadow-lg bg-darkGreen text-cream hover:bg-mocha btn-responsive">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 safe-area-inset-left bg-cream">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-darkGreen mb-4">Filters</h2>
                  <ProductFilters
                    availableCategories={categories}
                    availableSizes={sizes}
                    availableColors={colors.map(c => ({ name: c.name, hex: c.value }))}
                    availableMaterials={[]}
                    availableFits={[]}
                    onFiltersChange={handleFiltersChange}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Results Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid-responsive-products">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="group cursor-pointer border-0 shadow-sm animate-fade-in">
                    <CardContent className="p-0">
                      <div className="relative aspect-product overflow-hidden rounded-t-lg">
                        <Skeleton className="h-full w-full" />
                      </div>
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 animate-fade-in">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-beige rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-responsive-xl font-semibold text-darkGreen mb-2">Error</h3>
                  <p className="text-responsive-base text-gray-500 mb-6">{error}</p>
                  <Button variant="outline" className="btn-responsive border-mocha text-darkGreen hover:bg-beige" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="grid-responsive-products">
                {filteredResults.map((product, index) => (
                  <Link href={`/products/${product.id}`} key={product.id} className="block group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <Card>
                      <CardContent className="p-0">
                        <div className="relative aspect-product overflow-hidden rounded-t-lg">
                          <Image
                            src={product.imageUrl?.[0] || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          />
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {product.isNew && (
                              <Badge className="bg-darkGreen hover:bg-mocha text-cream text-xs">NEW</Badge>
                            )}
                            {product.isOnSale && (
                              <Badge className="bg-red-500 hover:bg-red-600 text-cream text-xs">SALE</Badge>
                            )}
                          </div>
                          {/* Quick Actions */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full bg-beige text-darkGreen hover:bg-mocha hover:text-cream touch-target" onClick={e => { e.preventDefault(); /* handle wishlist here if needed */ }}>
                              <Heart className="w-4 h-4" />
                              <span className="sr-only">Add to wishlist</span>
                            </Button>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="mb-2">
                            <p className="text-responsive-xs text-gray-500 uppercase tracking-wide">{product.category}</p>
                            <h3 className="font-medium text-darkGreen hover:text-mocha transition-colors line-clamp-2 text-responsive-base">
                              {product.name}
                            </h3>
                          </div>
                          {/* Rating */}
                          <div className="flex items-center mb-3">
                            <div className="flex text-bronze">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < Math.floor(getAverageRating(product.id) || 0) ? "fill-bronze" : ""}`} />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500 ml-2">({getProductReviews(product.id)?.length || 0})</span>
                          </div>
                          {/* Price */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-semibold text-darkGreen text-responsive-base">
                              ₹{(product.salePrice || product.price).toLocaleString()}
                            </span>
                            {product.salePrice && (
                              <span className="text-responsive-sm text-gray-500 line-through">
                                ₹{product.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {/* Colors */}
                          <div className="flex items-center gap-1 mb-2">
                            {product.colors?.slice(0, 4).map((color, colorIndex) => (
                              <div
                                key={colorIndex}
                                className="w-4 h-4 rounded-full border border-mocha"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                            {product.colors && product.colors.length > 4 && (
                              <span className="text-responsive-xs text-gray-500 ml-1">+{product.colors.length - 4}</span>
                            )}
                          </div>
                          {/* Sizes */}
                          <div className="flex flex-wrap gap-1">
                            {product.sizes?.slice(0, 3).map((size, sizeIndex) => (
                              <Badge key={sizeIndex} variant="outline" className="text-responsive-xs border-mocha text-darkGreen">
                                {size}
                              </Badge>
                            ))}
                            {product.sizes && product.sizes.length > 3 && (
                              <Badge variant="outline" className="text-responsive-xs border-mocha text-darkGreen">
                                +{product.sizes.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 animate-fade-in">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-beige rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-responsive-xl font-semibold text-darkGreen mb-2">No results found</h3>
                  <p className="text-responsive-base text-gray-500 mb-6">
                    {query
                      ? `We couldn't find any products matching "${query}". Try adjusting your search or browse our collections.`
                      : "Start searching to discover our amazing products."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/collections">
                      <Button variant="outline" className="btn-responsive border-mocha text-darkGreen hover:bg-beige">
                        Browse Collections
                      </Button>
                    </Link>
                    <Link href="/collections/new">
                      <Button className="btn-responsive bg-darkGreen text-cream hover:bg-mocha">
                        View New Arrivals
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center text-darkGreen">Loading...</div>}>
      <SearchResults />
    </Suspense>
  )
}
