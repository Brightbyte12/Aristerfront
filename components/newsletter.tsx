"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { subscribeToNewsletter } from "@/lib/api"

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await subscribeToNewsletter(email)
      toast({
        title: "Subscribed!",
        description: "You've successfully subscribed to our newsletter.",
      })
      setEmail("")
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast({
          title: "Already Subscribed",
          description: "This email is already subscribed to our newsletter.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Subscription Failed",
          description: error?.response?.data?.message || "An error occurred. Please try again later.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mt-10 sm:mt-16 lg:mt-20 bg-beige py-8 sm:py-12 lg:py-16 mx-4 sm:mx-8 lg:mx-16 xl:mx-24 animate-fade-in rounded-lg sm:rounded-xl lg:rounded-2xl">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-8 lg:px-16 xl:px-24">
        <Mail className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-bronze mx-auto mb-4 sm:mb-6 animate-bounce-in" />
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-darkGreen mb-3 sm:mb-4 animate-slide-up">Join Our Newsletter</h3>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto animate-slide-up animation-delay-200">
          Stay updated with our latest collections, exclusive offers, and cultural insights.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-sm sm:max-w-md mx-auto animate-slide-up animation-delay-400"
        >
          <Input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="bg-darkGreen hover:bg-olive h-10 sm:h-12 px-3 sm:px-4 py-2 text-sm sm:text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  )
}
