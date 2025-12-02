import api from './api';
import { toast } from 'sonner';

/**
 * Uploads a single image directly to Cloudinary
 * @param {File} imageFile - The image file to upload
 * @param {String} folder - Optional folder path in Cloudinary
 * @returns {Promise<Object>} - The uploaded image data
 */
export const uploadImage = async (imageFile, folder = 'products') => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    if (folder) {
      formData.append('folder', folder);
    }
    
    const response = await api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true
    });
    
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.error('Authentication error:', err.response.data);
      const errorMessage = 'Authentication required to upload images';
      throw new Error(`Access denied. ${err.response.data.message || 'No token provided'}`);
    }
    
    const errorMessage = err.response?.data?.message || err.message || 'Failed to upload image';
    toast.error('Upload Failed', {
      description: errorMessage
    });
    throw new Error(errorMessage);
  }
};

/**
 * Upload multiple images to cloudinary
 * @param {Array<File>} imageFiles - Array of image files
 * @param {String} folder - Optional folder path in Cloudinary
 * @returns {Promise<Array<Object>>} - Array of uploaded image data
 */
export const uploadMultipleImages = async (imageFiles, folder = 'products') => {
  try {
    const uploadPromises = imageFiles.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);
    
    toast.success('Upload Successful', {
      description: `${results.length} images uploaded successfully`
    });
    
    return results;
  } catch (err) {
    if (err.message.includes('Access denied')) {
      throw err;
    }
    
    toast.error('Upload Failed', {
      description: 'Failed to upload one or more images'
    });
    throw err;
  }
};

/**
 * Delete an image from Cloudinary
 * @param {String} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - The deletion result
 */
export const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required');
    }

    console.log('Deleting image with ID:', publicId);
    
    const response = await api.delete('/uploads', {
      data: { public_id: publicId },
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete image');
    }
    
    toast.success('Image Deleted', {
      description: 'Image successfully removed'
    });
    
    return response.data;
  } catch (err) {
    console.error('Error deleting image:', err);
    
    if (err.response?.status === 401) {
      console.error('Authentication error:', err.response.data);
      throw new Error(`Access denied. ${err.response.data.message || 'No token provided'}`);
    }
    
    const errorMessage = err.response?.data?.message || err.message || 'Failed to delete image';
    toast.error('Deletion Failed', {
      description: errorMessage
    });
    throw new Error(errorMessage);
  }
};

export default {
  uploadImage,
  uploadMultipleImages,
  deleteImage
}; 