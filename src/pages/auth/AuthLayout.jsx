import React, { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

const AuthLayout = () => {
  const { isAuthenticated, fetchProfile } = useAuthStore();

  useEffect(() => {
    // Try to fetch the profile if we think we're authenticated
    // This helps validate the session on page refresh
    if (isAuthenticated) {
      fetchProfile().catch(() => {
        // If the profile fetch fails, the store will automatically set isAuthenticated to false
      });
    }
  }, [isAuthenticated, fetchProfile]);

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthLayout;
