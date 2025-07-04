"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Heart, Filter, X, ChevronDown, Grid3X3, List, Check, Star } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import { useReviews } from "@/components/review-provider";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  imageUrl?: string[];
  category: string;
  subcategory?: string;
  colors: string[];
  sizes: string[];
  material: string;
  fit: string;
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isOnSale?: boolean;
  tags: string[];
  badges?: string[];
  gender: string;
  images: { url: string }[];
  colorImages?: { color: string; images: { url: string; publicId: string }[] }[];
  stock: number;
}

export default function NewArrivalBadgePage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFilterMounted, setIsFilterMounted] = useState(false);
  const [isFilterAnimating, setIsFilterAnimating] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 12000]);
  const [showOnSale, setShowOnSale] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { getAverageRating, getProductReviews, loadProductReviews } = useReviews();
  const { toast } = useToast();

  const getColorHex = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      "sky blue": "#87CEEB",
      "white": "#FFFFFF",
      "navy": "#1E3A8A",
      "black": "#000000",
      "grey": "#6B7280",
      "cream": "#F5F5DC",
      "light blue": "#E6E6FA",
      "light pink": "#FFB6C1",
      "beige": "#F5F5DC",
      "light grey": "#D3D3D3",
      "gold": "#FFD700",
      "maroon": "#800000",
      "red": "#DC2626",
      "pink": "#FF6B6B",
      "purple": "#9370DB",
      "green": "#22C55E",
      "blue": "#3B82F6",
      "teal": "#4ECDC4",
      "lavender": "#DDA0DD",
      "mint": "#98FB98",
      "yellow": "#F0E68C",
      "brown": "#D2691E",
      "orange": "#FF4500",
      "coral": "#FF6347",
      "turquoise": "#40E0D0",
      "orchid": "#DA70D6",
    };
    const key = colorName?.toLowerCase?.() || "";
    return colorMap[key] || key || "#ccc";
  };

  const categories = Array.from(new Set(products.map((p) => p.category))).map((category) => ({
    id: category,
    label: category.charAt(0).toUpperCase() + category.slice(1),
    count: products.filter((p) => p.category === category).length,
  }));

  const subcategories = Array.from(
    new Set(products.map((p) => p.subcategory).filter((s): s is string => !!s))
  ).map((subcategory) => ({
    id: subcategory.toLowerCase(),
    label: subcategory,
    count: products.filter((p) => p.subcategory === subcategory).length,
  }));

  const materials = Array.from(new Set(products.map((p) => p.material))).map((material) => ({
    id: material.toLowerCase(),
    label: material,
    count: products.filter((p) => p.material === material).length,
  }));

  const sizes = Array.from(new Set(products.flatMap((p) => p.sizes))).sort();
  const allColors = Array.from(
    new Set(
      products
        .flatMap((p) => p.colors)
        .filter((color): color is string => !!color && typeof color === 'string' && color.trim() !== '')
        .map(color => color.trim())
    )
  ).sort();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/products/new-arrival-badge");
        const data = response.data;
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch products");
        }
        const badgeArrivals = data.products || [];
        const productsData = badgeArrivals.map((p: any) => {
          let sizes = p.sizes && p.sizes.length > 0 ? p.sizes : [];
          if ((!sizes || sizes.length === 0) && p.variants && p.variants.length > 0) {
            sizes = [...new Set(p.variants.map((v: any) => v.size).filter(Boolean))];
          }
          return {
            id: p._id || "",
            name: p.name || "",
            price: p.price || 0,
            salePrice: p.salePrice || null,
            imageUrl: p.colorImages && p.colorImages.length > 0 && p.colorImages[0]?.images && p.colorImages[0].images.length > 0
              ? [p.colorImages[0].images[0].url]
              : p.images && p.images.length > 0
              ? p.images.map((img: any) => img.url)
              : ["/placeholder.svg"],
            category: p.category || "",
            subcategory: p.subcategory || "",
            colors: p.colors || [],
            sizes,
            material: p.material || "Unknown",
            fit: p.fit || "Regular",
            rating: p.rating || Math.random() * 2 + 3,
            reviews: p.reviews || Math.floor(Math.random() * 50),
            isNew: p.badges?.some((badge: string) => badge.trim().toLowerCase() === "new arrival") || false,
            isOnSale: !!p.salePrice,
            tags: p.tags || [],
            badges: (p.badges || []).map((badge: string) => badge.trim()),
            gender: p.gender || "",
            images: p.images || [],
            colorImages: p.colorImages || [],
            stock: p.stock || 0,
          };
        });
        setProducts(productsData);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching new arrival badge products:", err);
        setError(`Failed to load products: ${err.message}`);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isFilterOpen) {
      setIsFilterMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsFilterAnimating(true);
        });
      });
    } else {
      setIsFilterAnimating(false);
      timeoutId = setTimeout(() => {
        setIsFilterMounted(false);
      }, 500);
    }
    return () => clearTimeout(timeoutId);
  }, [isFilterOpen]);

  const filteredProducts = products.filter((product) => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }
    if (selectedSubcategories.length > 0 && !selectedSubcategories.includes(product.subcategory?.toLowerCase() || "")) {
      return false;
    }
    if (selectedMaterials.length > 0 && !selectedMaterials.includes(product.material.toLowerCase())) {
      return false;
    }
    if (selectedSizes.length > 0) {
      const hasMatchingSize = selectedSizes.some((size) => product.sizes.includes(size));
      if (!hasMatchingSize) return false;
    }
    if (selectedColors.length > 0) {
      const hasMatchingColor = selectedColors.some((color) => product.colors.includes(color));
      if (!hasMatchingColor) return false;
    }
    const effectivePrice = product.salePrice || product.price;
    if (effectivePrice < priceRange[0] || effectivePrice > priceRange[1]) {
      return false;
    }
    if (showOnSale && !product.salePrice) {
      return false;
    }
    if (showNewOnly && !product.isNew) {
      return false;
    }
    return true;
  });

  // Only show products with the 'New Arrival' badge (case-insensitive)
  const filteredNewArrivals = filteredProducts.filter(product =>
    product.badges && product.badges.some(badge => badge.trim().toLowerCase() === 'new arrival')
  );

  const sortedProducts = [...filteredNewArrivals].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        // For new arrivals, we can sort by the isNew property or just return 0
        return 0;
      case "price-low":
        return (a.salePrice || a.price) - (b.salePrice || b.price);
      case "price-high":
        return (b.salePrice || b.price) - (a.salePrice || a.price);
      default:
        return 0;
    }
  });

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedMaterials([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 12000]);
    setShowOnSale(false);
    setShowNewOnly(false);
  };

  const activeFiltersCount = [
    ...selectedCategories,
    ...selectedSubcategories,
    ...selectedMaterials,
    ...selectedSizes,
    ...selectedColors,
    priceRange[0] > 0 || priceRange[1] < 12000 ? "price" : null,
    showOnSale ? "sale" : null,
    showNewOnly ? "new" : null,
  ].filter(Boolean).length;

  const FilterSection = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={cn("space-y-6", isMobile ? "p-4" : "p-6 bg-cream rounded-lg shadow-md")}>
      {activeFiltersCount > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base">Active Filters ({activeFiltersCount})</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge key={category} variant="secondary" className="flex items-center gap-1 text-xs">
                {categories.find((c) => c.id === category)?.label}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSelectedCategories((prev) => prev.filter((c) => c !== category))}
                />
              </Badge>
            ))}
            {selectedSubcategories.map((subcategory) => (
              <Badge key={subcategory} variant="secondary" className="flex items-center gap-1 text-xs">
                {subcategories.find((s) => s.id === subcategory)?.label}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSelectedSubcategories((prev) => prev.filter((s) => s !== subcategory))}
                />
              </Badge>
            ))}
            {selectedMaterials.map((material) => (
              <Badge key={material} variant="secondary" className="flex items-center gap-1 text-xs">
                {materials.find((m) => m.id === material)?.label}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSelectedMaterials((prev) => prev.filter((m) => m !== material))}
                />
              </Badge>
            ))}
            {selectedSizes.map((size) => (
              <Badge key={size} variant="secondary" className="flex items-center gap-1 text-xs">
                {size}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSelectedSizes((prev) => prev.filter((s) => s !== size))}
                />
              </Badge>
            ))}
            {selectedColors.map((color) => (
              <Badge key={color} variant="secondary" className="flex items-center gap-1 text-xs">
                {color}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSelectedColors((prev) => prev.filter((c) => c !== color))}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-medium mb-4 text-base">Category</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCategories((prev) => [...prev, category.id]);
                    } else {
                      setSelectedCategories((prev) => prev.filter((c) => c !== category.id));
                    }
                  }}
                  className="mr-2 touch-target"
                />
                <label htmlFor={`category-${category.id}`} className="text-sm cursor-pointer">
                  {category.label}
                </label>
              </div>
              <span className="text-xs text-gray-500">({category.count})</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4 text-base">Subcategory</h3>
        <div className="space-y-3">
          {subcategories.map((subcategory) => (
            <div key={subcategory.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id={`subcategory-${subcategory.id}`}
                  checked={selectedSubcategories.includes(subcategory.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedSubcategories((prev) => [...prev, subcategory.id]);
                    } else {
                      setSelectedSubcategories((prev) => prev.filter((s) => s !== subcategory.id));
                    }
                  }}
                  className="mr-2 touch-target"
                />
                <label htmlFor={`subcategory-${subcategory.id}`} className="text-sm cursor-pointer">
                  {subcategory.label}
                </label>
              </div>
              <span className="text-xs text-gray-500">({subcategory.count})</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4 text-base">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={12000}
            min={0}
            step={100}
            className="mb-4 [&_.slider-track]:bg-gray-300 [&_.slider-range]:bg-darkGreen [&_.slider-thumb]:bg-darkGreen"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>₹{priceRange[0].toLocaleString()}</span>
            <span>₹{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4 text-base">Material</h3>
        <div className="space-y-3">
          {materials.map((material) => (
            <div key={material.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id={`material-${material.id}`}
                  checked={selectedMaterials.includes(material.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedMaterials((prev) => [...prev, material.id]);
                    } else {
                      setSelectedMaterials((prev) => prev.filter((m) => m !== material.id));
                    }
                  }}
                  className="mr-2 touch-target"
                />
                <label htmlFor={`material-${material.id}`} className="text-sm cursor-pointer">
                  {material.label}
                </label>
              </div>
              <span className="text-xs text-gray-500">({material.count})</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4 text-base">Size</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => {
                if (selectedSizes.includes(size)) {
                  setSelectedSizes((prev) => prev.filter((s) => s !== size));
                } else {
                  setSelectedSizes((prev) => [...prev, size]);
                }
              }}
              className={cn(
                "py-2 px-2 border text-sm font-medium transition-colors touch-target",
                selectedSizes.includes(size)
                  ? "border-darkGreen bg-darkGreen text-cream"
                  : "border-gray-300 hover:border-darkGreen hover:text-darkGreen"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4 text-base">Color</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
          {allColors.map((colorName, index) => {
            const isSelected = selectedColors.includes(colorName);
            return (
              <button
                key={`${colorName}-${index}`}
                onClick={() => {
                  if (isSelected) {
                    setSelectedColors((prev) => prev.filter((c) => c !== colorName));
                  } else {
                    setSelectedColors((prev) => [...prev, colorName]);
                  }
                }}
                className={cn(
                  "relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all flex items-center justify-center touch-target",
                  isSelected ? "border-darkGreen scale-110" : "border-gray-300 hover:border-gray-400"
                )}
                style={{ backgroundColor: getColorHex(colorName) }}
                title={colorName}
              >
                {isSelected && <Check className="w-4 h-4 text-cream drop-shadow-sm" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-4 text-base">Special</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <Checkbox
              id="on-sale"
              checked={showOnSale}
              onCheckedChange={(checked) => setShowOnSale(checked as boolean)}
              className="mr-2 touch-target"
            />
            <label htmlFor="on-sale" className="text-sm cursor-pointer">
              On Sale
            </label>
          </div>
          <div className="flex items-center">
            <Checkbox
              id="new-arrivals"
              checked={showNewOnly}
              onCheckedChange={(checked) => setShowNewOnly(checked as boolean)}
              className="mr-2 touch-target"
            />
            <label htmlFor="new-arrivals" className="text-sm cursor-pointer">
              New Arrivals
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.salePrice || product.price,
        image: product.imageUrl?.[0] || "/placeholder.svg",
        gender: product.gender,
        category: product.category,
      });
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.imageUrl?.[0] || "/placeholder.svg",
      quantity: 1,
      color: product.colors[0] || undefined,
      size: product.sizes[0] || undefined,
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

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
    axios.get('/api/settings/public')
      .then(res => setSettings(res.data))
      .catch(() => setSettings(null));
  }, []);

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-darkGreen text-cream text-center py-2 text-xs sm:text-sm">
      {settings?.newArrivalsHeading?.text || 'New Arrivals'}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <nav className="text-xs sm:text-sm text-gray-600">
          <Link href="/" className="hover:text-darkGreen transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/collections" className="hover:text-darkGreen transition-colors">
            Collections
          </Link>
          <span className="mx-2">/</span>
          <span className="text-darkGreen">New Arrivals</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 lg:gap-8">
          <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
            <div className="sticky top-20">
              <h2 className="text-lg font-medium mb-6">Filters</h2>
          <FilterSection />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-light">New Arrivals</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {isLoading ? "Loading..." : `${sortedProducts.length} products`}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 border border-darkGreen text-darkGreen hover:bg-darkGreen hover:text-cream px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base transition-colors rounded"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-darkGreen text-cream text-xs px-2 py-1 rounded-full ml-2">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {isFilterMounted && (
                  <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                      className={cn(
                        "fixed inset-0 bg-black transition-opacity duration-500 ease-in-out",
                        isFilterAnimating ? "opacity-50" : "opacity-0"
                      )}
                      onClick={() => setIsFilterOpen(false)}
                    />
                    <div
                      className={cn(
                        "fixed inset-y-0 left-0 w-full sm:w-80 bg-white shadow-xl overflow-y-auto transform transition-transform duration-500 ease-in-out",
                        isFilterAnimating ? "translate-x-0" : "-translate-x-full"
                      )}
                    >
                      <div className="flex items-center justify-between p-4 border-b bg-darkGreen text-cream">
                        <h2 className="text-lg font-semibold">Filters</h2>
                        <button
                          onClick={() => setIsFilterOpen(false)}
                          className="p-2 hover:bg-olive rounded-full transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="p-4">
                        <FilterSection isMobile />
                      </div>
                    </div>
                  </div>
                )}

                <div className="hidden md:flex border border-darkGreen">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-none ${
                      viewMode === "grid" ? "bg-darkGreen text-cream" : "hover:bg-darkGreen hover:text-cream"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`rounded-none ${
                      viewMode === "list" ? "bg-darkGreen text-cream" : "hover:bg-darkGreen hover:text-cream"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none border border-darkGreen px-3 sm:px-4 py-2 pr-8 text-xs sm:text-sm text-darkGreen bg-white hover:bg-darkGreen hover:text-cream transition-colors cursor-pointer px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base"
                  >
                    <option value="popular">Sort By: Popular</option>
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>
              </div>
                  </div>

            {isLoading ? (
              <div className="grid grid-responsive-products gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="relative h-64 sm:h-80 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                  </div>
                ))}
                  </div>
            ) : (
              <div
                className={cn(
                  "mb-12 sm:mb-16",
                  viewMode === "grid" ? "grid-responsive-products" : "grid grid-cols-1 gap-4 sm:gap-6"
                )}
              >
                {sortedProducts.map((product, index) => (
                  <Link href={`/products/${product.id}`} key={product.id}>
                    <Card
                      className="group cursor-pointer border shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms`, borderColor: '#A27B5C' }}
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-product overflow-hidden rounded-t-lg">
                          <NextImage
                            src={product.imageUrl?.[0] || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            onError={() => {
                              setProducts((prev) =>
                                prev.map((p) =>
                                  p.id === product.id ? { ...p, imageUrl: ["/placeholder.svg"] } : p
                                )
                              );
                            }}
                          />
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {/* Only show admin-defined badges with color/fontColor from settings */}
                          {product.badges && product.badges.length > 0 && settings && settings.badges && (
                            <>
                              {product.badges.slice(0, 2).map((badge, index) => {
                                const found = settings.badges.find((b: any) => b.name.toLowerCase() === badge.toLowerCase());
                                const badgeStyle = found ? { backgroundColor: found.color, color: found.fontColor } : {};
                                return (
                                  <Badge key={index} style={badgeStyle} className="text-xs">{badge}</Badge>
                                );
                              })}
                            </>
                          )}
                        </div>
                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="secondary"
                            className={`w-8 h-8 rounded-full bg-beige text-darkGreen hover:bg-mocha hover:text-cream touch-target ${
                              isInWishlist(product.id) ? "text-red-500" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              toggleWishlist(product)
                            }}
                          >
                            <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-red-500" : ""}`} />
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
                        <div className="flex items-center mb-3">
                          <div className="flex text-bronze">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.floor(getAverageRating(product.id) || 0) ? "fill-bronze" : ""}`} />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-2">({getProductReviews(product.id)?.length || 0})</span>
                        </div>
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
                        <div className="flex items-center gap-1 mb-2">
                          {product.colors?.slice(0, 4).map((color, colorIndex) => (
                            <div
                              key={colorIndex}
                              className="w-4 h-4 rounded-full border border-mocha"
                              style={{ backgroundColor: getColorHex(color) }}
                            />
                          ))}
                          {product.colors && product.colors.length > 4 && (
                            <span className="text-responsive-xs text-gray-500 ml-1">+{product.colors.length - 4}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {product.sizes?.slice(0, 3).map((size, sizeIndex) => (
                            <Badge
                              key={sizeIndex}
                              variant="outline"
                              className="text-responsive-xs border-mocha text-darkGreen"
                            >
                              {size}
                            </Badge>
                          ))}
                          {product.sizes && product.sizes.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-responsive-xs border-mocha text-darkGreen"
                            >
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
            )}

            {!isLoading && sortedProducts.length === 0 && (
              <div className="text-center py-12 sm:py-16">
                <h3 className="text-base font-medium text-gray-900 mb-2">No Products Found</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  className="border-darkGreen text-darkGreen hover:bg-darkGreen hover:text-cream px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base"
                >
                  Clear All Filters
                </Button>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}