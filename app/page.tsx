"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import FeaturedProducts from "@/components/featured-products"
import Newsletter from "@/components/newsletter"
import { motion } from "framer-motion"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"

const API_BASE_URL = "http://localhost:5000/api"

interface CategoryImage {
  category: string
  contentType: 'images' | 'video'
  imageUrls?: { url: string; publicId: string }[]
  videoUrl?: string
  videoPublicId?: string
}

export default function HomePage() {
  const { toast } = useToast()
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([
    { category: "hero", contentType: "images", imageUrls: [{ url: "/placeholder.svg?height=1080&width=1920", publicId: "" }], videoUrl: "", videoPublicId: "" },
    { category: "new-arrivals", contentType: "images", imageUrls: [{ url: "/placeholder.svg?height=600&width=800", publicId: "" }], videoUrl: "", videoPublicId: "" },
    { category: "men", contentType: "images", imageUrls: [{ url: "/placeholder.svg?height=600&width=800", publicId: "" }], videoUrl: "", videoPublicId: "" },
    { category: "women", contentType: "images", imageUrls: [{ url: "/placeholder.svg?height=600&width=800", publicId: "" }], videoUrl: "", videoPublicId: "" },
  ])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const slideshowRef = useRef<NodeJS.Timeout | null>(null)
  const [heroBrandName, setHeroBrandName] = useState("Arister")
  const [heroButton, setHeroButton] = useState({ text: "Shop Now", url: "/collections", enabled: true })
  const [heroSubtitle, setHeroSubtitle] = useState("Discover our latest collection of handcrafted and contemporary fashion.")
  const [heroBrandNameStyle, setHeroBrandNameStyle] = useState({ fontFamily: 'Georgia, "Times New Roman", serif', color: '#FFFDEB', fontSize: '5xl', visible: true })
  const [heroSubtitleStyle, setHeroSubtitleStyle] = useState({ fontFamily: 'inherit', color: '#FFFDEB', fontSize: 'lg', visible: true })

  // Fetch admin-selected images and videos
  useEffect(() => {
    const fetchCategoryImages = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await axios.get<CategoryImage[]>(`${API_BASE_URL}/category-images`)
        console.log('Fetched category images:', response.data) // Debug log
        const fetchedImages = response.data
        const updatedImages = ["hero", "new-arrivals", "men", "women"].map((cat) => {
          const fetched = fetchedImages.find((img) => img.category === cat)
          return fetched || {
            category: cat,
            contentType: "images",
            imageUrls: [{ url: cat === "hero" ? "/placeholder.svg?height=1080&width=1920" : "/placeholder.svg?height=600&width=800", publicId: "" }],
            videoUrl: "",
            videoPublicId: "",
          }
        })
        setCategoryImages(updatedImages)
      } catch (err: any) {
        console.error("Error fetching category images:", err)
        setError(err.message || "Failed to load images")
        toast({
          title: "Error",
          description: "Failed to load homepage images or videos.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategoryImages()
    // Fetch hero section settings
    const fetchHeroSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/settings/public`);
        setHeroBrandName(res.data.heroBrandName || "Arister");
        setHeroButton(res.data.heroButton || { text: "Shop Now", url: "/collections", enabled: true });
        setHeroSubtitle(res.data.heroSubtitle || "Discover our latest collection of handcrafted and contemporary fashion.");
        setHeroBrandNameStyle(res.data.heroBrandNameStyle || { fontFamily: 'Georgia, "Times New Roman", serif', color: '#FFFDEB', fontSize: '5xl', visible: true });
        setHeroSubtitleStyle(res.data.heroSubtitleStyle || { fontFamily: 'inherit', color: '#FFFDEB', fontSize: 'lg', visible: true });
      } catch {}
    };
    fetchHeroSettings();
  }, [toast])

  // Slideshow effect for hero images
  useEffect(() => {
    const hero = categoryImages.find(cat => cat.category === "hero")
    if (hero?.contentType === "images" && hero.imageUrls && hero.imageUrls.length > 1) {
      slideshowRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % hero.imageUrls!.length)
      }, 5000) // Change every 5 seconds
      return () => {
        if (slideshowRef.current) {
          clearInterval(slideshowRef.current)
        }
      }
    }
  }, [categoryImages])

  // Animation variants
  const fadeInVariants = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  }

  const staggerContainerVariants = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  return (
    <div className="min-h-screen bg-cream text-darkGreen">
      <main>
        {/* Hero Section */}
        <motion.section
          className="relative w-full h-[calc(100vh-6rem)] flex items-center justify-center text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {isLoading ? (
            <div className="absolute inset-0 bg-beige animate-pulse" />
          ) : (
            <>
              {categoryImages.find((c) => c.category === "hero")?.contentType === "video" ? (
                <video
                  src={categoryImages.find((c) => c.category === "hero")?.videoUrl || "/placeholder.svg?height=1080&width=1920"}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Video playback error:', e)
                    e.currentTarget.poster = "/placeholder.svg?height=1080&width=1920"
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Image
                  src={categoryImages.find((c) => c.category === "hero")?.imageUrls?.[currentSlide]?.url || "/placeholder.svg?height=1080&width=1920"}
                  alt="Hero background"
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => { e.currentTarget.src = "/placeholder.svg?height=1080&width=1920" }}
                />
              )}
              {categoryImages.find((c) => c.category === "hero")?.contentType === "images" && categoryImages.find((c) => c.category === "hero")?.imageUrls && categoryImages.find((c) => c.category === "hero")?.imageUrls!.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {categoryImages.find((c) => c.category === "hero")?.imageUrls!.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-cream' : 'bg-cream/50'}`}
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          <div className="absolute inset-0 bg-darkGreen/50 flex flex-col items-center justify-center p-4">
            {heroBrandNameStyle.visible && (
              <motion.h1
                className={`font-serif uppercase tracking-wide mb-6 drop-shadow-lg italic ${typeof heroBrandNameStyle.fontSize === 'string' && heroBrandNameStyle.fontSize.match(/^[0-9.]+(rem|px|em)$/) ? '' : `text-${heroBrandNameStyle.fontSize}`}`}
                variants={fadeInVariants}
                initial="initial"
                animate="whileInView"
                style={{
                  fontFamily: heroBrandNameStyle.fontFamily,
                  color: heroBrandNameStyle.color,
                  fontSize: heroBrandNameStyle.fontSize.match(/^[0-9.]+(rem|px|em)$/) ? heroBrandNameStyle.fontSize : undefined
                }}
              >
                {heroBrandName}
              </motion.h1>
            )}
            {heroSubtitleStyle.visible && (
              <motion.p
                className={`max-w-2xl mb-8 drop-shadow-md ${typeof heroSubtitleStyle.fontSize === 'string' && heroSubtitleStyle.fontSize.match(/^[0-9.]+(rem|px|em)$/) ? '' : `text-${heroSubtitleStyle.fontSize}`}`}
                variants={fadeInVariants}
                initial="initial"
                animate="whileInView"
                transition={{ delay: 0.2, duration: 0.8 }}
                style={{
                  fontFamily: heroSubtitleStyle.fontFamily,
                  color: heroSubtitleStyle.color,
                  fontSize: heroSubtitleStyle.fontSize.match(/^[0-9.]+(rem|px|em)$/) ? heroSubtitleStyle.fontSize : undefined
                }}
              >
                {heroSubtitle}
              </motion.p>
            )}
            <motion.div
              variants={fadeInVariants}
              initial="initial"
              animate="whileInView"
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {heroButton.enabled && (
                <Link href={heroButton.url || "/collections"}>
                  <Button className="bg-darkGreen text-cream hover:bg-mocha px-8 py-6 text-lg uppercase font-semibold">
                    {heroButton.text || "Shop Now"}
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </motion.section>

        {/* Featured Categories/Collections */}
        <motion.section
          className="container mx-auto px-6 py-16"
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainerVariants}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-darkGreen text-center mb-12">Shop Categories</h2>
          {error ? (
            <div className="text-center text-red-500 py-8">
              <p className="mb-2">Error loading images: {error}</p>
              <Button onClick={() => window.location.reload()}>Try Reloading</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div variants={itemVariants}>
                <Link href="/collections/new-arrivals">
                  <div className="group relative overflow-hidden rounded-xl shadow-lg bg-cream p-1 transition-all duration-300">
                    <div className="relative w-full h-80 overflow-hidden rounded-lg">
                      {isLoading ? (
                        <div className="w-full h-full bg-beige animate-pulse" />
                      ) : (
                        <Image
                          src={categoryImages.find((c) => c.category === "new-arrivals")?.imageUrls?.[0]?.url || "/placeholder.svg?height=600&width=800"}
                          alt="New Arrivals"
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => { e.currentTarget.src = "/placeholder.svg?height=600&width=800" }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center p-8 text-cream">
                      <h4 className="text-2xl sm:text-3xl font-semibold text-cream mb-4 drop-shadow-lg text-center" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>New Arrivals</h4>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-darkGreen text-cream px-6 py-2 rounded-full font-semibold text-base shadow-lg mt-2">Shop Now</button>
                    </div>
                    <div className="absolute top-4 right-4 bg-bronze text-cream px-3 py-1 text-xs font-medium uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full shadow">New</div>
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link href="/collections/men">
                  <div className="group relative overflow-hidden rounded-xl shadow-lg bg-cream p-1 transition-all duration-300">
                    <div className="relative w-full h-80 overflow-hidden rounded-lg">
                      {isLoading ? (
                        <div className="w-full h-full bg-beige animate-pulse" />
                      ) : (
                        <Image
                          src={categoryImages.find((c) => c.category === "men")?.imageUrls?.[0]?.url || "/placeholder.svg?height=600&width=800"}
                          alt="Men's Collection"
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => { e.currentTarget.src = "/placeholder.svg?height=600&width=800" }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center p-8 text-cream">
                      <h4 className="text-2xl sm:text-3xl font-semibold text-cream mb-4 drop-shadow-lg text-center" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>Men's</h4>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-darkGreen text-cream px-6 py-2 rounded-full font-semibold text-base shadow-lg mt-2">Shop Now</button>
                    </div>
                    <div className="absolute top-4 right-4 bg-darkGreen text-cream px-3 py-1 text-xs font-medium uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full shadow">Popular</div>
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link href="/collections/women">
                  <div className="group relative overflow-hidden rounded-xl shadow-lg bg-cream p-1 transition-all duration-300">
                    <div className="relative w-full h-80 overflow-hidden rounded-lg">
                      {isLoading ? (
                        <div className="w-full h-full bg-beige animate-pulse" />
                      ) : (
                        <Image
                          src={categoryImages.find((c) => c.category === "women")?.imageUrls?.[0]?.url || "/placeholder.svg?height=600&width=800"}
                          alt="Women's Collection"
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => { e.currentTarget.src = "/placeholder.svg?height=600&width=800" }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center p-8 text-cream">
                      <h4 className="text-2xl sm:text-3xl font-semibold text-cream mb-4 drop-shadow-lg text-center" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>Women's</h4>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-darkGreen text-cream px-6 py-2 rounded-full font-semibold text-base shadow-lg mt-2">Shop Now</button>
                    </div>
                    <div className="absolute top-4 right-4 bg-olive text-cream px-3 py-1 text-xs font-medium uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full shadow">Trending</div>
                  </div>
                </Link>
              </motion.div>
            </div>
          )}
        </motion.section>

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Newsletter */}
        <Newsletter />
      </main>
    </div>
  )
}
 