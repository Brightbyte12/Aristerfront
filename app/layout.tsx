import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { CartProvider, CartDebug } from "@/components/cart-provider"
import { WishlistProvider } from "@/components/wishlist-provider"
import { AuthProvider } from "@/components/auth-provider"
import { ReviewProvider } from "@/components/review-provider"
import { Outfit } from "next/font/google"
import ClientLayout from "@/components/client-layout"
import { Toaster } from "sonner"

const outfit = Outfit({ subsets: ["latin"] })

export const metadata = {
  title: "Arister - Fashion & Cultural Heritage", // Updated brand name
  description:
    "Discover handcrafted clothing that celebrates cultural heritage with contemporary design from Arister.", // Updated brand name
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthProvider>
            <CartProvider>
              <CartDebug />
              <WishlistProvider>
                <ReviewProvider>
                  <ClientLayout>
                    <Header />
                    {children}
                    <Footer />
                    <Toaster />
                  </ClientLayout>
                </ReviewProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
