"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  color?: string
  size?: string
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (itemId: string, color?: string, size?: string) => void
  updateQuantity: (itemId: string, quantity: number, color?: string, size?: string) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartItemCount: () => number
  isLoaded: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on initial mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart")
      console.log("Loading cart from localStorage:", storedCart)
      if (storedCart) {
        const parsed = JSON.parse(storedCart)
        if (Array.isArray(parsed)) {
          console.log("Setting cart items from localStorage:", parsed)
          setCartItems(parsed)
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        console.log("Saving cart to localStorage:", cartItems)
        localStorage.setItem("cart", JSON.stringify(cartItems))
      } catch (error) {
        console.error("Error saving cart to localStorage:", error)
      }
    }
  }, [cartItems, isLoaded])

  const findItemIndex = useCallback(
    (id: string, color?: string, size?: string) => {
      return cartItems.findIndex((item) => item.id === id && item.color === color && item.size === size)
    },
    [cartItems],
  )

  const addToCart = useCallback(
    (item: CartItem) => {
      setCartItems((prevItems) => {
        const existingItemIndex = findItemIndex(item.id, item.color, item.size)

        if (existingItemIndex > -1) {
          const updatedItems = [...prevItems]
          updatedItems[existingItemIndex].quantity += item.quantity
          return updatedItems
        } else {
          return [...prevItems, { ...item }]
        }
      })
      toast({
        title: "Item added to cart!",
        description: `${item.name} (${item.quantity}) added.`,
      })
    },
    [findItemIndex],
  )

  const removeFromCart = useCallback((itemId: string, color?: string, size?: string) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter(
        (item) => !(item.id === itemId && item.color === color && item.size === size),
      )
      toast({
        title: "Item removed",
        description: "Product removed from your cart.",
      })
      return updatedItems
    })
  }, [])

  const updateQuantity = useCallback(
    (itemId: string, quantity: number, color?: string, size?: string) => {
      setCartItems((prevItems) => {
        const existingItemIndex = findItemIndex(itemId, color, size)

        if (existingItemIndex > -1) {
          const updatedItems = [...prevItems]
          if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            return updatedItems.filter((_, index) => index !== existingItemIndex)
          }
          updatedItems[existingItemIndex].quantity = quantity
          return updatedItems
        }
        return prevItems
      })
    },
    [findItemIndex],
  )

  const clearCart = useCallback(() => {
    setCartItems([])
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    })
  }, [])

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [cartItems])

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }, [cartItems])

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

// Debug component to help track cart state
export function CartDebug() {
  const { cartItems, isLoaded } = useCart()
  
  useEffect(() => {
    console.log("CartDebug - isLoaded:", isLoaded)
    console.log("CartDebug - cartItems:", cartItems)
    console.log("CartDebug - localStorage cart:", localStorage.getItem("cart"))
  }, [cartItems, isLoaded])
  
  return null
}



