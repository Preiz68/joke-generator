"use client";

import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

const ToggleDarkmode = () => {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 text-gray-800 dark:text-gray-200 px-4 py-2 hover:opacity-80 transition"
      >
        {darkMode ? <Sun /> : <Moon />}
      </button>
    </div>
  );
};
export default ToggleDarkmode;
