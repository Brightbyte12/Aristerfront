import Link from "next/link"

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-cream py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-darkGreen mb-8 text-center">Shipping & Returns</h1>
        <div className="space-y-6 text-lg text-gray-700">
          <p>
            This is a placeholder for your Shipping & Returns policy. Here you can describe your shipping methods, delivery times, return process, and any important information for your customers.
          </p>
          <p>
            For questions, please <Link href="/contact" className="text-bronze underline">contact us</Link>.
          </p>
        </div>
      </div>
    </main>
  )
} 