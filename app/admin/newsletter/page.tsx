"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { API_BASE_URL } from "@/lib/api"

interface NewsletterSubscriber {
  _id: string
  email: string
  created: string
}

export default function NewsletterAdminPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscribers = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE_URL}/newsletter`, { credentials: "include" })
        if (!res.ok) throw new Error((await res.json()).message || "Failed to fetch subscribers")
        const data = await res.json()
        setSubscribers(data)
      } catch (err: any) {
        setError(err.message)
        toast({ title: "Error", description: err.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchSubscribers()
  }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
        <a
          href={`${API_BASE_URL}/newsletter/export`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-darkGreen text-white px-4 py-2 rounded hover:bg-olive transition-colors text-sm font-medium"
        >
          Export CSV
        </a>
      </div>
      <Card>
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Subscribed At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">No subscribers found.</TableCell>
                </TableRow>
              ) : (
                subscribers.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{new Date(s.created).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
} 