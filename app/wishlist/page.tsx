"use client"

import { useWishlist } from "@/components/wishlist-provider"
import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingBag, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    })
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
    })
  }

  const handleRemoveFromWishlist = (itemId: string) => {
    removeFromWishlist(itemId)
  }

  const handleClearWishlist = () => {
    clearWishlist()
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-darkGreen mb-4">
              Your Wishlist is Empty
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Start adding items to your wishlist to see them here
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/collections">
              <Button className="bg-darkGreen text-cream hover:bg-olive">
                Browse Collections
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-darkGreen text-darkGreen hover:bg-darkGreen hover:text-cream">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-darkGreen hover:text-bronze">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-darkGreen">
                My Wishlist
              </h1>
              <p className="text-gray-600 mt-1">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleClearWishlist}
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="w-8 h-8 rounded-full bg-beige text-darkGreen hover:bg-mocha hover:text-cream touch-target"
                    onClick={() => handleRemoveFromWishlist(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Remove from wishlist</span>
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="w-8 h-8 rounded-full bg-beige text-darkGreen hover:bg-mocha hover:text-cream touch-target"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="sr-only">Add to cart</span>
                  </Button>
                </div>

                {/* Wishlist Badge */}
                <div className="absolute top-3 left-3">
                  <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    <Heart className="w-3 h-3 inline mr-1 fill-current" />
                    Wishlist
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-darkGreen line-clamp-2">
                    {item.name}
                  </h3>
                </div>
                
                <div className="flex items-center mb-4">
                  <span className="text-xl font-bold text-darkGreen">
                    ₹{item.price.toLocaleString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-darkGreen text-cream hover:bg-olive"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={() => handleRemoveFromWishlist(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/collections">
              <Button className="bg-darkGreen text-cream hover:bg-olive">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="outline" className="border-darkGreen text-darkGreen hover:bg-darkGreen hover:text-cream">
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 