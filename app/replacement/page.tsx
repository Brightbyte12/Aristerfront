import Link from "next/link"

export default function ReplacementPage() {
  return (
    <main className="min-h-screen bg-cream py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-darkGreen mb-8 text-center">Replacement Policy</h1>
        <div className="space-y-6 text-lg text-gray-700">
          <p>
            This is a placeholder for your Replacement Policy. Here you can explain the conditions and process for product replacements, including eligibility and timelines.
          </p>
          <p>
            For more information, please <Link href="/contact" className="text-bronze underline">contact us</Link>.
          </p>
        </div>
      </div>
    </main>
  )
} 