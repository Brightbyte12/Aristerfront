"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag, Star } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getAllProducts } from "@/lib/api";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import { useToast } from "@/hooks/use-toast";
import { useReviews } from "@/components/review-provider";
import axios from "axios";

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  imageUrl?: string[];
  category: string;
  gender: string;
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
  colorImages?: { color: string; images: { url: string; publicId: string }[] }[];
}

interface YouMayAlsoLikeProps {
  currentProductId?: string;
  currentCategory?: string;
  currentGender?: string;
  limit?: number;
}

export default function YouMayAlsoLike({ 
  currentProductId, 
  currentCategory, 
  currentGender,
  limit = 4 
}: YouMayAlsoLikeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [hoveredImageIndex, setHoveredImageIndex] = useState<{ [key: string]: number }>({});
  const [hoverIntervals, setHoverIntervals] = useState<{ [key: string]: NodeJS.Timeout }>({});
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const { getAverageRating, getProductReviews, loadProductReviews } = useReviews();
  const [settings, setSettings] = useState<any>(null);

  // Memoize dependencies to prevent unnecessary re-renders
  const memoizedProps = useMemo(() => ({
    currentProductId,
    currentCategory: currentCategory?.toLowerCase().trim(),
    currentGender: currentGender?.toLowerCase().trim(),
    limit,
  }), [currentProductId, currentCategory, currentGender, limit]);

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

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.salePrice || product.price,
        image: product.imageUrl?.[0] || "/placeholder.svg",
        gender: product.gender,
        category: product.category,
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
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleProductHover = (productId: string, images: string[]) => {
    if (images.length <= 1) return;
    
    if (hoverIntervals[productId]) {
      clearInterval(hoverIntervals[productId]);
    }
    
    setHoveredProduct(productId);
    setHoveredImageIndex(prev => ({ ...prev, [productId]: 0 }));
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % images.length;
      setHoveredImageIndex(prev => ({ ...prev, [productId]: currentIndex }));
    }, 1000);
    
    setHoverIntervals(prev => ({ ...prev, [productId]: interval }));
  };

  const handleProductLeave = (productId: string) => {
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

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);

        // Validate currentGender
        if (!memoizedProps.currentGender || !memoizedProps.currentGender.trim()) {
          setProducts([]);
          setIsLoading(false);
          return;
        }

        const allProducts = await getAllProducts();

        // Normalize currentGender for comparison
        const targetGender = memoizedProps.currentGender;

        // Filter out the current product and map to recommendations
        let recommendations = allProducts
          .filter((p: any) => p._id !== memoizedProps.currentProductId)
          .map((p: any) => {
            const productGender = p.gender ? p.gender.toLowerCase().trim() : '';
            
            let sizes = p.sizes && p.sizes.length > 0 ? p.sizes : [];
            if ((!sizes || sizes.length === 0) && p.variants && p.variants.length > 0) {
              sizes = [...new Set(p.variants.map((v: any) => v.size).filter(Boolean))];
            }
            return {
              id: p._id || "",
              name: p.name || "",
              price: p.price || 0,
              salePrice: p.salePrice || null,
              imageUrl: p.colorImages && p.colorImages.length > 0 && p.colorImages[0].images && p.colorImages[0].images.length > 0
                ? p.colorImages[0].images.map((img: any) => img.url)
                : p.images?.map((img: any) => img.url) || ["/placeholder.svg"],
              category: p.category || "",
              gender: productGender,
              subcategory: p.subcategory || "",
              colors: p.colors || [],
              sizes,
              material: p.material || "Unknown",
              fit: p.fit || "Regular",
              rating: p.rating || Math.random() * 2 + 3,
              reviews: p.reviews || Math.floor(Math.random() * 50),
              isNew: p.createdAt
                ? Date.now() - new Date(p.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
                : false,
              isOnSale: !!p.salePrice,
              tags: p.tags || [],
              badges: p.badges || [],
              colorImages: p.colorImages || [],
            };
          });

        // Filter by gender strictly
        const sameGender = recommendations.filter(p => {
          const match = p.gender === targetGender;
          return match && p.gender !== '';
        });

        // Only use same-gender products
        recommendations = sameGender;

        // If no same-gender products, return empty
        if (recommendations.length === 0) {
          toast({
            title: "No Recommendations",
            description: "No similar products found for this category and gender.",
            variant: "destructive",
          });
          setProducts([]);
          setIsLoading(false);
          return;
        }

        // If category is provided, sort by category match
        if (memoizedProps.currentCategory) {
          const sameCategory = recommendations.filter(p => 
            p.category.toLowerCase() === memoizedProps.currentCategory
          );
          const otherCategory = recommendations.filter(p => 
            p.category.toLowerCase() !== memoizedProps.currentCategory
          );
          recommendations = [...sameCategory, ...otherCategory];
        }

        // Take only the specified limit
        recommendations = recommendations.slice(0, memoizedProps.limit);
        
        setProducts(recommendations);
        setIsLoading(false);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load recommended products.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [memoizedProps]);

  useEffect(() => {
    products.forEach((product) => {
      loadProductReviews(product.id);
    });
  }, [products, loadProductReviews]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(hoverIntervals).forEach(interval => {
        clearInterval(interval);
      });
    };
  }, [hoverIntervals]);

  // Force refresh reviews on mount
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
    axios.get("/api/settings/public").then(res => setSettings(res.data)).catch(() => {});
  }, []);

  if (isLoading) {
    return (
      <div className="mt-12 sm:mt-16">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-darkGreen mb-6 sm:mb-8">
          You May Also Like
        </h2>
        <div className="grid grid-responsive-products gap-4 sm:gap-6">
          {[...Array(memoizedProps.limit)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="relative h-64 sm:h-80 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 sm:mt-16 animate-fade-in">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-darkGreen mb-6 sm:mb-8">
        You May Also Like
      </h2>
      
      <div className="grid grid-responsive-products gap-4 sm:gap-6">
        {products.map((product, index) => (
          <Card
            key={product.id}
            className="group cursor-pointer border border-[#A27B5C] shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
            onMouseEnter={() => handleProductHover(product.id, product.imageUrl || [])}
            onMouseLeave={() => handleProductLeave(product.id)}
          >
            <CardContent className="p-0">
              <div className="relative aspect-product overflow-hidden rounded-t-lg">
                <NextImage
                  src={
                    hoveredProduct === product.id && product.imageUrl && product.imageUrl.length > 1
                      ? product.imageUrl[hoveredImageIndex[product.id] || 0] || product.imageUrl[0]
                      : product.imageUrl?.[0] || "/placeholder.svg"
                  }
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
                  {product.badges && product.badges.length > 0 && (
                    <>
                      {product.badges.slice(0, 2).map((badge, index) => {
                        let badgeStyle = {};
                        if (settings && settings.badges) {
                          const found = settings.badges.find((b: any) => b.name.toLowerCase() === badge.toLowerCase());
                          if (found) {
                            badgeStyle = { backgroundColor: found.color, color: found.fontColor };
                          }
                        }
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
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-red-500" : ""}`} />
                    <span className="sr-only">
                      {isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    </span>
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-2">
                  <p className="text-responsive-xs text-gray-500 uppercase tracking-wide">{product.category}</p>
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-medium text-darkGreen hover:text-mocha transition-colors line-clamp-2 text-responsive-base">
                      {product.name}
                    </h3>
                  </Link>
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
        ))}
      </div>
    </div>
  );
}