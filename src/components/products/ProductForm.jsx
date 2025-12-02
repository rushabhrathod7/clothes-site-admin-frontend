// src/components/products/ProductForm.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetFooter } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import ImageUpload from "@/components/ui/ImageUpload";

const ProductForm = ({
  initialData,
  onSubmit,
  onClose,
  isEdit,
  categories,
  subcategories,
}) => {
  // Initialize form data with proper handling for images
  const [formData, setFormData] = useState({
    ...initialData,
    // Ensure images is always a valid array with proper image objects only
    images: Array.isArray(initialData.images) 
      ? initialData.images.filter(img => 
          img && typeof img === 'object' && img.url && img.public_id
        )
      : []
  });
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Log initial state for debugging
  useEffect(() => {
    console.log("Initial images state:", formData.images);
  }, []);

  useEffect(() => {
    if (formData.category && subcategories) {
      const filtered = subcategories.filter(
        (sub) => sub.category._id === formData.category
      );
      setAvailableSubcategories(filtered);
    }
  }, [formData.category, subcategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      // Create form data object for submission
      const submissionData = {
        ...formData
      };
      
      await onSubmit(submissionData);
    } catch (error) {
      toast.error("Error submitting form", {
        description: error.message
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => {
      if (field === "category") {
        return { ...prev, category: value, subcategory: "" };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleImagesChange = (newImages) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  // Find the category name for display
  const categoryName =
    categories?.find((c) => c._id === formData.category)?.name || "";

  // Find the subcategory name for display
  const subcategoryName =
    subcategories?.find((s) => s._id === formData.subcategory)?.name || "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="sku" className="text-right">
            SKU
          </Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => handleFieldChange("sku", e.target.value)}
            className="col-span-3"
            required
          />
        </div>
        
        {/* Image Upload Section */}
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="images" className="text-right mt-2">
            Images
          </Label>
          <div className="col-span-3">
            <ImageUpload
              value={formData.images || []}
              onChange={handleImagesChange}
              disabled={uploading}
              maxFiles={5}
              folder="products"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">
            Category
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleFieldChange("category", value)}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select category">
                {categoryName || "Select category"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {formData.category && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subcategory" className="text-right">
              Subcategory
            </Label>
            <Select
              value={formData.subcategory}
              onValueChange={(value) => handleFieldChange("subcategory", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select subcategory">
                  {subcategoryName || "Select subcategory"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableSubcategories.map((subcategory) => (
                  <SelectItem key={subcategory._id} value={subcategory._id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="price" className="text-right">
            Price
          </Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleFieldChange("price", Number(e.target.value))}
            className="col-span-3"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="stock" className="text-right">
            Stock
          </Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => handleFieldChange("stock", Number(e.target.value))}
            className="col-span-3"
            min="0"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="isAvailable" className="text-right">
            Available
          </Label>
          <Select
            value={formData.isAvailable.toString()}
            onValueChange={(value) =>
              handleFieldChange("isAvailable", value === "true")
            }
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select availability r" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="newlyArrived" className="text-right">
            New Arrival
          </Label>
          <Select
            value={formData.newlyArrived?.toString() || "false"}
            onValueChange={(value) =>
              handleFieldChange("newlyArrived", value === "true")
            }
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Mark as new arrival" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="featured" className="text-right">
            Featured Product
          </Label>
          <Select
            value={formData.featured?.toString() || "false"}
            onValueChange={(value) =>
              handleFieldChange("featured", value === "true")
            }
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Feature this product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <SheetFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : isEdit ? "Save Changes" : "Add Product"}
        </Button>
      </SheetFooter>
    </form>
  );
};

export default ProductForm;