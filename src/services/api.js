// src/services/api.js
import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true // Include cookies with every request
});

// Add a request interceptor to include auth token from cookies
api.interceptors.request.use(
  (config) => {
    // Get the token from cookies
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_token='))
      ?.split('=')[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      toast.error("Authentication Required", {
        description: "Please log in to continue",
      });
    }
    return Promise.reject(error);
  }
);

export const fetchProducts = async (page = 1, limit = 10, sort = "-createdAt", search = "") => {
  try {
    const response = await api.get("/products", {
      params: {
        page,
        limit,
        sort,
        search,
      },
    });
    
    if (!response.data.success || !Array.isArray(response.data.data)) {
      throw new Error('Invalid response format from server');
    }
    
    return response.data;
  } catch (err) {
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "Failed to fetch products";
    toast.error("Error", {
      description: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

export const fetchCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data.data;
  } catch (err) {
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "Failed to fetch categories";
    toast.error("Error", {
      description: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

export const fetchSubcategories = async () => {
  try {
    const response = await api.get("/subcategories");
    return response.data.data;
  } catch (err) {
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "Failed to fetch subcategories";
    toast.error("Error", {
      description: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

export const addProduct = async (productData) => {
  try {
    // Check if productData is FormData
    const isFormData = productData instanceof FormData;
    
    const response = await api.post("/products", productData, {
      headers: isFormData 
        ? { "Content-Type": "multipart/form-data" } 
        : { "Content-Type": "application/json" }
    });
    
    toast.success("Product Added", {
      description: "Product added successfully",
    });
    return response.data;
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || err.message || "Failed to add product";
    toast.error("Error", {
      description: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    // Check if productData is FormData
    const isFormData = productData instanceof FormData;
    
    const response = await api.put(`/products/${productId}`, productData, {
      headers: isFormData 
        ? { "Content-Type": "multipart/form-data" } 
        : { "Content-Type": "application/json" }
    });
    
    toast.success("Product Updated", {
      description: "Product updated successfully",
    });
    return response.data;
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || err.message || "Failed to update product";
    toast.error("Error", {
      description: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

export const deleteProduct = async (productId) => {
  try {
    await api.delete(`/products/${productId}`);
    toast.success("Success", {
      description: "Product deleted successfully",
    });
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || err.message || "Failed to delete product";
    toast.error("Error", {
      description: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

export const uploadProductImage = async (productId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('images', imageFile);
    
    const response = await api.post(`/products/${productId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    
    toast.success("Image Uploaded", {
      description: "Image uploaded successfully",
    });
    
    return response.data;
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || err.message || "Failed to upload image";
    toast.error("Error", {
      description: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

export const deleteProductImage = async (productId, imageId) => {
  try {
    await api.delete(`/products/${productId}/images/${imageId}`);
    
    toast.success("Image Deleted", {
      description: "Image deleted successfully",
    });
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || err.message || "Failed to delete image";
    toast.error("Error", {
      description: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

export default api;