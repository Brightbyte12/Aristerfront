import React, { useState, useEffect } from "react"; // Import useEffect
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Loader2, PlusCircle, MinusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";

// Product Interface Definition (MUST ALSO BE UPDATED IN admin/page.tsx!)
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  status?: string;
  description?: string;
  imageUrl?: string[] | null; // Allow null as it can come from backend
  material?: string;
  weight?: string;
  dimensions?: string;
  care?: string;
  origin?: string;
  careInstructionsList?: string[];
  gender?: string;
  sizes?: string[];
  colors?: string[];
  salePrice?: number | null;
  discountPercentage?: number | null;
  badges?: string[]; // New field for product badges
  replacementPolicy?: {
    days: number;
    policy: string;
  };
  colorImages?: { color: string; images: File[] }[];
  variants?: { color: string; size?: string; stock: number }[];
}

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  onSubmit: (e: React.FormEvent, colorImages: { color: string; images: File[] }[], newMainImages: File[], variants: { color: string; size?: string; stock: number }[]) => void; // Pass colorImages, new main images, and variants up
  onCancel: () => void;
  formState: Product;
  setFormState: React.Dispatch<React.SetStateAction<Product>>;
  isSubmitting: boolean;
  categories: Category[];
  onAddNewCategory: (categoryName: string) => void;
}

