import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const NotificationsContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const authStore = useAuthStore();
  const notificationSound = useRef(new Audio("/notification.mp3"));

  // Set up user interaction listener
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
      // Remove listeners after first interaction
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  console.log("NotificationsProvider render - full auth state:", authStore);

  // Create axios instance with auth header
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor to include auth token
  api.interceptors.request.use(
    (config) => {
      const token = authStore.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Play notification sound
  const playNotificationSound = () => {
    if (!hasUserInteracted) {
      console.log("Skipping notification sound - no user interaction yet");
      return;
    }

    try {
      notificationSound.current.currentTime = 0;
      notificationSound.current.play().catch((error) => {
        console.error("Error playing notification sound:", error);
      });
    } catch (error) {
      console.error("Error with notification sound:", error);
    }
  };

  // Fetch notifications from the backend
  const {
    data: fetchedNotifications,
    refetch,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["notifications", authStore.isAuthenticated],
    queryFn: async () => {
      try {
        console.log("Fetching notifications from API...");
        const response = await api.get("/admin/notifications");
        console.log("API Response:", response.data);

        // Ensure we're returning an array
        if (!Array.isArray(response.data)) {
          console.error("API response is not an array:", response.data);
          return [];
        }

        return response.data;
      } catch (error) {
        console.error("Error fetching notifications:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
          console.error("Error status:", error.response.status);
        }
        return [];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3, // Retry failed requests 3 times
    staleTime: 10000, // Consider data stale after 10 seconds
    enabled: authStore.isAuthenticated, // Only run query if we're authenticated
  });

  // Update notifications when fetched data changes
  useEffect(() => {
    console.log("Fetched notifications changed:", fetchedNotifications);
    console.log("Is loading:", isLoading);
    console.log("Error:", error);
    console.log("Current auth state:", authStore);

    if (fetchedNotifications && Array.isArray(fetchedNotifications)) {
      // Check if there are new unread notifications
      const previousUnreadCount = unreadCount;
      const newUnreadCount = fetchedNotifications.filter((n) => !n.read).length;

      // Play sound if there are new unread notifications
      if (newUnreadCount > previousUnreadCount) {
        playNotificationSound();
      }

      console.log("Setting notifications:", fetchedNotifications);
      setNotifications(fetchedNotifications);
      console.log("Unread count:", newUnreadCount);
      setUnreadCount(newUnreadCount);
    } else {
      console.log("Invalid notifications data, setting empty arrays");
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [fetchedNotifications, isLoading, error, authStore]);

  // Log any query errors
  useEffect(() => {
    if (error) {
      console.error("Query error:", error);
    }
  }, [error]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      console.log("Marking notification as read:", notificationId);
      await api.patch(`/admin/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      console.log("Marking all notifications as read");
      await api.patch("/admin/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetchNotifications: refetch,
    isLoading,
  };

  console.log("NotificationsContext value:", value);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
