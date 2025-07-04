"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Heart, ShoppingBag, Star, Minus, Plus, Truck, Shield, RotateCcw } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useCart } from "@/components/cart-provider"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface QuickViewModalProps {
  product: any
  isOpen: boolean
  onClose: () => void
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedSize, setSelectedSize] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const { addToCart } = useCart()

  const getColorHex = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      "Sky Blue": "#87CEEB",
      White: "#FFFFFF",
      Navy: "#1E3A8A",
      Black: "#000000",
      Grey: "#6B7280",
      Cream: "#F5F5DC",
      "Light Blue": "#E6E6FA",
      "Light Pink": "#FFB6C1",
      Beige: "#F5F5DC",
      "Light Grey": "#D3D3D3",
      Gold: "#FFD700",
      Maroon: "#800000",
      Red: "#DC2626",
      Pink: "#FF6B6B",
      Purple: "#9370DB",
      Green: "#22C55E",
      Blue: "#3B82F6",
      Teal: "#4ECDC4",
      Lavender: "#DDA0DD",
      Mint: "#98FB98",
      Yellow: "#F0E68C",
      Brown: "#D2691E",
      Orange: "#FF4500",
      Coral: "#FF6347",
      Turquoise: "#40E0D0",
      Orchid: "#DA70D6",
    };
    return colorMap[colorName] || "#000000";
  };

  if (!isOpen) return null

  const handleAddToCart = () => {
    const selectedColorObj = product.colors?.[selectedColor];
    const selectedSizeObj = product.sizes?.[selectedSize];

    // Handle different color data structures
    const colorName = typeof selectedColorObj === 'string' 
      ? selectedColorObj 
      : selectedColorObj?.name || 'Unknown';
    
    const colorAvailable = typeof selectedColorObj === 'string' 
      ? true 
      : selectedColorObj?.available !== false;

    // Handle different size data structures
    const sizeName = typeof selectedSizeObj === 'string' 
      ? selectedSizeObj 
      : selectedSizeObj?.size || 'Unknown';
    
    const sizeAvailable = typeof selectedSizeObj === 'string' 
      ? true 
      : selectedSizeObj?.available !== false;

    if (!colorAvailable) {
      toast({
        title: "Color not available",
        description: "Please select an available color",
        variant: "destructive",
      })
      return
    }

    if (!sizeAvailable) {
      toast({
        title: "Size not available",
        description: "Please select an available size",
        variant: "destructive",
      })
      return
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.imageUrl?.[0] || "/placeholder.svg",
      quantity: quantity,
      color: colorName,
      size: sizeName,
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    })
    onClose()
  }

  const handleQuantityChange = (amount: number) => {
    const newQuantity = quantity + amount
    const selectedSizeObj = product.sizes?.[selectedSize];
    const maxStock = typeof selectedSizeObj === 'string' 
      ? 10 
      : selectedSizeObj?.stock || 10;
    
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity)
    }
  }

  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white animate-slide-up">
        <CardContent className="p-0">
          <div className="flex justify-between items-center p-4 sm:p-6 border-b bg-gray-50">
            <h2 className="text-responsive-xl font-semibold">Quick View</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="touch-target">
              <X className="w-5 h-5" />
              <span className="sr-only">Close quick view</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-6">
            {/* Product Images */}
            <div className="animate-slide-right">
              <div className="relative h-72 sm:h-96 rounded-xl overflow-hidden mb-4 bg-gray-100">
                <Image
                  src={product.images?.[selectedImage] || product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.badge && (
                    <Badge
                      className={`${
                        product.badge === "Sale"
                          ? "bg-red-600"
                          : product.badge === "New"
                            ? "bg-emerald-700"
                            : product.badge === "Bestseller"
                              ? "bg-amber-600"
                              : "bg-gray-800"
                      } text-responsive-xs`}
                    >
                      {product.badge}
                    </Badge>
                  )}
                  {discountPercent > 0 && (
                    <Badge className="bg-red-600 text-white text-responsive-xs">{discountPercent}% OFF</Badge>
                  )}
                </div>
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((image: string, index: number) => (
                    <div
                      key={index}
                      className={`relative h-16 sm:h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        selectedImage === index
                          ? "border-emerald-500 scale-105"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} - View ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="animate-slide-left">
              <div className="mb-4">
                <p className="text-responsive-sm text-emerald-600 font-medium mb-1">{product.brand}</p>
                <h1 className="text-responsive-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-responsive-base text-gray-600 mb-3">{product.description}</p>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-responsive-sm text-gray-600">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <span className="text-responsive-3xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-responsive-xl text-gray-500 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <Badge className="bg-red-600 text-white text-responsive-sm">Save {discountPercent}%</Badge>
                  )}
                </div>
              </div>

              <Tabs defaultValue="details" className="mb-6">
                <TabsList className="grid w-full grid-cols-3 text-responsive-sm">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="care">Care</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-4">
                  <div className="space-y-2 text-responsive-sm">
                    <p>
                      <span className="font-medium">Material:</span> {product.material || "Not specified"}
                    </p>
                    <p>
                      <span className="font-medium">Fit:</span> {product.fit || "Regular"}
                    </p>
                    <p>
                      <span className="font-medium">Origin:</span> {product.origin || "Not specified"}
                    </p>
                    <p>
                      <span className="font-medium">SKU:</span> {product.sku || product.id || "Not specified"}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="features" className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {product.features && Array.isArray(product.features) && product.features.length > 0 ? (
                      product.features.map((feature: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-responsive-xs">
                          {feature}
                        </Badge>
                      ))
                    ) : (
                      <div className="text-responsive-sm text-gray-500">
                        <p>• Premium quality craftsmanship</p>
                        <p>• Designed for comfort and style</p>
                        <p>• Ethically sourced materials</p>
                        <p>• Versatile for various occasions</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="care" className="mt-4">
                  <p className="text-responsive-sm text-gray-600">
                    {product.care || "Follow care instructions on the garment label for best results."}
                  </p>
                  {product.sustainability && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg">
                      <p className="text-responsive-sm text-green-700 font-medium">🌱 {product.sustainability}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Color Selection */}
              {product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-responsive-sm font-medium text-gray-700 mb-3">
                    Color: {product.colors[selectedColor]?.name || product.colors[selectedColor]}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color: any, index: number) => {
                      const colorName = typeof color === 'string' ? color : color?.name || 'Unknown';
                      const colorHex = typeof color === 'string' ? getColorHex(color) : color?.hex || '#000000';
                      const isAvailable = typeof color === 'string' ? true : color?.available !== false;
                      
                      return (
                        <button
                          key={index}
                          className={`relative w-10 h-10 rounded-full border-2 transition-all touch-target ${
                            selectedColor === index
                              ? "border-emerald-500 scale-110"
                              : isAvailable
                                ? "border-gray-300 hover:border-gray-400"
                                : "border-gray-200 opacity-50 cursor-not-allowed"
                          }`}
                          style={{ backgroundColor: colorHex }}
                          onClick={() => isAvailable && setSelectedColor(index)}
                          disabled={!isAvailable}
                          title={colorName}
                        >
                          {!isAvailable && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-8 h-0.5 bg-gray-400 rotate-45"></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-responsive-sm font-medium text-gray-700">
                      Size: {product.sizes[selectedSize]?.size || product.sizes[selectedSize]}
                    </h3>
                    <Button variant="link" size="sm" className="text-emerald-600 p-0 h-auto btn-responsive">
                      Size Guide
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size: any, index: number) => {
                      const sizeName = typeof size === 'string' ? size : size?.size || 'Unknown';
                      const isAvailable = typeof size === 'string' ? true : size?.available !== false;
                      const stock = typeof size === 'string' ? 10 : size?.stock || 10;
                      
                      return (
                        <button
                          key={index}
                          className={`px-4 py-2 border rounded-lg text-responsive-sm font-medium transition-all btn-responsive ${
                            selectedSize === index
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : isAvailable
                                ? "border-gray-300 text-gray-700 hover:border-gray-400"
                                : "border-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                          onClick={() => isAvailable && setSelectedSize(index)}
                          disabled={!isAvailable}
                        >
                          {sizeName}
                          {stock <= 3 && isAvailable && (
                            <span className="block text-responsive-xs text-red-500">Only {stock} left</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="text-responsive-sm font-medium text-gray-700 mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="h-10 w-10 touch-target"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-2 text-responsive-lg font-medium min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (product.sizes[selectedSize]?.stock || 10)}
                      className="h-10 w-10 touch-target"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-responsive-sm text-gray-500">
                    {(() => {
                      const selectedSizeObj = product.sizes?.[selectedSize];
                      const stock = typeof selectedSizeObj === 'string' 
                        ? 10 
                        : selectedSizeObj?.stock || 10;
                      return `${stock} available`;
                    })()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Button
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 h-12 btn-responsive"
                  onClick={handleAddToCart}
                  disabled={
                    !product.colors?.[selectedColor] || 
                    !product.sizes?.[selectedSize] ||
                    (typeof product.colors?.[selectedColor] === 'object' && !product.colors[selectedColor]?.available) ||
                    (typeof product.sizes?.[selectedSize] === 'object' && !product.sizes[selectedSize]?.available)
                  }
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Add to Cart - ₹{(product.price * quantity).toLocaleString()}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`h-12 w-12 touch-target ${isWishlisted ? "text-red-500 border-red-500" : ""}`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500" : ""}`} />
                  <span className="sr-only">{isWishlisted ? "Remove from wishlist" : "Add to wishlist"}</span>
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Truck className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
                  <p className="text-responsive-xs font-medium">Free Shipping</p>
                  <p className="text-responsive-xs text-gray-500">Above ₹2,000</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
                  <p className="text-responsive-xs font-medium">Easy Returns</p>
                  <p className="text-responsive-xs text-gray-500">30 days</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
                  <p className="text-responsive-xs font-medium">Secure Payment</p>
                  <p className="text-responsive-xs text-gray-500">100% Safe</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
