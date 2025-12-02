import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationsContext";
import { formatDistanceToNow } from 'date-fns';

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();

  console.log('NotificationsDropdown render:', { 
    notifications, 
    unreadCount, 
    isLoading,
    notificationsLength: notifications?.length 
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification._id);
    }

    // Navigate based on notification type and message
    if (notification.type === 'order') {
      // Check if the message contains "offline sale" or "POS-"
      if (notification.message.toLowerCase().includes('offline sale') || notification.message.includes('POS-')) {
        navigate('/offline-sales');
      } else {
        navigate('/orders');
      }
    } else if (notification.type === 'payment') {
      navigate('/payments');
    } else {
      navigate('/dashboard');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return '🛍️';
      case 'payment':
        return '💰';
      default:
        return '📢';
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 rounded-full dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {/* Notifications dropdown */}
      {isOpen && (
        <div className="absolute right-0 w-80 mt-2 bg-white rounded-lg shadow-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
                {/* <Link
                  to="/notifications"
                  className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
                >
                  View all
                </Link> */}
              </div>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    !notification.read ? 'bg-violet-50 dark:bg-violet-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {notification.message}
                        {!notification.read && (
                          <span className="ml-2 text-xs font-semibold text-red-500">
                            New
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
