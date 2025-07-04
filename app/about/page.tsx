import Link from "next/link"
import { ArrowRight, Heart, Users, Leaf, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left Section: Heading and Line */}
          <div className="flex flex-col items-start md:items-start">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight text-darkGreen">
              About <br /> Arister
            </h1>
            <div className="w-20 h-1 bg-bronze mt-4 md:mt-6"></div>
          </div>

          {/* Right Section: Description and Link */}
          <div className="flex flex-col items-start md:items-end text-left md:text-right">
            <p className="text-lg md:text-xl leading-relaxed text-gray-600 max-w-xl">
              {'Fashion is the armor to survive the reality of everyday life", is the expression that'}
              {"resonates within every fashion enthusiast's heart. The exquisite designs, handcrafted"}
              {"garments, and cultural heritage celebrated at Arister become an inseparable part"}
              {"of your style and identity."}
            </p>
            <Link href="/collections" className="mt-6 text-bronze hover:underline flex items-center group">
              <span className="text-lg md:text-xl">Learn more</span>
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-darkGreen text-center mb-12">Our Story</h2>
          <div className="space-y-8 text-lg leading-relaxed text-gray-700">
            <p>
              Founded with a passion for preserving traditional craftsmanship while embracing contemporary design,
              Arister represents the perfect fusion of heritage and modernity. Our journey began with a simple
              belief: that clothing should tell a story, connect cultures, and celebrate the artistry of skilled hands.
            </p>
            <p>
              Every piece in our collection is thoughtfully curated, working directly with artisans who have mastered
              their craft through generations. We believe in fair trade practices, sustainable materials, and creating
              garments that not only look beautiful but also carry the soul of their makers.
            </p>
            <p>
              From the bustling workshops of traditional weavers to the modern fashion-conscious consumer, Arister
                              Arister bridges the gap between authentic craftsmanship and contemporary style. We are more than a fashion
              brand; we are storytellers, culture preservers, and advocates for ethical fashion.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-cream">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-darkGreen text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 text-bronze mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-darkGreen mb-3">Craftsmanship</h3>
                <p className="text-gray-600">
                  Every piece is handcrafted with love and attention to detail by skilled artisans.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <Leaf className="w-12 h-12 text-bronze mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-darkGreen mb-3">Sustainability</h3>
                <p className="text-gray-600">
                  We use eco-friendly materials and sustainable practices in all our processes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-bronze mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-darkGreen mb-3">Community</h3>
                <p className="text-gray-600">
                  Supporting artisan communities and preserving traditional techniques for future generations.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <Award className="w-12 h-12 text-bronze mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-darkGreen mb-3">Quality</h3>
                <p className="text-gray-600">
                  Uncompromising quality in materials, construction, and design in every garment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-darkGreen text-cream">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Join Our Journey</h2>
          <p className="text-xl leading-relaxed mb-8 text-beige">
            Discover the beauty of handcrafted fashion and become part of a community that values tradition,
            sustainability, and authentic style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/collections"
              className="bg-bronze text-cream px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              Explore Collections
            </Link>
            <Link
              href="/contact"
              className="border-2 border-cream text-cream px-8 py-3 rounded-lg font-semibold hover:bg-cream hover:text-darkGreen transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section> */}
    </main>
  )
}
