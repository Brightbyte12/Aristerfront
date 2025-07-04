// src/app/admin/categories/page.tsx
"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, X, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios"; // Assuming axios is configured globally

// Define Category interface
interface Category {
  _id: string; // Using _id for MongoDB compatibility
  name: string;
}

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true); // For initial data load

  const { state } = useAuth();
  const router = useRouter();

  // --- Authorization Check for this specific page ---
  useEffect(() => {
    if (state.isLoading) {
      return; // Still loading auth state
    }

    if (!state.isAuthenticated || state.user?.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access category management.",
        variant: "destructive",
      });
      router.push("/login"); // Redirect to login
    } else {
      fetchCategories(); // If authorized, fetch categories
    }
  }, [state.isLoading, state.isAuthenticated, state.user, router]);


  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      // Replace with your actual backend API endpoint for fetching categories
      const response = await axios.get<Category[]>("/api/categories");
      setCategories(response.data);
      console.log("Fetched categories:", response.data);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch categories.",
        variant: "destructive",
      });
      setCategories([]); // Clear categories on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddOrUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast({
        title: "Input Required",
        description: "Category name cannot be empty.",
        variant: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        // Update existing category
        // Replace with your actual backend API endpoint for updating a category
        const response = await axios.put<Category>(`/api/categories/${editingCategory._id}`, { name: newCategoryName.trim() });
        setCategories((prev) =>
          prev.map((cat) =>
            cat._id === editingCategory._id ? response.data : cat
          )
        );
        toast({ title: "Success", description: "Category updated successfully!" });
      } else {
        // Add new category
        // Replace with your actual backend API endpoint for adding a category
        const response = await axios.post<Category>("/api/categories", { name: newCategoryName.trim() });
        setCategories((prev) => [...prev, response.data]);
        toast({ title: "Success", description: "Category added successfully!" });
      }
      setNewCategoryName("");
      setEditingCategory(null); // Exit editing mode
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save category.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    setIsSubmitting(true);
    try {
      // Replace with your actual backend API endpoint for deleting a category
      await axios.delete(`/api/categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      toast({ title: "Success", description: "Category deleted successfully!" });
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete category.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
  };

  // If Auth is still loading, show a general loading message
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
        <span className="ml-2 text-lg text-emerald-700">Loading...</span>
      </div>
    );
  }

  // If user is not authenticated or not admin, show access denied
  if (!state.isAuthenticated || state.user?.role !== "admin") {
    return (
      <div className="container-responsive py-16 text-center">
        <h1 className="text-responsive-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
        <p className="text-responsive-base text-gray-600 mb-8">You do not have permission to access this page.</p>
        <Link href="/login">
          <Button className="bg-emerald-700 hover:bg-emerald-800 btn-responsive">Go to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Add/Edit Form */}
          <form onSubmit={handleAddOrUpdateCategory} className="space-y-4">
            <div>
              <Label htmlFor="category-name">Category Name</Label>
              <div className="flex space-x-2">
                <Input
                  id="category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  disabled={isSubmitting}
                  required
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingCategory ? "Update Category" : "Add Category"}
                </Button>
                {editingCategory && (
                  <Button variant="outline" onClick={() => {
                    setEditingCategory(null)
                    setNewCategoryName("")
                  }} disabled={isSubmitting}>
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                )}
              </div>
            </div>
          </form>

          {/* Category List */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold mb-4">Existing Categories</h4>
            {isLoading ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-700" />
                <span className="ml-2 text-lg text-emerald-700">Loading categories...</span>
              </div>
            ) : categories.length === 0 ? (
              <p className="text-gray-500">No categories added yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell className="font-medium">{category._id}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(category)}
                          className="mr-2"
                          disabled={isSubmitting}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCategory(category._id)} // Pass _id for deletion
                          disabled={isSubmitting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
