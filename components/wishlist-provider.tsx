"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  gender?: string
  category?: string
}

interface WishlistContextType {
  wishlistItems: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (itemId: string) => void
  isInWishlist: (itemId: string) => boolean
  clearWishlist: () => void
  wishlistCount: number
  isLoaded: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const { toast } = useToast()

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist')
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist)
        setWishlistItems(parsedWishlist)
      }
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('wishlist', JSON.stringify(wishlistItems))
      } catch (error) {
        console.error('Error saving wishlist to localStorage:', error)
      }
    }
  }, [wishlistItems, isLoaded])

  const addToWishlist = (item: WishlistItem) => {
    if (!isInWishlist(item.id)) {
      setWishlistItems(prev => [...prev, item])
      toast({
        title: "Added to wishlist",
        description: `${item.name} has been added to your wishlist`,
      })
    } else {
      toast({
        title: "Already in wishlist",
        description: `${item.name} is already in your wishlist`,
        variant: "destructive",
      })
    }
  }

  const removeFromWishlist = (itemId: string) => {
    const item = wishlistItems.find(item => item.id === itemId)
    setWishlistItems(prev => prev.filter(item => item.id !== itemId))
    if (item) {
      toast({
        title: "Removed from wishlist",
        description: `${item.name} has been removed from your wishlist`,
      })
    }
  }

  const isInWishlist = (itemId: string) => {
    return wishlistItems.some(item => item.id === itemId)
  }

  const clearWishlist = () => {
    setWishlistItems([])
    toast({
      title: "Wishlist cleared",
      description: "All items have been removed from your wishlist",
    })
  }

  const wishlistCount = wishlistItems.length

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount,
        isLoaded,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
} 