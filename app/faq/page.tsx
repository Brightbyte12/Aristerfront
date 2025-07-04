'use client';
import { useEffect, useState } from "react";
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function FAQPage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/content-pages/slug/faq`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setTitle(data.title);
        setContent(data.content);
      } catch (err) {
        setError("FAQ not found.");
      }
      setLoading(false);
    };
    fetchContent();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <main className="min-h-screen bg-cream py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-darkGreen mb-8 text-center">{title}</h1>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        <div className="space-y-6 text-lg text-gray-700">
          <p>
            This is a placeholder for your FAQ. You can answer common customer questions about orders, shipping, returns, sizing, and more.
          </p>
          <p>
            Can't find your answer? <Link href="/contact" className="text-bronze underline">Contact us</Link> for help.
          </p>
        </div>
      </div>
    </main>
  );
} 