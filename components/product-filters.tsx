// src/components/product-filters.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Filter, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"; // <-- Add this import for Badge

// Define the shape of the filters object that will be passed back to the parent
interface Filters {
  selectedCategories: string[]
  priceRange: number[]
  selectedSizes: string[]
  selectedColors: string[]
  sortBy: string
  showOnSale: boolean
  showNewOnly: boolean
  // Added new filter types
  selectedMaterials: string[]
  selectedFits: string[];
}

interface ProductFiltersProps {
  availableCategories: string[]
  availableSizes: string[]
  availableColors: { name: string; hex: string }[]
  // New props for additional filter types
  availableMaterials: { id: string; label: string; count: number }[]
  availableFits: { id: string; label: string; count: number }[]
  
  onFiltersChange: (filters: Filters) => void
  initialFilters?: Filters;
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

const ProductFilters: React.FC<ProductFiltersProps> = ({
  availableCategories = [],
  availableSizes = [],
  availableColors = [],
  availableMaterials = [], // New prop
  availableFits = [],       // New prop
  onFiltersChange,
  initialFilters,
}) => {
  // Internal filter states, initialized either from props or defaults
  const [sortBy, setSortBy] = useState<string>(initialFilters?.sortBy || "popular")
  const [priceRange, setPriceRange] = useState<number[]>(initialFilters?.priceRange || [0, 10000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters?.selectedCategories || [])
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialFilters?.selectedSizes || [])
  const [selectedColors, setSelectedColors] = useState<string[]>(initialFilters?.selectedColors || [])
  const [showOnSale, setShowOnSale] = useState<boolean>(initialFilters?.showOnSale || false)
  const [showNewOnly, setShowNewOnly] = useState<boolean>(initialFilters?.showNewOnly || false)
  // New filter states
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(initialFilters?.selectedMaterials || [])
  const [selectedFits, setSelectedFits] = useState<string[]>(initialFilters?.selectedFits || [])


  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  // Use useEffect to update internal state if initialFilters prop changes
  useEffect(() => {
    if (initialFilters) {
      setSortBy(initialFilters.sortBy || "popular");
      setPriceRange(initialFilters.priceRange || [0, 10000]);
      setSelectedCategories(initialFilters.selectedCategories || []);
      setSelectedSizes(initialFilters.selectedSizes || []);
      setSelectedColors(initialFilters.selectedColors || []);
      setShowOnSale(initialFilters.showOnSale || false);
      setShowNewOnly(initialFilters.showNewOnly || false);
      setSelectedMaterials(initialFilters.selectedMaterials || []); // Update new state
      setSelectedFits(initialFilters.selectedFits || []);           // Update new state
    }
  }, [initialFilters]);

  // Function to apply filters (calls the parent's onFiltersChange)
  const applyFilters = () => {
    onFiltersChange({
      selectedCategories,
      priceRange,
      selectedSizes,
      selectedColors,
      sortBy,
      showOnSale,
      showNewOnly,
      selectedMaterials, // Include new filters
      selectedFits,       // Include new filters
    })
  }

  // Count active filters (for display, e.g., "Filters (3)")
  const activeFiltersCount = [
    ...selectedCategories,
    ...selectedMaterials, // Include in count
    ...selectedFits,      // Include in count
    ...selectedSizes,
    ...selectedColors,
    (priceRange[0] > 0 || priceRange[1] < 10000) ? "price" : null,
    showOnSale ? "sale" : null,
    showNewOnly ? "new" : null,
  ].filter(Boolean).length

  // Component to render filter sections (reused for desktop and mobile overlay)
  const FilterSectionContent = ({ onApply }: { onApply: () => void }) => (
    <div className="p-4 space-y-6">
      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base text-gray-800">Active Filters ({activeFiltersCount})</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Clear all internal states
                setSortBy("popular");
                setPriceRange([0, 10000]);
                setSelectedCategories([]);
                setSelectedSizes([]);
                setSelectedColors([]);
                setShowOnSale(false);
                setShowNewOnly(false);
                setSelectedMaterials([]); // Clear new state
                setSelectedFits([]);       // Clear new state

                // Immediately apply clear filters to parent
                onFiltersChange({
                  selectedCategories: [],
                  priceRange: [0, 10000],
                  selectedSizes: [],
                  selectedColors: [],
                  sortBy: "popular",
                  showOnSale: false,
                  showNewOnly: false,
                  selectedMaterials: [], // Clear new filters for parent
                  selectedFits: [],       // Clear new filters for parent
                });
                if (isMobileFilterOpen) setIsMobileFilterOpen(false); // Close mobile filter if open
              }}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge key={category} variant="secondary" className="flex items-center gap-1 text-xs">
                {category}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSelectedCategories((prev) => prev.filter((c) => c !== category))}
                />
              </Badge>
            ))}
            {selectedMaterials.map((materialId) => (
                <Badge key={materialId} variant="secondary" className="flex items-center gap-1 text-xs">
                    {availableMaterials.find(m => m.id === materialId)?.label || materialId}
                    <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setSelectedMaterials((prev) => prev.filter((m) => m !== materialId))}
                    />
                </Badge>
            ))}
            {selectedFits.map((fitId) => (
                <Badge key={fitId} variant="secondary" className="flex items-center gap-1 text-xs">
                    {availableFits.find(f => f.id === fitId)?.label || fitId}
                    <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setSelectedFits((prev) => prev.filter((f) => f !== fitId))}
                    />
                </Badge>
            ))}
            {selectedSizes.map((size) => (
              <Badge key={size} variant="secondary" className="flex items-center gap-1 text-xs">
                {size}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSelectedSizes((prev) => prev.filter((s) => s !== size))}
                />
              </Badge>
            ))}
            {selectedColors.map((color) => (
              <Badge key={color} variant="secondary" className="flex items-center gap-1 text-xs">
                {color}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setSelectedColors((prev) => prev.filter((c) => c !== color))}
                />
              </Badge>
            ))}
            {(priceRange[0] > 0 || priceRange[1] < 10000) && (
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                Price: ₹{priceRange[0]} - ₹{priceRange[1]}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setPriceRange([0, 10000])}
                />
              </Badge>
            )}
            {showOnSale && (
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                On Sale
                <X className="w-3 h-3 cursor-pointer" onClick={() => setShowOnSale(false)} />
              </Badge>
            )}
            {showNewOnly && (
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                New Arrivals
                <X className="w-3 h-3 cursor-pointer" onClick={() => setShowNewOnly(false)} />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Sort Section */}
      <div>
        <h3 className="font-medium mb-3 text-gray-800">Sort By</h3>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Popular</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Customer Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="mt-6">
        <h3 className="font-medium mb-3 text-gray-800">Price Range</h3>
        <div className="space-y-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={10000} // Max price can be adjusted based on your product data
            min={0}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-6">
        <h3 className="font-medium mb-3 text-gray-800">Categories</h3>
        <div className="space-y-2">
          {availableCategories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, category])
                  } else {
                    setSelectedCategories(selectedCategories.filter((c) => c !== category))
                  }
                }}
              />
              <Label htmlFor={category} className="text-sm">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Materials Filter */}
      <div className="mt-6">
        <h3 className="font-medium mb-3 text-gray-800">Material</h3>
        <div className="space-y-2">
          {availableMaterials.map((material) => (
            <div key={material.id} className="flex items-center space-x-2">
              <Checkbox
                id={`material-${material.id}`}
                checked={selectedMaterials.includes(material.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedMaterials([...selectedMaterials, material.id])
                  } else {
                    setSelectedMaterials(selectedMaterials.filter((m) => m !== material.id))
                  }
                }}
              />
              <Label htmlFor={`material-${material.id}`} className="text-sm">
                {material.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Fits Filter */}
      <div className="mt-6">
        <h3 className="font-medium mb-3 text-gray-800">Fit</h3>
        <div className="space-y-2">
          {availableFits.map((fit) => (
            <div key={fit.id} className="flex items-center space-x-2">
              <Checkbox
                id={`fit-${fit.id}`}
                checked={selectedFits.includes(fit.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedFits([...selectedFits, fit.id])
                  } else {
                    setSelectedFits(selectedFits.filter((f) => f !== fit.id))
                  }
                }}
              />
              <Label htmlFor={`fit-${fit.id}`} className="text-sm">
                {fit.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="mt-6">
        <h3 className="font-medium mb-3 text-gray-800">Sizes</h3>
        <div className="grid grid-cols-2 gap-2">
          {availableSizes.map((size) => (
            <Button
              key={size}
              variant={selectedSizes.includes(size) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (selectedSizes.includes(size)) {
                  setSelectedSizes(selectedSizes.filter((s) => s !== size))
                } else {
                  setSelectedSizes([...selectedSizes, size])
                }
              }}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="mt-6">
        <h3 className="font-medium mb-3 text-gray-800">Colors</h3>
        <div className="grid grid-cols-3 gap-2">
          {availableColors.map((color) => {
            const isSelected = selectedColors.includes(color.name);
            const swatchColor = colorMap[color.name.toLowerCase()] || color.hex || color.name.toLowerCase() || "#ccc";
            return (
              <button
                key={color.name}
                className={cn(
                  "relative w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center touch-target",
                  isSelected ? "border-gray-800 scale-110" : "border-gray-300 hover:border-gray-400",
                )}
                style={{ backgroundColor: swatchColor }}
                onClick={() => {
                  if (isSelected) {
                    setSelectedColors(selectedColors.filter((c) => c !== color.name))
                  } else {
                    setSelectedColors([...selectedColors, color.name])
                  }
                }}
                title={color.name}
              >
                {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Special Filters */}
      <div className="mt-6">
        <h3 className="font-medium mb-3 text-gray-800">Special</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <Checkbox
              id="on-sale"
              checked={showOnSale}
              onCheckedChange={(checked) => setShowOnSale(checked as boolean)}
              className="mr-2 touch-target"
            />
            <Label htmlFor="on-sale" className="text-sm cursor-pointer">
              On Sale
            </Label>
          </div>
          <div className="flex items-center">
            <Checkbox
              id="new-arrivals"
              checked={showNewOnly}
              onCheckedChange={(checked) => setShowNewOnly(checked as boolean)}
              className="mr-2 touch-target"
            />
            <Label htmlFor="new-arrivals" className="text-sm cursor-pointer">
              New Arrivals
            </Label>
          </div>
        </div>
      </div>

      {/* Apply Filters Button (for mobile overlay) */}
      <div className="pt-4 border-t mt-6">
        <Button onClick={onApply} className="w-full">
          Apply Filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Desktop Filters Sidebar */}
      <div className="hidden md:block">
        <FilterSectionContent onApply={applyFilters} />
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden mb-6">
        <Button onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)} variant="outline" className="w-full">
          <Filter className="w-4 h-4 mr-2" />
          Filters & Sort
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 px-2 py-1 bg-emerald-600 text-white rounded-full">{activeFiltersCount}</Badge>
          )}
        </Button>
      </div>

      {/* Mobile Filter Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filters & Sort</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <FilterSectionContent onApply={() => {
              applyFilters();
              setIsMobileFilterOpen(false); // Close after applying filters
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
