"use client"

import React, { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { PromotionForm } from "./PromotionForm"

const API_BASE_URL = "https://arister.onrender.com/api"

interface Promotion {
  _id: string
  code: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  isActive: boolean
  minPurchase: number
  usageLimit?: number
  timesUsed: number
  startDate?: string
  endDate?: string
}

const initialFormState: Partial<Promotion> = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: 10,
  minPurchase: 0,
  isActive: true,
  startDate: new Date().toISOString().split('T')[0],
  endDate: "",
  usageLimit: 100,
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddMode, setIsAddMode] = useState(true)
  const [formState, setFormState] = useState(initialFormState)
  const { toast } = useToast()

  const fetchPromotions = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${API_BASE_URL}/promotions`)
      setPromotions(data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch promotions.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchPromotions()
  }, [fetchPromotions])

  const handleOpenForm = (promo: Partial<Promotion> | null) => {
    if (promo) {
      setIsAddMode(false)
      setFormState(promo)
    } else {
      setIsAddMode(true)
      setFormState(initialFormState)
    }
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const url = isAddMode ? `${API_BASE_URL}/promotions` : `${API_BASE_URL}/promotions/${formState._id}`
    const method = isAddMode ? "post" : "put"
    try {
      await axios[method](url, formState)
      toast({ title: "Success", description: `Promotion ${isAddMode ? 'created' : 'updated'}.` })
      fetchPromotions()
      setIsFormOpen(false)
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || 'An error occurred.', variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this promotion?")) {
      try {
        await axios.delete(`${API_BASE_URL}/promotions/${id}`)
        toast({ title: "Success", description: "Promotion deleted." })
        fetchPromotions()
      } catch (error: any) {
        toast({ title: "Error", description: error.response?.data?.message || 'Failed to delete.', variant: "destructive" })
      }
    }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Promotions</h1>
        <Button onClick={() => handleOpenForm(null)}>
          <Plus className="mr-2 h-4 w-4" /> Add Promotion
        </Button>
      </div>
      {loading ? <p>Loading...</p> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Used/Limit</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((promo) => (
              <TableRow key={promo._id}>
                <TableCell>{promo.code}</TableCell>
                <TableCell>{promo.description}</TableCell>
                <TableCell>{promo.discountType === 'percentage' ? `${promo.discountValue}%` : `₹${promo.discountValue}`}</TableCell>
                <TableCell>
                  <Badge variant={promo.isActive ? "default" : "secondary"}>
                    {promo.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{promo.timesUsed} / {promo.usageLimit ?? '∞'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleOpenForm(promo)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(promo._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <PromotionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        formState={formState}
        setFormState={setFormState}
        isSubmitting={isSubmitting}
        isAddMode={isAddMode}
      />
    </div>
  )
} 
