"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface PromotionFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  formState: any
  setFormState: (state: any) => void
  isSubmitting: boolean
  isAddMode: boolean
}

export const PromotionForm: React.FC<PromotionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formState,
  setFormState,
  isSubmitting,
  isAddMode,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormState({
      ...formState,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormState({
      ...formState,
      [name]: value,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isAddMode ? "Add Promotion" : "Edit Promotion"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">Promotion Code</Label>
            <Input
              id="code"
              name="code"
              value={formState.code}
              onChange={handleChange}
              required
              className="uppercase"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formState.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="discountType">Discount Type</Label>
              <Select
                name="discountType"
                value={formState.discountType}
                onValueChange={(value) => handleSelectChange("discountType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="discountValue">Value</Label>
              <Input
                id="discountValue"
                name="discountValue"
                type="number"
                value={formState.discountValue}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formState.startDate ? new Date(formState.startDate).toISOString().split('T')[0] : ''}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formState.endDate ? new Date(formState.endDate).toISOString().split('T')[0] : ''}
                onChange={handleChange}
              />
            </div>
          </div>
           <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="minPurchase">Minimum Purchase</Label>
                <Input
                  id="minPurchase"
                  name="minPurchase"
                  type="number"
                  value={formState.minPurchase}
                  onChange={handleChange}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  name="usageLimit"
                  type="number"
                  value={formState.usageLimit}
                  onChange={handleChange}
                />
              </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              name="isActive"
              checked={formState.isActive}
              onCheckedChange={(checked) => handleSelectChange("isActive", String(checked))}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 