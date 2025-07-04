import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us - Prakriti",
  description:
    "Get in touch with Prakriti. We're here to help with your questions about our handcrafted clothing and cultural heritage fashion.",
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 