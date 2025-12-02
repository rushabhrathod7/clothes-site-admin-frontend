import React, { createContext, useContext, useState, useEffect } from 'react';

// Create auth context
const AuthContext = createContext({
  user: null,
  adminToken: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: true
});

// Helper to set cookies with expiration
const setCookie = (name, value, days = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Strict`;
};

// Helper to get cookie value
const getCookie = (name) => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1];
};

// Helper to delete cookie
const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on component mount
  useEffect(() => {
    const storedToken = getCookie('admin_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken) {
      setAdminToken(storedToken);
      try {
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        // Clear invalid data
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Login function
  const login = (userData, token) => {
    setUser(userData);
    setAdminToken(token);
    
    // Store token in cookie and user data in localStorage
    setCookie('admin_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setAdminToken(null);
    
    // Clear storage
    deleteCookie('admin_token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    adminToken,
    login,
    logout,
    isAuthenticated: !!adminToken,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
