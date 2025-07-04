'use client';
import { useEffect, useState } from "react";
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function SizeGuidePage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/content-pages/slug/size-guide`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setTitle(data.title);
        setContent(data.content);
      } catch (err) {
        setError("Size Guide not found.");
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
            This is a placeholder for your Size Guide. You can provide detailed sizing charts, measurement tips, and fit information to help customers choose the right size.
          </p>
          <p>
            For personalized help, please <Link href="/contact" className="text-bronze underline">contact us</Link>.
          </p>
        </div>
      </div>
    </main>
  );
} 