import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { NotificationsProvider } from "./context/NotificationsContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AdminSidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import CreateProductPage from "./pages/products/CreateProductPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import SettingsPage from "./pages/SettingsPage";
import CategoriesPage from "./pages/CategoriesPage";
import SubcategoriesPage from "./pages/SubcategoriesPage";
import ReviewsPage from "./pages/ReviewsPage";
import PaymentsPage from "./pages/PaymentsPage";
import OfflineSalesPage from "./pages/OfflineSalesPage";
import Analytics from "./pages/Analytics";
import SignIn from "./pages/auth/SignIn";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AuthLayout from "./pages/auth/AuthLayout";

import { Toaster } from "@/components/ui/sonner";

// Protected route component using Zustand auth store
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  // Check authentication status when component mounts
  useEffect(() => {
    // Verify auth status with backend
    checkAuth().catch(error => {
      console.error("Auth check failed:", error);
    });
  }, [checkAuth]);

  // If still loading, you could show a spinner here
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect to signin if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationsProvider>
        <Router>
          <Toaster />
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="signin" element={<SignIn />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
            </Route>

            {/* Admin routes - protected */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminSidebar />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/new" element={<CreateProductPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/subcategories" element={<SubcategoriesPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/offline-sales" element={<OfflineSalesPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Router>
      </NotificationsProvider>
    </QueryClientProvider>
  );
}

export default App;

