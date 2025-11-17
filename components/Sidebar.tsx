"use client";

import { useState } from "react";
import HistoryPanel from "./HistoryPanel";
import { motion } from "framer-motion";
import { Search, Laugh, Skull, Cpu, Dog, Zap, Sparkles, X } from "lucide-react";

const categories = [
  { name: "Dark Humor", icon: Skull },
  { name: "Dad Jokes", icon: Laugh },
  { name: "Tech Jokes", icon: Cpu },
  { name: "Animal Jokes", icon: Dog },
  { name: "One-Liners", icon: Zap },
  { name: "Random", icon: Sparkles },
];

export default function Sidebar({
  history,
  onCategorySelect,
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Random");

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    onCategorySelect?.(category);
  };

  return (
    <>
      {/* DARK SCREEN OVERLAY FOR MOBILE */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 w-full bg-black/40 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SLIDE-IN SIDEBAR */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? "0%" : "-100%" }}
        transition={{ duration: 0.4 }}
        className="
          fixed md:relative
          z-30 w-[80%] md:w-full
          top-0 left-0
          h-full overflow-x-hidden flex-col items-center
          bg-gray-100
          p-6 overflow-y-auto shadow-lg
          border-r border-gray-300"
      >
        {/* CLOSE BUTTON ON MOBILE */}
        <button
          className="md:hidden absolute top-2 right-2 text-gray-700"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={26} />
        </button>

        {/* SEARCH */}
        <div className="relative mb-8 mt-3">
          <Search
            size={22}
            className="absolute top-4 left-4 text-gray-600 dark:text-gray-300"
          />
          <input
            placeholder="Search Joke Chats"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full py-4 pl-12 pr-4 rounded-full
              border border-blue-400 bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              placeholder:text-gray-500 dark:placeholder:text-gray-400
              shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
        </div>

        {/* NEW JOKE BUTTON */}
        {/* <p
          className="
          text-xl cursor-pointer mb-10 px-4 py-2 rounded-full
          transition-all duration-150 bg-white dark:bg-gray-800
          hover:bg-blue-300 hover:text-black
          shadow-sm border border-gray-300 dark:border-gray-700
        "
        >
          🤡 New Joke
        </p> */}

        {/* CATEGORY GRID */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-3">
            Categories
          </h3>

          <div className="md:grid md:grid-cols-2 flex flex-col gap-3 p-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.name;

              return (
                <div
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`
                    cursor-pointer md:px-3 md:py-4 md:rounded-xl p-2 rounded-full border
                    flex md:flex-col items-center justify-center gap-2
                    transition-all duration-200 shadow-md
                    ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-700 scale-105 shadow-lg"
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <Icon size={22} />
                  <span className="text-sm font-medium text-center">
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* HISTORY SECTION */}
        <HistoryPanel history={history} />
      </motion.div>
    </>
  );
}
