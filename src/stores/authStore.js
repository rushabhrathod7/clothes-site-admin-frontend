import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

// Configure axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Important for cookies to be sent
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

const useAuthStore = create(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Initialize function to check persisted state
      initialize: () => {
        const state = get();
        console.log("Initializing auth store with persisted state:", {
          admin: state.admin,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        });
      },

      // Login function
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/auth/login", { email, password });
          console.log("Login response:", response.data);

          // Check if we have admin data and token
          if (!response.data.admin || !response.data.token) {
            console.error("No admin data or token received in login response");
            throw new Error("Invalid login response");
          }

          // Set the state with what we have
          set({
            admin: response.data.admin,
            token: response.data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          const newState = get();
          console.log("Auth state after login:", {
            admin: newState.admin,
            token: newState.token,
            isAuthenticated: newState.isAuthenticated,
          });

          return response.data;
        } catch (error) {
          console.error("Login error:", error);
          const errorMessage =
            error.response?.data?.message || "Failed to login";
          set({ isLoading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      // Logout function
      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post("/auth/logout");
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            admin: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          console.log("Auth state after logout:", get());
        }
      },

      // Get current user profile
      fetchProfile: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get("/auth/me");
          console.log("Profile response:", response.data);
          set({
            admin: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
          console.log("Auth state after profile fetch:", get());
          return response.data;
        } catch (error) {
          set({
            isLoading: false,
            admin: null,
            token: null,
            isAuthenticated: false,
          });
          throw new Error("Failed to fetch profile");
        }
      },

      // Verify authentication status
      checkAuth: async () => {
        console.log("Checking auth, current state:", get());
        if (!get().isAuthenticated || !get().token) {
          console.log("Not authenticated in state, skipping check");
          return false;
        }

        try {
          const response = await api.get("/auth/check", {
            validateStatus: () => true,
          });

          const isValid = response.status === 200;
          console.log("Auth check response:", {
            status: response.status,
            isValid,
          });

          if (!isValid) {
            set({ isAuthenticated: false, admin: null, token: null });
            console.log("Auth state after invalid check:", get());
          }

          return isValid;
        } catch (error) {
          set({ isAuthenticated: false, admin: null, token: null });
          console.log("Auth state after check error:", get());
          return false;
        }
      },

      // Change password
      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true });
        try {
          const response = await api.put("/auth/change-password", {
            currentPassword,
            newPassword,
          });
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Failed to change password";
          set({ isLoading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      // Forgot password
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/auth/forgot-password", { email });
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Failed to send reset link";
          set({ isLoading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      // Reset password
      resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post(`/auth/reset-password/${token}`, {
            password,
          });
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Failed to reset password";
          set({ isLoading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      // Clear any errors
      clearError: () => set({ error: null }),
    }),
    {
      name: "admin-auth-storage",
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Log the initial state and initialize
const initialState = useAuthStore.getState();
console.log("Initial auth state:", {
  admin: initialState.admin,
  token: initialState.token,
  isAuthenticated: initialState.isAuthenticated,
});
useAuthStore.getState().initialize();

export { useAuthStore };
