import { create } from 'zustand';
import { fetchProducts, addProduct, updateProduct, deleteProduct, uploadProductImage, deleteProductImage } from '../services/api';

const useProductStore = create((set, get) => ({
  // State
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filters: {
    sort: "-createdAt",
    search: ""
  },

  // Actions
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  
  getProducts: async (page = 1, limit = 10, sort = "-createdAt", search = "") => {
    set({ loading: true, error: null });
    try {
      const data = await fetchProducts(page, limit, sort, search);
      set({ 
        products: data.data,
        pagination: {
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: data.totalPages
        },
        loading: false 
      });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  getProductById: async (productId) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchProducts(1, 1, "-createdAt", "", productId);
      set({ currentProduct: data.data[0], loading: false });
      return data.data[0];
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  createProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const data = await addProduct(productData);
      set((state) => ({ 
        products: [data, ...state.products],
        loading: false 
      }));
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateProduct: async (productId, productData) => {
    set({ loading: true, error: null });
    try {
      const data = await updateProduct(productId, productData);
      set((state) => ({
        products: state.products.map(product => 
          product._id === productId ? data : product
        ),
        currentProduct: state.currentProduct?._id === productId ? data : state.currentProduct,
        loading: false
      }));
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  deleteProduct: async (productId) => {
    set({ loading: true, error: null });
    try {
      await deleteProduct(productId);
      set((state) => ({
        products: state.products.filter(product => product._id !== productId),
        currentProduct: state.currentProduct?._id === productId ? null : state.currentProduct,
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  uploadProductImage: async (productId, imageFile) => {
    set({ loading: true, error: null });
    try {
      const data = await uploadProductImage(productId, imageFile);
      set((state) => ({
        products: state.products.map(product => 
          product._id === productId 
            ? { ...product, images: [...product.images, ...data.images] }
            : product
        ),
        currentProduct: state.currentProduct?._id === productId 
          ? { ...state.currentProduct, images: [...state.currentProduct.images, ...data.images] }
          : state.currentProduct,
        loading: false
      }));
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  deleteProductImage: async (productId, imageId) => {
    set({ loading: true, error: null });
    try {
      await deleteProductImage(productId, imageId);
      set((state) => ({
        products: state.products.map(product => 
          product._id === productId 
            ? { ...product, images: product.images.filter(img => img._id !== imageId) }
            : product
        ),
        currentProduct: state.currentProduct?._id === productId 
          ? { ...state.currentProduct, images: state.currentProduct.images.filter(img => img._id !== imageId) }
          : state.currentProduct,
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Reset store
  reset: () => set({
    products: [],
    currentProduct: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    filters: {
      sort: "-createdAt",
      search: ""
    }
  })
}));

export default useProductStore; 