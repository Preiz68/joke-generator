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
      {/* DARK OVERLAY BACKDROP (MOBILE) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR PANEL */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? "0%" : "-100%" }}
        transition={{ duration: 0.35 }}
        className="
          fixed md:relative z-30
          w-[80%] md:w-full
          top-0 left-0 h-full
          bg-gray-100 dark:bg-gray-900
          text-gray-800 dark:text-gray-200
          border-r border-gray-300 dark:border-gray-700
          shadow-xl md:shadow-none
          overflow-y-auto p-6
        "
      >
        {/* CLOSE BUTTON - MOBILE ONLY */}
        <button
          className="md:hidden absolute right-3 top-3 text-gray-700 dark:text-gray-300"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={26} />
        </button>

        {/* SEARCH BAR */}
        <div className="relative mb-10 mt-4">
          <Search
            size={20}
            className="absolute top-4 left-4 text-gray-600 dark:text-gray-400"
          />

          <input
            placeholder="Search Joke Chats"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full py-4 pl-12 pr-4 rounded-full
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              placeholder:text-gray-500 dark:placeholder:text-gray-400
              border border-blue-400 dark:border-blue-600
              shadow-md
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
        </div>

        {/* CATEGORY SECTION */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Categories
          </h3>

          <div className="md:grid md:grid-cols-2 flex flex-col gap-3 p-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.name;

              return (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`
                    cursor-pointer w-full
                    md:px-4 md:py-4 md:rounded-xl
                    px-3 py-3 rounded-full
                    flex md:flex-col items-center justify-center gap-2
                    border transition-all duration-200 shadow-md
                    ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-700 shadow-lg scale-[1.03]"
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* HISTORY */}
        <HistoryPanel history={history} />
      </motion.div>
    </>
  );
}
