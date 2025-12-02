import React, { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

const ThemeToggle = () => {
  const [theme, setTheme] = useState("system");

  // Helper function to apply theme
  const applyTheme = (selectedTheme) => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDark =
      selectedTheme === "dark" || (selectedTheme === "system" && prefersDark);

    document.documentElement.classList.toggle("dark", isDark);
  };

  // Initialize theme from localStorage or default to system on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Apply theme immediately
    applyTheme(savedTheme || "system");

    // Set up listener for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    // Add event listener with modern API
    mediaQuery.addEventListener("change", handleSystemChange);

    // Clean up
    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [theme]);

  // Change theme
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => changeTheme("light")}
        className={`p-2 rounded-md flex items-center justify-center ${
          theme === "light"
            ? "bg-white dark:bg-gray-700 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
        aria-label="Light mode"
      >
        <Sun size={18} />
      </button>

      <button
        onClick={() => changeTheme("system")}
        className={`p-2 rounded-md flex items-center justify-center ${
          theme === "system"
            ? "bg-white dark:bg-gray-700 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
        aria-label="System theme"
      >
        <Monitor size={18} />
      </button>

      <button
        onClick={() => changeTheme("dark")}
        className={`p-2 rounded-md flex items-center justify-center ${
          theme === "dark"
            ? "bg-white dark:bg-gray-700 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
        aria-label="Dark mode"
      >
        <Moon size={18} />
      </button>
    </div>
  );
};

export default ThemeToggle;
