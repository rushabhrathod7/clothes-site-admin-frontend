import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { uploadImage, deleteImage } from "@/services/cloudinaryService";

const ImageUpload = ({
  value = [],
  onChange,
  disabled = false,
  maxFiles = 5,
  folder = "products"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [authError, setAuthError] = useState(false);
  
  // Normalize the value prop to ensure it's always a proper array of valid image objects
  const normalizedValue = Array.isArray(value) 
    ? value.filter(img => 
        img && 
        typeof img === 'object' && 
        img.url && 
        typeof img.url === 'string'
      )
    : [];
  
  // Log the props for debugging
  useEffect(() => {
    console.log("ImageUpload received value:", value);
    
    // Check for problematic values like empty strings in the array
    console.log("Normalized value:", normalizedValue);
  }, [value]);

  // Add a useEffect to check authentication on component mount
  useEffect(() => {
    // Import auth store dynamically to avoid circular dependencies
    import('@/stores/authStore').then(module => {
      const authStore = module.default;
      const { checkAuth, isAuthenticated } = authStore.getState();
      
      // If not authenticated in state, check with backend
      if (!isAuthenticated) {
        checkAuth().catch(() => {
          setAuthError(true);
        });
      }
    });
  }, []);

  const onUpload = async (event) => {
    try {
      setIsUploading(true);
      setAuthError(false);
      
      const files = Array.from(event.target.files);
      
      // Validate file types
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          return false;
        }
        return true;
      });
      
      if (validFiles.length === 0) return;
      
      // Check maximum number of files
      if ((normalizedValue.length + validFiles.length) > maxFiles) {
        toast.error(`You can upload a maximum of ${maxFiles} images`);
        return;
      }
      
      // Process each valid file one by one
      for (const file of validFiles) {
        try {
          const result = await uploadImage(file, folder);
          
          if (result.success) {
            onChange([
              ...normalizedValue,
              {
                url: result.data.url,
                public_id: result.data.public_id
              }
            ]);
          }
        } catch (err) {
          if (err.message.includes("Access denied") || err.message.includes("Unauthorized")) {
            setAuthError(true);
            toast.error("Authentication Required", {
              description: "Please log in to upload images",
              duration: 5000
            });
            break; // Stop processing further files
          } else {
            // Handle other errors
            toast.error(`Failed to upload ${file.name}`, {
              description: err.message
            });
          }
        }
      }
      
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setIsUploading(false);
      // Reset the input field to allow re-uploading the same file
      event.target.value = "";
    }
  };

  const onRemove = async (publicId) => {
    try {
      setIsUploading(true);
      setAuthError(false);
      
      // If the image has a publicId, it's stored in Cloudinary and needs to be deleted there
      if (publicId) {
        try {
          console.log('Removing image with ID:', publicId);
          await deleteImage(publicId);
        } catch (err) {
          if (err.message.includes("Access denied") || err.message.includes("Unauthorized")) {
            setAuthError(true);
            toast.error("Authentication Required", {
              description: "Please log in to delete images",
              duration: 5000
            });
            return; // Stop processing
          } else if (err.message.includes("Route not found") || err.message.includes("404")) {
            // If we get a 404, the image might already be deleted from Cloudinary
            // or the ID format is incorrect. Log it but continue removing from UI
            console.warn('Image not found on server, removing from UI anyway:', publicId);
            toast.warning("Warning", {
              description: "Image may have already been deleted from the server",
            });
          } else {
            throw err; // Re-throw other errors
          }
        }
      }
      
      // Always update the UI by removing the image
      // This ensures the UI stays in sync even if the server delete fails
      onChange(normalizedValue.filter(image => image.public_id !== publicId));
      
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error("Failed to remove image", {
        description: error.message
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Authentication Error Alert */}
      {authError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="text-sm">You must be logged in to upload or delete images.</p>
        </div>
      )}
      
      {/* Upload Button */}
      <div className="flex gap-4 items-center">
        <Button 
          type="button"
          variant="outline"
          disabled={isUploading || disabled || (Array.isArray(normalizedValue) && normalizedValue.length >= maxFiles) || authError}
          onClick={() => document.getElementById('image-upload').click()}
          className="flex items-center gap-2"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload Image
        </Button>
        <input 
          id="image-upload"
          type="file"
          accept="image/*"
          multiple={maxFiles > 1}
          className="hidden"
          onChange={onUpload}
          disabled={isUploading || disabled || (Array.isArray(normalizedValue) && normalizedValue.length >= maxFiles) || authError}
        />
        <p className="text-sm text-muted-foreground">
          {Array.isArray(normalizedValue) ? normalizedValue.length : 0} of {maxFiles} images uploaded
        </p>
      </div>
      
      {/* Image Preview OR Placeholder - only one will render */}
      <div className="image-display-container">
        {Array.isArray(normalizedValue) && normalizedValue.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {normalizedValue.map((image, index) => (
              <div 
                key={image.public_id || `image-${index}`} 
                className="relative aspect-square rounded-md overflow-hidden border"
              >
                <img 
                  src={image.url} 
                  alt={`Uploaded image ${index + 1}`}
                  className="object-cover w-full h-full" 
                />
                <Button
                  onClick={() => onRemove(image.public_id)}
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  disabled={isUploading || disabled || authError}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8">
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No images uploaded yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload; 