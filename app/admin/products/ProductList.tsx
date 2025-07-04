import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2 } from "lucide-react";
import { updateProductFeaturedStatus } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

// Product Interface
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number | null;
  discountPercentage?: number | null;
  stock: number;
  status?: string;
  imageUrl?: string[] | null;
  isFeatured?: boolean;
  colorImages?: { color: string; images: { url: string; publicId: string }[] }[];
  variants?: { color: string; size?: string; stock: number }[];
}

interface ProductListProps {
  products: Product[];
  onEdit: (id: string) => void;
  onDelete: (product: Product) => void;
  onUpdate?: () => void;
}

// Add a color map for common and custom color names
const colorMap: Record<string, string> = {
  red: "#ff0000",
  blue: "#0000ff",
  green: "#008000",
  black: "#000000",
  white: "#ffffff",
  yellow: "#ffff00",
  orange: "#ffa500",
  pink: "#ffc0cb",
  purple: "#800080",
  brown: "#a52a2a",
  gray: "#808080",
  grey: "#808080",
  // Add more as needed
};

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete, onUpdate }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggleFeatured = async (product: Product) => {
    console.log(`Toggling isFeatured for product: ${product.id}, current: ${product.isFeatured}`); // Debug
    setLoading(product.id);
    try {
      await updateProductFeaturedStatus(product.id, !product.isFeatured);
      toast({
        title: "Success",
        description: `Product ${product.isFeatured ? "removed from" : "added to"} featured list`,
      });
      if (onUpdate) {
        console.log("Calling onUpdate to refresh products"); // Debug
        onUpdate();
      }
    } catch (error: any) {
      console.error('Failed to update featured status:', error.response?.data || error.message);
      toast({
        title: "Error",
        description: "Failed to update featured status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Table className="min-w-full divide-y divide-gray-200">
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</TableHead>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</TableHead>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</TableHead>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</TableHead>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Price</TableHead>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</TableHead>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sizes</TableHead>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Stock</TableHead>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colors</TableHead>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</TableHead>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="bg-white divide-y divide-gray-200">
        {products.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
              No products available.
            </TableCell>
          </TableRow>
        ) : (
          products.map((product) => (
            <TableRow key={product.id} className="hover:bg-gray-50">
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <img
                  src={
                    (product.colorImages && product.colorImages.length > 0 && product.colorImages[0].images && product.colorImages[0].images.length > 0)
                      ? product.colorImages[0].images[0].url
                      : (product.imageUrl && product.imageUrl[0]) || "/placeholder.svg"
                  }
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-md border border-gray-200"
                />
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.name}</TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-gray-600">{product.category}</TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-gray-900">
                ₹{product.price.toFixed(2)}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                {product.salePrice !== undefined && product.salePrice !== null ? (
                  <span className="font-semibold text-green-600">₹{product.salePrice.toFixed(2)}</span>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                {product.discountPercentage !== undefined && product.discountPercentage !== null ? (
                  <Badge variant="secondary">{product.discountPercentage}% OFF</Badge>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                {/* Show all sizes from variants */}
                {product.variants && product.variants.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {[...new Set(product.variants.map(v => v.size).filter(Boolean))].map((size, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {size}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                {/* Show total stock from variants with better formatting */}
                {product.variants && product.variants.length > 0 ? (
                  <div className="space-y-1">
                    <Badge variant={product.variants.reduce((sum, v) => sum + (v.stock || 0), 0) < 10 ? "destructive" : "default"}>
                      {product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)} total
                    </Badge>
                    <div className="text-xs text-gray-500">
                      {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Badge variant={(product.stock || 0) < 10 ? "destructive" : "default"}>
                      {product.stock || 0} in stock
                    </Badge>
                    <div className="text-xs text-gray-500">No variants</div>
                  </div>
                )}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                {/* Render color swatches from variants or colorImages */}
                <div className="flex flex-wrap gap-1">
                  {Array.from(new Set(
                    (product.variants?.map(v => v.color) || [])
                      .concat(product.colorImages?.map(ci => ci.color) || [])
                      .filter(Boolean)
                  )).map((color, idx) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: colorMap[color.toLowerCase()] || color.toLowerCase() || "#ccc",
                        border: "1px solid #888",
                        display: "inline-block",
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        marginRight: 4,
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <Checkbox
                  checked={product.isFeatured || false}
                  onCheckedChange={() => {
                    console.log(`Checkbox clicked for product: ${product.id}`); // Debug
                    handleToggleFeatured(product);
                  }}
                  disabled={loading === product.id}
                  className="touch-target data-[state=checked]:bg-darkGreen data-[state=checked]:border-darkGreen cursor-pointer"
                />
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex space-x-2">
                  <Button size="icon" variant="outline" onClick={() => onEdit(product.id)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => onDelete(product)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ProductList;