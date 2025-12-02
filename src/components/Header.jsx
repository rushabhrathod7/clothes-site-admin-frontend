import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, User, ChevronDown, Search, Package, ShoppingCart, Users, Settings, FileText, FolderTree, FolderOpen, Folder, Store, CreditCard, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import DarkModeToggle from "./DarkModeToggle";
import NotificationsDropdown from "./NotificationsDropdown";
import { useSidebar } from "./SidebarContext";

const Header = () => {
  const { isCollapsed } = useSidebar();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { logout, admin } = useAuthStore();

  // Search options
  const searchOptions = [
    {
      title: "Analytics",
      icon: FileText,
      path: "/analytics",
      description: "View sales analytics and reports"
    },
    {
      title: "Products",
      icon: Package,
      path: "/products",
      description: "Manage your product catalog"
    },
    {
      title: "Categories",
      icon: FolderTree,
      path: "/categories",
      description: "Manage product categories"
    },
    {
      title: "Main Categories",
      icon: FolderOpen,
      path: "/main-categories",
      description: "Manage main product categories"
    },
    {
      title: "Subcategories",
      icon: Folder,
      path: "/subcategories",
      description: "Manage product subcategories"
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      path: "/orders",
      description: "View and manage online orders"
    },
    {
      title: "Offline Sales",
      icon: Store,
      path: "/offline-sales",
      description: "Manage offline sales and POS"
    },
    {
      title: "Customers",
      icon: Users,
      path: "/customers",
      description: "View and manage customer data"
    },
    {
      title: "Payments",
      icon: CreditCard,
      path: "/payments",
      description: "View and manage payment transactions"
    },
    {
      title: "Reviews",
      icon: Star,
      path: "/reviews",
      description: "Manage product reviews and ratings"
    }
  ];

  // Filter search options based on query
  const filteredOptions = searchOptions.filter(option =>
    option.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/signin");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search navigation
  const handleSearchSelect = (path) => {
    navigate(path);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-all duration-300
        ${isCollapsed ? "left-20" : "left-64"}`}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Search bar */}
        <div className="relative w-64" ref={searchRef}>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-gray-100 border-0 rounded-lg dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
          />

          {/* Search results dropdown */}
          {isSearchOpen && searchQuery && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchSelect(option.path)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start space-x-3"
                  >
                    <option.icon size={20} className="text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {option.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-4">
          {/* Dark mode toggle component */}
          <DarkModeToggle />

          {/* Notifications component */}
          <NotificationsDropdown />

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white">
                <User size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {admin?.username || "Admin"}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {/* Profile dropdown menu */}
            {isProfileOpen && (
              <div className="absolute right-0 w-48 mt-2 bg-white rounded-lg shadow-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="py-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="px-4 py-2">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {admin?.username || "Admin User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {admin?.email || "admin@example.com"}
                    </p>
                  </div>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Settings
                  </Link>
                </div>
                <div className="py-1 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
