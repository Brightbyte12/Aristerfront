"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Heart, Minus, Plus, Share2, ShoppingBag, Star, Truck, Shield, RotateCcw, Package } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/components/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";
import { useReviews } from "@/components/review-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import ReviewList from "@/components/review-list";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { getProductById, getAllProducts } from "@/lib/api";
import YouMayAlsoLike from "@/components/you-may-also-like";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import ReviewForm from "@/components/review-form";
import { motion } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";

// Define product interface
interface Product {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  discountPercentage?: number;
  images: { url: string; publicId: string }[];
  description: string;
  material: string;
  weight: string;
  dimensions: string;
  care: string;
  origin: string;
  careInstructionsList: string[];
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  gender: string;
  createdAt: string;
  colorImages?: { color: string; images: { url: string; publicId: string }[] }[];
  variants?: { color: string; size: string; stock: number }[];
}

export default function ProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  // Magnifier state
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const magnifierRef = useRef<HTMLDivElement>(null);
  const [added, setAdded] = useState(false);
  const [isSlideshowActive, setIsSlideshowActive] = useState(true);

  const { addToCart, cartItems } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { getAverageRating, getProductReviews } = useReviews();
  const { toast } = useToast();

  // Helper to map color names to hex
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
    };
    const key = colorName?.toLowerCase?.() || "";
    return colorMap[key] || key || "#ccc";
  };

  // Validate image URL
  const isValidImageUrl = (url: string) => {
    return url && typeof url === "string" && url.startsWith("http");
  };

  // Magnifier effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!imageRef.current || !product || !isValidImageUrl(product.images[selectedImage]?.url)) {
        return;
      }

      const rect = imageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Only show magnifier if within image bounds
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        setShowMagnifier(true);
        setMagnifierPosition({ x, y });

        // Calculate background position for zoomed image (2x zoom)
        const bgX = (x / rect.width) * 100;
        const bgY = (y / rect.height) * 100;
        setBackgroundPosition({ x: bgX, y: bgY });
      } else {
        setShowMagnifier(false);
      }
    };

    const handleMouseLeave = () => {
      setShowMagnifier(false);
    };

    const imageContainer = imageRef.current;
    if (imageContainer) {
      imageContainer.addEventListener("mousemove", handleMouseMove);
      imageContainer.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (imageContainer) {
        imageContainer.removeEventListener("mousemove", handleMouseMove);
        imageContainer.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [product, selectedImage]);

  // Fetch product and related products
  useEffect(() => {
    if (!id) {
      setError("Invalid product ID");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const productData = await getProductById(id);

        // Map backend data to frontend format
        const formattedProduct: Product = {
          _id: productData._id,
          name: productData.name || "Unnamed Product",
          price: productData.salePrice || productData.price || 0,
          salePrice: productData.salePrice,
          discountPercentage: productData.salePrice
            ? Math.round(((productData.price - productData.salePrice) / productData.price) * 100)
            : undefined,
          images: Array.isArray(productData.images)
            ? productData.images.map(img =>
                typeof img === 'string'
                  ? { url: img, publicId: img.split('/').pop().split('.')[0] }
                  : img
              )
            : [],
          description: productData.description || "No description available.",
          material: productData.material || "Not specified",
          weight: productData.weight || "Not specified",
          dimensions: productData.dimensions || "Not specified",
          care: productData.care || "Not specified",
          origin: productData.origin || "Not specified",
          careInstructionsList: productData.careInstructionsList || [],
          category: productData.category || "",
          sizes: productData.sizes || [],
          colors: productData.colors || [],
          stock: productData.stock || 0,
          gender: productData.gender || "",
          createdAt: productData.createdAt || "",
          colorImages: productData.colorImages || [],
          variants: productData.variants || [],
        };

        // Validate images
        if (formattedProduct.images.length === 0) {
          formattedProduct.images = [{ url: "/placeholder.svg", publicId: "placeholder" }];
        } else {
          formattedProduct.images = formattedProduct.images.map((img) => ({
            url: isValidImageUrl(img.url) ? img.url : "/placeholder.svg",
            publicId: img.publicId || "placeholder",
          }));
        }

        setProduct(formattedProduct);

        // Set initial color selection if colors are available
        if (formattedProduct.colors.length > 0) {
          setSelectedColor(0); // Select first color by default
        }

        // Fetch related products
        const allProducts = await getAllProducts();
        const related = allProducts
          .filter(
            (p: any) =>
              p._id !== id &&
              (p.category === productData.category || p.gender === productData.gender)
          )
          .slice(0, 3)
          .map((p: any) => ({
            _id: p._id,
            name: p.name || "Unnamed Product",
            price: p.salePrice || p.price || 0,
            salePrice: p.salePrice,
            discountPercentage: p.salePrice
              ? Math.round(((p.price - p.salePrice) / p.price) * 100)
              : undefined,
            images: Array.isArray(p.images) && p.images.length > 0
              ? [{ url: isValidImageUrl(p.images[0].url) ? p.images[0].url : "/placeholder.svg", publicId: p.images[0].publicId || "placeholder" }]
              : [{ url: "/placeholder.svg", publicId: "placeholder" }],
            category: p.category || "",
            gender: p.gender || "",
          }));
        setRelatedProducts(related);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load product");
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Auto-change image when color selection changes
  useEffect(() => {
    if (selectedColor !== null && product) {
      setSelectedImage(0); // Reset to first image when color changes
    }
  }, [selectedColor, product]);

  // Get available sizes for the selected color from variants, fallback to product.sizes if not variant-based
  const availableSizes = product?.variants && selectedColor !== null && product.colors[selectedColor]
    ? product.variants
        .filter(v => v.color === product.colors[selectedColor])
        .map(v => v.size)
        .filter((v, i, arr) => arr.indexOf(v) === i) // unique sizes
    : (product?.sizes && product.sizes.length > 0 ? product.sizes : []);

  const selectedColorName = selectedColor !== null && product?.colors ? product.colors[selectedColor] : undefined;
  const selectedSizeName = selectedSize !== null && availableSizes ? availableSizes[selectedSize] : undefined;
  const selectedVariant = product?.variants?.find(
    v => v.color === selectedColorName && v.size === selectedSizeName
  );
  const variantStock = typeof selectedVariant?.stock === 'number' ? selectedVariant.stock : 0;

  // Add this useEffect after availableSizes is defined
  useEffect(() => {
    if (
      selectedColor !== null &&
      availableSizes.length > 0 &&
      (selectedSize === null || selectedSize >= availableSizes.length)
    ) {
      setSelectedSize(0); // Select the first size by default
      setSelectionError(null);
    }
    // If no sizes available, clear selection
    if (availableSizes.length === 0 && selectedSize !== null) {
      setSelectedSize(null);
    }
  }, [selectedColor, availableSizes]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Check if color and size are selected
    let hasError = false;
    let errorMessage = "";
    
    if (product.colors.length > 0 && selectedColor === null) {
      hasError = true;
      errorMessage = "Please select a color";
      setSelectionError("Please select a color");
    }
    
    if (product.sizes.length > 0 && selectedSize === null) {
      hasError = true;
      errorMessage = hasError ? "Please select both color and size" : "Please select a size";
      setSelectionError("Please select a size");
    }
    
    if (hasError) {
      toast({
        title: "Selection Required",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }
    
    // Clear any previous selection errors
    setSelectionError(null);
    
    const selectedVariant = product?.variants?.find(
      v => v.color === selectedColorName && (selectedSizeName ? v.size === selectedSizeName : !v.size)
    );
    const variantStock = selectedVariant ? selectedVariant.stock : product?.stock;
    
    // Check for duplicate (same id, color, size)
    const alreadyInCart = cartItems.some(item => item.id === product._id && item.color === selectedColorName && item.size === selectedSizeName);
    if (alreadyInCart) {
      toast({
        title: "Already in Cart",
        description: `${product.name} (${selectedColorName || ''}${selectedSizeName ? ', ' + selectedSizeName : ''}) is already in your cart.`,
        variant: "default"
      });
      return;
    }
    let imageUrl = product.images[0]?.url || "/placeholder.svg";
    // Try to get color-specific image
    if (selectedColorName && product.colorImages && product.colorImages.length > 0) {
      const colorObj = product.colorImages.find(ci => ci.color === selectedColorName);
      if (colorObj && colorObj.images && colorObj.images.length > 0) {
        imageUrl = colorObj.images[0].url;
      }
    }
    addToCart({
      id: product._id,
      name: product.name,
      price: product.salePrice || product.price,
      image: imageUrl,
      quantity: quantity,
      color: selectedColorName,
      size: selectedSizeName,
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 600);
  };

  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const toggleWishlist = () => {
    if (!product) return;
    
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist({
        id: product._id,
        name: product.name,
        price: product.salePrice || product.price,
        image: product.images[0]?.url || "/placeholder.svg",
        gender: product.gender,
        category: product.category,
      });
    }
  };

  // Compute imagesToShow based on selectedColor and colorImages
  const imagesToShow = product && product.colorImages && product.colorImages.length > 0
    ? (selectedColor !== null && product.colors[selectedColor]
        ? (product.colorImages.find(ci => ci.color === product.colors[selectedColor])?.images || [])
        : product.colorImages[0]?.images || []) // Show first color's images by default
    : (product?.images || []).map((img: string | { url: string; publicId: string }) =>
        typeof img === 'string' ? { url: img, publicId: '' } : img
      );

  // Auto slideshow effect
  useEffect(() => {
    if (!isSlideshowActive || !product || imagesToShow.length <= 1) return;

    const slideshowInterval = setInterval(() => {
      setSelectedImage((prev) => {
        const nextIndex = (prev + 1) % imagesToShow.length;
        return nextIndex;
      });
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(slideshowInterval);
  }, [isSlideshowActive, product, imagesToShow.length]);

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6 sm:mb-8 overflow-x-auto whitespace-nowrap w-full">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/collections">Collections</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/collections/${product?.gender?.toLowerCase() || "men"}`}>{product?.gender || "Men"}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product?.name || "Product"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Product Details */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <Skeleton className="h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl mb-4" />
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                <Skeleton className="h-20 sm:h-24 rounded-lg" />
                <Skeleton className="h-20 sm:h-24 rounded-lg" />
                <Skeleton className="h-20 sm:h-24 rounded-lg" />
                <Skeleton className="h-20 sm:h-24 rounded-lg" />
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : (
          product && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
              {/* Product Images */}
              <div className="animate-slide-right">
                <div
                  ref={imageRef}
                  className="relative h-[500px] sm:h-[600px] lg:h-[700px] w-full sm:w-[400px] lg:w-[480px] mx-auto rounded-xl overflow-hidden mb-4 bg-white"
                  onMouseEnter={() => setIsSlideshowActive(false)}
                  onMouseLeave={() => setIsSlideshowActive(true)}
                >
                  {imagesToShow.length > 0 && isValidImageUrl(imagesToShow[selectedImage]?.url || '') ? (
                    <>
                      <Image
                        src={imagesToShow[selectedImage]?.url || '/placeholder.svg'}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                        onError={() => {
                          setProduct((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  colorImages: prev.colorImages?.map((ci, ciIdx) =>
                                    selectedColor !== null && ci.color === product.colors[selectedColor]
                                      ? {
                                          ...ci,
                                          images: ci.images.map((img, idx) =>
                                            idx === selectedImage ? { ...img, url: "/placeholder.svg" } : img
                                          ),
                                        }
                                      : ci
                                  ),
                                  images: prev.images.map((img, idx) =>
                                    idx === selectedImage ? { ...img, url: "/placeholder.svg" } : img
                                  ),
                                }
                              : prev
                          );
                        }}
                      />
                      {/* Magnifier Lens (hidden on mobile) */}
                      {showMagnifier && (
                        <div
                          ref={magnifierRef}
                          className="hidden md:block absolute w-[150px] h-[150px] rounded-full border-2 border-gray-300 bg-white bg-no-repeat bg-[length:200%] shadow-lg"
                          style={{
                            left: `${magnifierPosition.x - 75}px`,
                            top: `${magnifierPosition.y - 75}px`,
                            backgroundImage: `url(${imagesToShow[selectedImage]?.url})`,
                            backgroundPosition: `${backgroundPosition.x}% ${backgroundPosition.y}%`,
                            pointerEvents: "none",
                          }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-white flex items-center justify-center rounded-xl">
                      <span className="text-gray-500 text-sm sm:text-base">No Image Available</span>
                    </div>
                  )}
                  {product.discountPercentage && (
                    <Badge className="absolute top-4 left-4 bg-red-600 text-xs sm:text-sm">
                      {product.discountPercentage}% OFF
                    </Badge>
                  )}
                </div>
                <div className="flex flex-row gap-3 sm:gap-4 justify-center items-center mt-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 w-full px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {imagesToShow.map((image, index) => (
                    <div
                      key={index}
                      className={`relative h-20 sm:h-24 w-20 sm:w-24 rounded-lg overflow-hidden cursor-pointer border-2 ${
                        selectedImage === index ? "border-bronze" : "border-transparent"
                      } bg-white flex-shrink-0`}
                      onClick={() => {
                        setSelectedImage(index);
                        setIsSlideshowActive(false); // Pause slideshow when user clicks
                        setTimeout(() => setIsSlideshowActive(true), 5000);
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Show image ${index + 1}`}
                    >
                      <Image
                        src={image?.url || '/placeholder.svg'}
                        alt={`${product.name} - View ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                        onError={() => {
                          setProduct((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  colorImages: prev.colorImages?.map((ci, ciIdx) =>
                                    selectedColor !== null && ci.color === product.colors[selectedColor]
                                      ? {
                                          ...ci,
                                          images: ci.images.map((img, idx) =>
                                            idx === index ? { ...img, url: "/placeholder.svg" } : img
                                          ),
                                        }
                                      : ci
                                  ),
                                  images: prev.images.map((img, idx) =>
                                    idx === index ? { ...img, url: "/placeholder.svg" } : img
                                  ),
                                }
                              : prev
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="animate-slide-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                  {product.name}
                </h1>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(getAverageRating(product._id) || 0) ? "fill-bronze text-bronze" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm sm:text-base text-gray-500">({getProductReviews(product._id)?.length || 0} reviews)</span>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xl sm:text-2xl font-bold text-darkGreen">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.salePrice && (
                    <span className="text-lg sm:text-xl text-gray-500 line-through">
                      ₹{(product.price || 0).toLocaleString()}
                    </span>
                  )}
                </div>

                <p className="text-base sm:text-lg text-gray-600 mb-6">{product.description}</p>
                
                {/* Selection Error Message */}
                {selectionError && (
                  <div className="mb-6 p-4 bg-red-100 border-2 border-red-400 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">{selectionError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {product.colors.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2">
                      Color
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color, index) => (
                        <div
                          key={index}
                          className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                            selectedColor === index ? "border-bronze" : "border-gray-300"
                          }`}
                          style={{ backgroundColor: getColorHex(color) }}
                          onClick={() => { 
                            setSelectedColor(index); 
                            setSelectedImage(0); // Reset to first image of new color
                            setSelectionError(null); 
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                    {selectedColor === null && selectionError && (
                      <p className="text-sm text-red-500 mt-1">Please select a color</p>
                    )}
                  </div>
                )}

                {/* Size Selection */}
                {availableSizes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-medium text-gray-700">
                        Size
                      </h3>
                      <button className="text-sm sm:text-base text-bronze hover:underline">
                        Size Guide
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {availableSizes.map((size, index) => {
                        const sizeVariant = product?.variants?.find(v => v.color === product.colors[selectedColor!] && v.size === size);
                        return (
                          <button
                            key={index}
                            className={`px-4 py-2 border rounded-md text-sm sm:text-base ${
                              selectedSize === index
                                ? "border-bronze bg-beige text-darkGreen"
                                : "border-gray-300 text-gray-700 hover:border-darkGreen"
                            } ${sizeVariant && sizeVariant.stock === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => { if (sizeVariant && sizeVariant.stock > 0) { setSelectedSize(index); setSelectionError(null); } }}
                            disabled={sizeVariant && sizeVariant.stock === 0}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                    {selectedSize === null && selectionError && (
                      <p className="text-sm text-red-500 mt-1">Please select a size</p>
                    )}
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2">Quantity</h3>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="border-gray-300 hover:border-darkGreen"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-base sm:text-lg font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (variantStock || 1)}
                      className="border-gray-300 hover:border-darkGreen"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                  <Button
                    asChild
                    className="w-full bg-darkGreen text-cream hover:bg-olive disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={handleAddToCart}
                    disabled={
                      (selectedVariant ? selectedVariant.stock === 0 : product?.stock === 0) ||
                      (product?.colors.length > 0 && selectedColor === null) ||
                      (product?.sizes.length > 0 && selectedSize === null)
                    }
                  >
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      animate={added ? { scale: 1.1, backgroundColor: '#22c55e' } : { scale: 1, backgroundColor: '' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      style={{ width: '100%' }}
                    >
                      {(selectedVariant ? selectedVariant.stock === 0 : product?.stock === 0) ? (
                        'Out of Stock'
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          {added ? 'Added!' : (product?.colors.length > 0 && selectedColor === null) || (product?.sizes.length > 0 && selectedSize === null) 
                            ? 'Select Color & Size' : 'Add to Cart'}
                        </>
                      )}
                    </motion.button>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-darkGreen text-darkGreen hover:bg-darkGreen hover:text-cream"
                    onClick={toggleWishlist}
                  >
                    <Heart
                      className={`w-4 h-4 mr-2 ${isInWishlist(product._id) ? "fill-red-500 text-red-500" : ""}`}
                    />
                    {isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                  </Button>
                </div>

                {/* Delivery Info */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="w-5 h-5 text-darkGreen" />
                    <span className="text-sm sm:text-base text-gray-600">
                      Free shipping on orders over ₹5000
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-darkGreen" />
                    <span className="text-sm sm:text-base text-gray-600">
                      Estimated delivery: 3-5 business days
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="font-semibold">Stock:</span> {variantStock}
                </div>
              </div>
            </div>
          )
        )}

        {/* Tabs */}
        <Tabs defaultValue="details" className="mt-12 sm:mt-16">
          <TabsList className="bg-transparent border-b border-gray-200">
            <TabsTrigger
              value="details"
              className="text-sm sm:text-base data-[state=active]:text-darkGreen data-[state=active]:border-b-2 data-[state=active]:border-darkGreen"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="care"
              className="text-sm sm:text-base data-[state=active]:text-darkGreen data-[state=active]:border-b-2 data-[state=active]:border-darkGreen"
            >
              Care Instructions
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="text-sm sm:text-base data-[state=active]:text-darkGreen data-[state=active]:border-b-2 data-[state=active]:border-darkGreen"
            >
              Reviews
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">Product Details</h3>
                <ul className="text-sm sm:text-base text-gray-600 space-y-2">
                  <li>
                    <span className="font-medium">Material:</span> {product?.material}
                  </li>
                  <li>
                    <span className="font-medium">Weight:</span> {product?.weight}
                  </li>
                  <li>
                    <span className="font-medium">Dimensions:</span> {product?.dimensions}
                  </li>
                  <li>
                    <span className="font-medium">Origin:</span> {product?.origin}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">Features</h3>
                <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
                  <li>Premium quality craftsmanship</li>
                  <li>Designed for comfort and style</li>
                  <li>Ethically sourced materials</li>
                  <li>Versatile for various occasions</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="care" className="pt-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">Care Instructions</h3>
            <ul className="text-sm sm:text-base text-gray-600 space-y-2 list-disc list-inside">
              {product?.careInstructionsList.length ? (
                product.careInstructionsList.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))
              ) : (
                <li>{product?.care}</li>
              )}
            </ul>
          </TabsContent>
          <TabsContent value="reviews" className="pt-6">
            <ReviewList productId={id} productName={product?.name || ""} />
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {product && product.gender && (
          <div className="mt-12 sm:mt-16">
            <YouMayAlsoLike 
              currentProductId={id} 
              currentCategory={product?.category} 
              currentGender={product?.gender}
              limit={4} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