const ProductForm = ({
  onSubmit,
  onCancel,
  formState,
  setFormState,
  isSubmitting,
  categories,
  onAddNewCategory,
}: ProductFormProps) => {
  const [newColorInput, setNewColorInput] = useState<string>("");
  const [newCategoryInput, setNewCategoryInput] = useState<string>("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState<boolean>(false);
  const [newBadgeInput, setNewBadgeInput] = useState<string>("");
  const [showNewBadgeInput, setShowNewBadgeInput] = useState<boolean>(false);

  // Internal state for newly selected files and their previews
  const [internalSelectedFiles, setInternalSelectedFiles] = useState<File[]>([]);
  const [internalPreviewUrls, setInternalPreviewUrls] = useState<string[]>([]);

  // Add state for color-specific images
  const [colorImageFiles, setColorImageFiles] = useState<Record<string, File[]>>({});
  const [colorImagePreviews, setColorImagePreviews] = useState<Record<string, string[]>>({});

  const [settings, setSettings] = useState<any>(null);

  // Add state for variants
  const [variants, setVariants] = useState<{ color: string; size?: string; stock: number }[]>(formState.variants || []);
  const [variantColor, setVariantColor] = useState('');

  // Add state for selected sizes (for button UI)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sizeStocks, setSizeStocks] = useState<Record<string, string>>({});
  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];

  // Effect to generate previews for newly selected files
  useEffect(() => {
    const newPreviews = internalSelectedFiles.map(file => URL.createObjectURL(file));
    setInternalPreviewUrls(newPreviews);

    // Cleanup: revoke object URLs when component unmounts or files change
    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [internalSelectedFiles]);

  // Combine existing images from formState and newly selected image previews
  const allImagePreviewUrls = [
    ...(formState.imageUrl || []).map((img: any) => typeof img === 'string' ? img : img.url),
    ...internalPreviewUrls
  ];

  // When colors change, ensure colorImageFiles/previews are in sync
  useEffect(() => {
    const newColorImageFiles = { ...colorImageFiles };
    const newColorImagePreviews = { ...colorImagePreviews };
    (formState.colors || []).forEach((color) => {
      if (!newColorImageFiles[color]) newColorImageFiles[color] = [];
      if (!newColorImagePreviews[color]) newColorImagePreviews[color] = [];
    });
    // Remove deleted colors
    Object.keys(newColorImageFiles).forEach((color) => {
      if (!(formState.colors || []).includes(color)) {
        delete newColorImageFiles[color];
        delete newColorImagePreviews[color];
      }
    });
    setColorImageFiles(newColorImageFiles);
    setColorImagePreviews(newColorImagePreviews);
    // eslint-disable-next-line
  }, [formState.colors]);

  useEffect(() => {
    axios.get("/api/settings/public").then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      const filesToAdd = Array.from(e.target.files);

      const validFiles = filesToAdd.filter(file => allowedTypes.includes(file.type));
      const invalidFiles = filesToAdd.filter(file => !allowedTypes.includes(file.type));

      if (invalidFiles.length > 0) {
        toast({
          title: "Invalid File Type",
          description: `Only JPEG, PNG, and GIF are allowed. Invalid files: ${invalidFiles.map(f => f.name).join(", ")}`,
          variant: "destructive",
        });
      }

      const currentTotalImages = (formState.imageUrl?.length || 0) + internalSelectedFiles.length;
      if (validFiles.length + currentTotalImages > 5) {
        toast({
          title: "Too Many Images",
          description: `You can upload a maximum of 5 images. You have ${currentTotalImages} already.`,
          variant: "destructive",
        });
        return;
      }

      setInternalSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const numExistingImages = formState.imageUrl?.length || 0;

    if (indexToRemove < numExistingImages) {
      // It's an existing image from the database
      const updatedExistingImageUrls = formState.imageUrl ? [...formState.imageUrl] : [];
      updatedExistingImageUrls.splice(indexToRemove, 1);
      setFormState((prev) => ({
        ...prev,
        imageUrl: updatedExistingImageUrls,
      }));
    } else {
      // It's a newly selected image (from internalSelectedFiles)
      const newImageIndex = indexToRemove - numExistingImages;
      setInternalSelectedFiles((prev) => {
        const updatedFiles = [...prev];
        updatedFiles.splice(newImageIndex, 1);
        return updatedFiles;
      });
    }
  };

  const handleAddCareInstruction = () => {
    setFormState((prev) => ({
      ...prev,
      careInstructionsList: [...(prev.careInstructionsList || []), ""],
    }));
  };

  const handleRemoveCareInstruction = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      careInstructionsList: (prev.careInstructionsList || []).filter((_, i) => i !== index),
    }));
  };

  const handleCareInstructionChange = (index: number, value: string) => {
    setFormState((prev) => {
      const newInstructions = [...(prev.careInstructionsList || [])];
      newInstructions[index] = value;
      return { ...prev, careInstructionsList: newInstructions };
    });
  };

  const handleCategorySelectChange = (value: string) => {
    if (value === "create-new-category") {
      setShowNewCategoryInput(true);
      setFormState((prev) => ({ ...prev, category: '' }));
    } else {
      setShowNewCategoryInput(false);
      setFormState((prev) => ({ ...prev, category: value }));
    }
  };

  const handleAddNewCategoryInternal = () => {
    if (newCategoryInput.trim() === "") {
      toast({ title: "Error", description: "Category name cannot be empty.", variant: "destructive" });
      return;
    }
    onAddNewCategory(newCategoryInput.trim()); // Call parent handler
    setFormState((prev) => ({ ...prev, category: newCategoryInput.trim() })); // Set as selected
    setNewCategoryInput(""); // Clear input
    setShowNewCategoryInput(false); // Hide input
  };

  // Handle image change for a color
  const handleColorImageChange = (color: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      const filesToAdd = Array.from(e.target.files);
      const validFiles = filesToAdd.filter(file => allowedTypes.includes(file.type));
      const invalidFiles = filesToAdd.filter(file => !allowedTypes.includes(file.type));
      if (invalidFiles.length > 0) {
        toast({
          title: "Invalid File Type",
          description: `Only JPEG, PNG, and GIF are allowed. Invalid files: ${invalidFiles.map(f => f.name).join(", ")}`,
          variant: "destructive",
        });
      }
      setColorImageFiles((prev) => ({
        ...prev,
        [color]: [...(prev[color] || []), ...validFiles],
      }));
      setColorImagePreviews((prev) => ({
        ...prev,
        [color]: [
          ...(prev[color] || []),
          ...validFiles.map(file => URL.createObjectURL(file))
        ],
      }));
    }
  };

  // Remove image for a color
  const handleRemoveColorImage = (color: string, index: number) => {
    setColorImageFiles((prev) => {
      const updated = { ...prev };
      updated[color] = [...(updated[color] || [])];
      updated[color].splice(index, 1);
      return updated;
    });
    setColorImagePreviews((prev) => {
      const updated = { ...prev };
      updated[color] = [...(updated[color] || [])];
      updated[color].splice(index, 1);
      return updated;
    });
  };

  // Helper: Get existing color images for a color
  const getExistingColorImages = (color: string) => {
    const colorObj = (formState.colorImages || []).find(ci => ci.color === color);
    return colorObj ? colorObj.images : [];
  };

  // Helper: Remove an existing color image
  const handleRemoveExistingColorImage = (color: string, imageIdx: number) => {
    setFormState(prev => {
      const updatedColorImages = (prev.colorImages || []).map(ci => {
        if (ci.color !== color) return ci;
        return {
          ...ci,
          images: ci.images.filter((_, idx) => idx !== imageIdx)
        };
      });
      return { ...prev, colorImages: updatedColorImages };
    });
  };

  // Add variant handler
  const handleAddVariant = () => {
    if (!variantColor) {
      toast({
        title: "Color Required",
        description: "Please enter a color name.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedSizes.length === 0) {
      toast({
        title: "No Sizes Selected",
        description: "Please select at least one size for this color variant.",
        variant: "destructive",
      });
      return;
    }

    // Check if this color already exists
    const existingColorVariants = variants.filter(v => v.color === variantColor);
    if (existingColorVariants.length > 0) {
      toast({
        title: "Color Already Exists",
        description: "This color already has variants. Please remove existing variants for this color first.",
        variant: "destructive",
      });
      return;
    }

    // Validate stock for each selected size
    const invalidSizes = selectedSizes.filter(size => {
      const stock = sizeStocks[size];
      return !stock || isNaN(Number(stock)) || Number(stock) < 0;
    });

    if (invalidSizes.length > 0) {
      toast({
        title: "Invalid Stock Values",
        description: `Please enter valid stock quantities for sizes: ${invalidSizes.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Add variants for each selected size with individual stock
    const newVariants = selectedSizes.map(size => ({ 
      color: variantColor, 
      size, 
      stock: Number(sizeStocks[size] || 0)
    }));
    
    setVariants(prev => [...prev, ...newVariants]);
    
    // Clear form
    setVariantColor('');
    setSelectedSizes([]);
    setSizeStocks({});
    
    toast({
      title: "Variants Added",
      description: `Added ${selectedSizes.length} size variant(s) for color ${variantColor}`,
    });
  };

  // Remove variant handler - removes individual variant
  const handleRemoveVariant = (color: string, size?: string) => {
    setVariants(prev => prev.filter(variant => 
      !(variant.color === color && variant.size === size)
    ));
    toast({
      title: "Variant Removed",
      description: `Removed ${color}${size ? ` (${size})` : ''} variant`,
    });
  };

  // On submit, include variants in formState
  const handleSubmitInternal = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('DEBUG: Form submission - existing colorImages from formState:', formState.colorImages);
    console.log('DEBUG: Form submission - new colorImageFiles:', colorImageFiles);
    
    // Combine existing images with new images for each color
    const allColorImages = Object.entries(colorImageFiles).map(([color, newImages]) => {
      // Get existing images for this color
      const existingImages = getExistingColorImages(color);
      
      console.log(`DEBUG: Color ${color} - existing images:`, existingImages);
      console.log(`DEBUG: Color ${color} - new images:`, newImages);
      
      // Combine existing images with new images
      const combinedImages = [
        ...existingImages, // Keep existing images
        ...newImages       // Add new images
      ];
      
      console.log(`DEBUG: Color ${color} - combined images:`, combinedImages);
      
      return { color, images: combinedImages };
    });
    
    // Also include colors that only have existing images (no new images added)
    const colorsWithOnlyExistingImages = (formState.colors || []).filter(color => 
      !Object.keys(colorImageFiles).includes(color)
    );
    
    console.log('DEBUG: Colors with only existing images:', colorsWithOnlyExistingImages);
    
    colorsWithOnlyExistingImages.forEach(color => {
      const existingImages = getExistingColorImages(color);
      if (existingImages.length > 0) {
        console.log(`DEBUG: Adding color ${color} with existing images:`, existingImages);
        allColorImages.push({ color, images: existingImages });
      }
    });
    
    console.log('DEBUG: Final allColorImages to submit:', allColorImages);
    
    onSubmit(e, allColorImages, internalSelectedFiles, variants);
  };

  // Reset internal image states when formState.id changes (i.e., when opening for add/edit)
  useEffect(() => {
    setInternalSelectedFiles([]);
    setInternalPreviewUrls([]);
    setColorImageFiles({}); // Clear color image files when switching products
  }, [formState.id]);

  // Toggle badge selection
  const handleBadgeToggle = (badgeName: string) => {
    setFormState((prev) => {
      const badges = prev.badges || [];
      if (badges.includes(badgeName)) {
        return { ...prev, badges: badges.filter((b) => b !== badgeName) };
      } else {
        return { ...prev, badges: [...badges, badgeName] };
      }
    });
  };

  // Sync formState.colors with unique colors from variants
  useEffect(() => {
    const uniqueColors = Array.from(new Set(variants.map(v => v.color).filter(Boolean)));
    setFormState(prev => ({ ...prev, colors: uniqueColors }));
    // eslint-disable-next-line
  }, [variants]);

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) => {
      if (prev.includes(size)) {
        // Remove size and its stock
        const newSelected = prev.filter((s) => s !== size);
        setSizeStocks(prevStocks => {
          const newStocks = { ...prevStocks };
          delete newStocks[size];
          return newStocks;
        });
        return newSelected;
      } else {
        // Add size with default stock of 0
        setSizeStocks(prevStocks => ({
          ...prevStocks,
          [size]: '0'
        }));
        return [...prev, size];
      }
    });
  };

  const handleSizeStockChange = (size: string, value: string) => {
    setSizeStocks(prev => ({
      ...prev,
      [size]: value
    }));
  };

  // Group variants by color for table display
  const groupedVariants = variants.reduce((acc, variant) => {
    const { color, size, stock } = variant;
    if (!acc[color]) {
      acc[color] = { color, variants: [] };
    }
    acc[color].variants.push(variant);
    return acc;
  }, {} as Record<string, { color: string, variants: any[] }>);
  const groupedVariantsArray = Object.values(groupedVariants);

  return (
    <form onSubmit={handleSubmitInternal} className="space-y-4">
      {formState.id && (
        <div>
          <Label htmlFor="productId">Product ID *</Label>
          <Input id="productId" value={formState.id} readOnly className="bg-gray-100 cursor-not-allowed" />
        </div>
      )}
      <div>
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={formState.name}
          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="gender">Gender *</Label>
        <Select
          value={formState.gender || ''}
          onValueChange={(value) => setFormState({ ...formState, gender: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Men">Men</SelectItem>
            <SelectItem value="Women">Women</SelectItem>
            <SelectItem value="Unisex">Unisex</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="category">Category *</Label>
        <Select
          value={showNewCategoryInput ? "create-new-category" : formState.category}
          onValueChange={handleCategorySelectChange}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
            <SelectItem value="create-new-category">
              + Create New Category...
            </SelectItem>
          </SelectContent>
        </Select>
        {showNewCategoryInput && (
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="New Category Name"
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewCategoryInternal())}
            />
            <Button type="button" onClick={handleAddNewCategoryInternal}>Add</Button>
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="price">Original Price (₹) *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={formState.price === 0 ? '' : formState.price}
          onChange={(e) => setFormState({ ...formState, price: parseFloat(e.target.value) || 0 })}
          required
        />
      </div>
      <div>
        <Label htmlFor="salePrice">Sale Price (₹)</Label>
        <Input
          id="salePrice"
          type="number"
          step="0.01"
          value={formState.salePrice === undefined || formState.salePrice === null ? '' : formState.salePrice}
          onChange={(e) => setFormState({ ...formState, salePrice: parseFloat(e.target.value) || null })}
          placeholder="Optional"
        />
      </div>
      <div>
        <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
        <Input
          id="discountPercentage"
          type="number"
          step="1"
          min="0"
          max="100"
          value={formState.discountPercentage === undefined || formState.discountPercentage === null ? '' : formState.discountPercentage}
          onChange={(e) => setFormState({ ...formState, discountPercentage: parseInt(e.target.value) || null })}
          placeholder="Optional (0-100)"
        />
      </div>
      <div>
        <Label htmlFor="badges">Product Badges</Label>
        <div className="mt-3">
          <Label className="text-sm text-gray-600 mb-2 block">Available Badges:</Label>
          <div className="flex flex-wrap gap-2">
            {settings && settings.badges && settings.badges.length > 0 ? (
              settings.badges.map((badge: any) => (
                <Button
                  key={badge.name}
                  type="button"
                  variant={(formState.badges || []).includes(badge.name) ? "default" : "outline"}
                  onClick={() => handleBadgeToggle(badge.name)}
                  className="px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-2"
                  style={{ backgroundColor: (formState.badges || []).includes(badge.name) ? badge.color : undefined, color: (formState.badges || []).includes(badge.name) ? badge.fontColor : undefined }}
                >
                  <span>{badge.name}</span>
                  <span className="w-4 h-4 rounded-full border ml-1" style={{ backgroundColor: badge.color, borderColor: badge.fontColor, display: 'inline-block' }}></span>
                </Button>
              ))
            ) : (
              <span className="text-xs text-gray-400">No badges defined. Add badges in Badge Management.</span>
            )}
          </div>
        </div>
        {(formState.badges || []).length > 0 && (
          <div className="mt-3">
            <Label className="text-xs text-gray-500 mb-1 block">Assigned Badges:</Label>
            <div className="flex flex-wrap gap-2">
              {(formState.badges || []).map((badgeName) => {
                const badgeObj = settings && settings.badges ? settings.badges.find((b: any) => b.name === badgeName) : null;
                return (
                  <Badge key={badgeName} style={badgeObj ? { backgroundColor: badgeObj.color, color: badgeObj.fontColor } : {}} className="text-xs">
                    {badgeName}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleBadgeToggle(badgeName)} />
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formState.description || ''}
          onChange={(e) => setFormState({ ...formState, description: e.target.value })}
          rows={3}
          placeholder="Enter product description"
        />
      </div>
      <h3 className="text-lg font-semibold mt-6 mb-2">Additional Product Details</h3>
      <div>
        <Label htmlFor="material">Material</Label>
        <Input
          id="material"
          value={formState.material || ''}
          onChange={(e) => setFormState({ ...formState, material: e.target.value })}
          placeholder="e.g., Pure Cotton, Silk Blend"
        />
      </div>
      <div>
        <Label htmlFor="weight">Weight</Label>
        <Input
          id="weight"
          value={formState.weight || ''}
          onChange={(e) => setFormState({ ...formState, weight: e.target.value })}
          placeholder="e.g., 500g, 1.2kg"
        />
      </div>
      <div>
        <Label htmlFor="dimensions">Dimensions</Label>
        <Input
          id="dimensions"
          value={formState.dimensions || ''}
          onChange={(e) => setFormState({ ...formState, dimensions: e.target.value })}
          placeholder="e.g., 5.5m x 1.1m, 10x10x5 cm"
        />
      </div>
      <div>
        <Label htmlFor="origin">Origin</Label>
        <Input
          id="origin"
          value={formState.origin || ''}
          onChange={(e) => setFormState({ ...formState, origin: e.target.value })}
          placeholder="e.g., Rajasthan, India; Made in China"
        />
      </div>
      <div>
        <Label htmlFor="generalCare">General Care Instructions</Label>
        <Textarea
          id="generalCare"
          value={formState.care || ''}
          onChange={(e) => setFormState({ ...formState, care: e.target.value })}
          rows={2}
          placeholder="e.g., Dry clean only, Hand wash cold"
        />
      </div>
      <div>
        <Label>Specific Care Instructions (Points)</Label>
        <div className="space-y-2 mt-2">
          {(formState.careInstructionsList || []).map((instruction, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={instruction}
                onChange={(e) => handleCareInstructionChange(index, e.target.value)}
                placeholder={`Instruction #${index + 1}`}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => handleRemoveCareInstruction(index)}
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={handleAddCareInstruction} className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Instruction
          </Button>
        </div>
      </div>
      <h3 className="text-lg font-semibold mt-6 mb-2">Replacement Policy</h3>
      <div>
        <Label htmlFor="replacementDays">Replacement Period (Days) *</Label>
        <Input
          id="replacementDays"
          type="number"
          min="0"
          max="365"
          value={formState.replacementPolicy?.days || ''}
          onChange={(e) => setFormState({
            ...formState,
            replacementPolicy: {
              days: parseInt(e.target.value) || 0,
              policy: formState.replacementPolicy?.policy || ''
            }
          })}
          placeholder="e.g., 7, 14, 30"
          required
        />
        <p className="text-sm text-gray-500 mt-1">Number of days customer can request replacement for manufacturing defects</p>
      </div>
      <div>
        <Label htmlFor="replacementPolicy">Replacement Policy Details *</Label>
        <Textarea
          id="replacementPolicy"
          value={formState.replacementPolicy?.policy || ''}
          onChange={(e) => setFormState({
            ...formState,
            replacementPolicy: {
              days: formState.replacementPolicy?.days || 0,
              policy: e.target.value
            }
          })}
          rows={4}
          placeholder="e.g., Replace within 7 days for manufacturing defects. Product must be unused and in original packaging."
          required
        />
        <p className="text-sm text-gray-500 mt-1">Detailed replacement policy terms and conditions</p>
      </div>
      <div className="mt-4">
        <Label>Color-specific Images</Label>
        {(formState.colors || []).length === 0 && (
          <p className="text-sm text-gray-500">Add colors to upload images for each color.</p>
        )}
        {(formState.colors || []).map((color) => (
          <div key={color} className="mb-4 border rounded p-2">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{color}</Badge>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                multiple
                onChange={(e) => handleColorImageChange(color, e)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Existing images from DB */}
              {getExistingColorImages(color)
                .map((img, idx) => {
                  if (typeof img === 'object' && 'url' in img) {
                    const imageObj = img as { url: string };
                    return (
                      <div key={imageObj.url} className="relative w-20 h-20 border rounded overflow-hidden">
                        <img src={imageObj.url} alt={`Existing ${color} ${idx + 1}`} className="w-full h-full object-cover" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-5 w-5 bg-white/80 hover:bg-white"
                          onClick={() => handleRemoveExistingColorImage(color, idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  }
                  return null;
                })
                .filter(Boolean)
              }
              {/* New images selected in this session */}
              {(colorImagePreviews[color] || []).map((url, idx) => (
                <div key={url} className="relative w-20 h-20 border rounded overflow-hidden">
                  <img src={url} alt={`Preview ${color} ${idx + 1}`} className="w-full h-full object-cover" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-5 w-5 bg-white/80 hover:bg-white"
                    onClick={() => handleRemoveColorImage(color, idx)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Variants (Color / Size / Stock)</h3>
        <p className="text-sm text-gray-600 mb-4">Select sizes and add stock for each color variant</p>
        
        {/* Size selection buttons */}
        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block">Select Sizes:</Label>
          <div className="flex gap-2 mb-2">
            {sizeOptions.map((size) => (
              <Button
                key={size}
                type="button"
                variant={selectedSizes.includes(size) ? 'default' : 'outline'}
                onClick={() => handleSizeToggle(size)}
                className="w-16"
              >
                {size}
              </Button>
            ))}
          </div>
          {selectedSizes.length > 0 && (
            <p className="text-sm text-green-600">
              Selected: {selectedSizes.join(', ')}
            </p>
          )}
        </div>

        {/* Color Input */}
        <div className="mb-4">
          <Label htmlFor="variantColor" className="text-sm font-medium">Color</Label>
          <Input
            id="variantColor"
            placeholder="Enter color name"
            value={variantColor}
            onChange={e => setVariantColor(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Size-specific Stock Inputs */}
        {selectedSizes.length > 0 && (
          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">Stock per Size:</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {selectedSizes.map((size) => (
                <div key={size} className="space-y-1">
                  <Label htmlFor={`stock-${size}`} className="text-xs font-medium">
                    Size {size}
                  </Label>
                  <Input
                    id={`stock-${size}`}
                    type="number"
                    min={0}
                    placeholder="Stock"
                    value={sizeStocks[size] || ''}
                    onChange={e => handleSizeStockChange(size, e.target.value)}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Variant Button */}
        <div className="mb-4">
          <Button 
            type="button" 
            onClick={handleAddVariant} 
            variant="outline"
            disabled={!variantColor || selectedSizes.length === 0}
            className="w-full"
          >
            Add Color Variant
          </Button>
        </div>

        {/* Variants Table */}
        {variants.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Color</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Size</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {variants.map((variant, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: variant.color.toLowerCase() }}
                        ></div>
                        <span className="font-medium">{variant.color}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {variant.size || 'No Size'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={variant.stock < 10 ? "destructive" : "default"}>
                        {variant.stock} in stock
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleRemoveVariant(variant.color, variant.size)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Summary */}
            <div className="bg-gray-50 px-4 py-3 border-t">
              <div className="text-sm text-gray-600">
                Total Variants: {variants.length} | 
                Total Stock: {variants.reduce((sum, v) => sum + v.stock, 0)} |
                Colors: {[...new Set(variants.map(v => v.color))].length}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {formState.id ? "Saving Changes..." : "Adding Product..."}
            </>
          ) : (
            formState.id ? "Save Changes" : "Add Product"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
