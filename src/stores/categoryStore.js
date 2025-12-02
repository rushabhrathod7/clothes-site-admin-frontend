import { create } from 'zustand';
import { fetchCategories, fetchSubcategories } from '../services/api';

const useCategoryStore = create((set) => ({
  // State
  categories: [],
  subcategories: [],
  loading: false,
  error: null,

  // Actions
  getCategories: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchCategories();
      set({ categories: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  getSubcategories: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchSubcategories();
      set({ subcategories: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Reset store
  reset: () => set({
    categories: [],
    subcategories: [],
    loading: false,
    error: null
  })
}));

export default useCategoryStore; 