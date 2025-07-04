"use client";

import { Facebook, Instagram, Linkedin } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import axios from "axios"

interface BrandSettings {
  brandName: string;
  brandLogo: string;
  logoWidth: number;
  brandFont: string;
}

export default function Footer() {
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    brandName: "ARISTER",
    brandLogo: "",
    logoWidth: 80,
    brandFont: 'inherit',
  });

  useEffect(() => {
    const fetchBrandSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings/public');
        if (data) {
          setBrandSettings({
            brandName: data.brandName || "ARISTER",
            brandLogo: data.brandLogo || "",
            logoWidth: data.logoWidth || 80,
            brandFont: data.brandFont || 'inherit',
          });
        }
      } catch (error) {
        console.error("Error fetching brand settings for footer:", error);
      }
    };
    fetchBrandSettings();
  }, []);

  return (
    <footer className="mt-16 sm:mt-20 py-8 sm:py-12 border-t border-mocha animate-fade-in safe-area-inset-bottom">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
          <div className="animate-slide-up">
            <Link href="/" className="flex items-center gap-1 sm:gap-4 mb-1">
              {brandSettings.brandLogo ? (
                 <img 
                   src={brandSettings.brandLogo} 
                   alt={`${brandSettings.brandName} Logo`} 
                   style={{ width: `${brandSettings.logoWidth}px`, height: 'auto' }}
                   className="h-auto" 
                 />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-darkGreen flex items-center justify-center flex-shrink-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-cream"></div>
                </div>
              )}
              <div>
                <h5 
                  className="font-bold text-darkGreen text-base sm:text-lg"
                  style={{ fontFamily: brandSettings.brandFont }}
                >
                   Arister
                </h5>
                <p className="text-xs sm:text-sm text-gray-600">Fashion & Cultural Heritage</p>
              </div>
            </Link>
            <p className="text-gray-600 text-xs sm:text-sm mt-4">
              Celebrating the rich cultural heritage through contemporary fashion designs.
            </p>
            <div className="flex items-center gap-3 sm:gap-4 mt-4">
              <Link href="#" className="text-gray-600 hover:text-darkGreen touch-target" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-darkGreen touch-target" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-darkGreen touch-target" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="animate-slide-up animation-delay-100">
            <h5 className="font-semibold text-darkGreen mb-4 text-base sm:text-lg">Shop</h5>
            <ul className="space-y-2">
              <li>
                <Link href="/collections" className="text-gray-600 hover:text-darkGreen text-xs sm:text-sm">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/collections/women" className="text-gray-600 hover:text-darkGreen text-xs sm:text-sm">
                  Women's Wear
                </Link>
              </li>
              <li>
                <Link href="/collections/men" className="text-gray-600 hover:text-darkGreen text-xs sm:text-sm">
                  Men's Wear
                </Link>
              </li>
            </ul>
          </div>

          <div className="animate-slide-up animation-delay-200">
            <h5 className="font-semibold text-darkGreen mb-4 text-base sm:text-lg">Customer Service</h5>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-darkGreen text-xs sm:text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-darkGreen text-xs sm:text-sm">
                  Shipping & Replacement Policy
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-gray-600 hover:text-darkGreen text-xs sm:text-sm">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-darkGreen text-xs sm:text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div className="animate-slide-up animation-delay-300">
            <h5 className="font-semibold text-darkGreen mb-4 text-base sm:text-lg">About Us</h5>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-darkGreen text-xs sm:text-sm">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-darkGreen text-xs sm:text-sm">
                  Vision & Mission
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-darkGreen text-xs sm:text-sm">
                  Our Arister
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-mocha mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <p className="text-gray-500 text-xs sm:text-sm mb-4 md:mb-0">&copy; 2025 {brandSettings.brandName}. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="text-gray-600 hover:text-darkGreen text-xs sm:text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-gray-600 hover:text-darkGreen text-xs sm:text-sm">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-darkGreen text-xs sm:text-sm">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
