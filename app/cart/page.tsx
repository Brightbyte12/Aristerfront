'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/components/cart-provider"
import { useRouter } from "next/navigation"; 
import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"

const CURRENCY_SYMBOL = "₹"; // Change this to support other currencies
const TAX_RATE = 0.05; // Change this to configure tax percentage

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartItemCount, clearCart } = useCart()
  const router = useRouter(); 
  // Selection state for each cart item (default: all selected)
  const [selected, setSelected] = useState(cartItems.map(() => true));
  // Keep selected state in sync with cartItems length
  useEffect(() => {
    setSelected(sel => {
      // If cart length increased, add true for new items
      if (cartItems.length > sel.length) {
        return [...sel, ...Array(cartItems.length - sel.length).fill(true)];
      }
      // If cart length decreased, trim selection
      if (cartItems.length < sel.length) {
        return sel.slice(0, cartItems.length);
      }
      return sel;
    });
  }, [cartItems.length]);
  // Always show all cart items; selection is only for checkout
  const totalItems = selected.filter(Boolean).length;
  const selectedItems = cartItems.filter((_, i) => selected[i]);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 2000 ? 0 : 150;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  // Update selection state for a single item
  const handleSelect = (idx: number) => {
    setSelected(sel => sel.map((v, i) => (i === idx ? !v : v)));
  };

  // Only selected items go to checkout, but all items are always visible
  const handleCheckout = () => {
    if (totalItems === 0) {
      alert("Select at least one item to checkout.");
      return;
    }
    router.push("/checkout");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-8">Your Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Card className="p-8 text-center animate-fade-in">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <p className="text-lg sm:text-xl text-gray-600 mb-4">Your cart is empty.</p>
            <Link href="/collections">
              <Button className="bg-darkGreen hover:bg-olive px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base">
                Start Shopping
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item, index) => (
                <Card
                  key={`${item.id}-${item.color}-${item.size}`}
                  className="flex flex-col sm:flex-row items-center p-4 sm:p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col items-center mr-4">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 96px, 128px"
                      />
                    </div>
                  </div>
                  <div className="flex-1 w-full text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-2">
                      <Link href={`/products/${item.id}`}>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 hover:text-bronze transition-colors line-clamp-1">
                          {item.name}
                        </h2>
                      </Link>
                      <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id, item.color, item.size)}
                        className="text-gray-500 hover:text-white hover:bg-darkGreen transition-colors w-8 h-8 touch-target"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                      <Checkbox
                        checked={selected[index]}
                        onCheckedChange={() => handleSelect(index)}
                        className="ml-2 border-2 border-gray-400 data-[state=checked]:bg-darkGreen data-[state=checked]:border-darkGreen transition-colors"
                        aria-label="Select item for checkout"
                      />
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-2">
                      {item.color && `Color: ${item.color}`} {item.size && `Size: ${item.size}`}
                    </p>
                    <p className="text-base sm:text-lg font-bold text-gray-800 mb-4">{CURRENCY_SYMBOL}{item.price.toLocaleString()}</p>

                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.color, item.size)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 touch-target"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-base sm:text-lg font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.color, item.size)}
                        className="w-8 h-8 touch-target"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base"
                >
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <Card className="lg:col-span-1 h-fit animate-fade-in animation-delay-200">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-base sm:text-lg">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{CURRENCY_SYMBOL}{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg">
                  <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                  <span>{CURRENCY_SYMBOL}{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg">
                  <span>Shipping</span>
                  <span>{CURRENCY_SYMBOL}{shipping.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg sm:text-xl">
                  <span>Total</span>
                  <span>
                    {CURRENCY_SYMBOL}{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-darkGreen hover:bg-olive px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base"  onClick={handleCheckout} >
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
