import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const CloudinaryUploader = ({
  images = [],
  onChange,
  maxImages = 5,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        toast.error("Invalid file type", {
          description: `${file.name} is not an image file`
        });
      }
      return isValid;
    });
    
    if (validFiles.length === 0) return;
    
    // Check if adding these would exceed the max
    if (images.length + validFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }
    
    // Create preview URLs and prepare new image objects
    const newImages = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      file: file,
      isNew: true
    }));
    
    // Call the onChange with all images (existing + new)
    onChange([...images, ...newImages]);
  };
  
  const removeImage = (index) => {
    const newImages = [...images];
    const removedImage = newImages[index];
    
    // If it's a new image with a Blob URL, revoke it to prevent memory leaks
    if (removedImage.isNew && removedImage.url.startsWith('blob:')) {
      URL.revokeObjectURL(removedImage.url);
    }
    
    // Remove the image from the array
    newImages.splice(index, 1);
    
    // Call the onChange with the updated images array
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Label
          htmlFor="cloudinaryUpload"
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
        >
          <Upload size={16} />
          Upload Images
        </Label>
        <Input
          id="cloudinaryUpload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          disabled={disabled || uploading}
        />
        <span className="text-sm text-gray-500">
          {images.length} of {maxImages} image(s)
        </span>
      </div>
      
      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-3">
          {images.map((image, index) => (
            <div key={index} className="relative border rounded overflow-hidden">
              <img
                src={image.url}
                alt={`Image ${index + 1}`}
                className="w-full h-24 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/100x100/png";
                }}
              />
              <button
                type="button"
                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white"
                onClick={() => removeImage(index)}
                disabled={disabled}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {images.length === 0 && (
        <div className="flex flex-col items-center justify-center border border-dashed rounded p-6">
          <ImageIcon size={48} className="text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">No images uploaded</p>
        </div>
      )}
    </div>
  );
};

export default CloudinaryUploader; 