"use client";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import {
  ArrowUp,
  Smile,
  Ghost,
  Bot,
  ThumbsUp,
  ThumbsDown,
  Menu,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
type Rating = "up" | "down";

const categories = [
  { name: "Funny", icon: <Smile size={20} /> },
  { name: "Spooky", icon: <Ghost size={20} /> },
  { name: "Tech", icon: <Bot size={20} /> },
];

export default function JokeFetcher() {
  const [userInput, setUserInput] = useState("");
  const [joke, setJoke] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loadingJoke, setLoadingJoke] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [rating, setRating] = useState<Rating | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("joke_history") || "[]");
    setHistory(saved);
  }, []);

  const saveToHistory = (text: string) => {
    const updated = [text, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem("joke_history", JSON.stringify(updated));
  };

  const generateJoke = async () => {
    if (!userInput && !selectedCategory) return;
    setLoadingJoke(true);
    setJoke(null);
    setImage(null);
    setRating(null);

    try {
      const res = await fetch("/api/gen-joke-and-img", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput, category: selectedCategory }),
      });
      const data = await res.json();
      setJoke(data.joke || "No joke generated.");
      saveToHistory(data.joke);
      setImage(data.image || null);
    } catch {
      setJoke("Error generating joke.");
    }
    setLoadingJoke(false);
  };

  const sendFeedback = async (rate: Rating) => {
    if (!joke) return;
    setRating(rate);

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joke, rating: rate }),
      });
    } catch (err) {
      console.error("Feedback save failed", err);
    }
  };

  return (
    <div className="relative w-full min-h-screen md:grid md:grid-cols-12 transition-colors overflow-x-hidden">
      <button
        className="md:hidden absolute left-4 top-4 text-gray-700 z-30"
        onClick={() => {
          setIsSidebarOpen(true);
        }}
      >
        <Menu size={26} />
      </button>
      <div className="md:col-span-4">
        <Sidebar
          history={history}
          onCategorySelect={setSelectedCategory}
          {...{ isSidebarOpen, setIsSidebarOpen }}
        />
      </div>

      <div className="md:col-span-8 flex flex-col w-full h-screen items-center justify-around relative z-10 p-6 md:p-12">
        <Image
          src="/background.jpg"
          alt="background"
          fill
          priority
          className="absolute inset-0 object-cover -z-10 opacity-30"
        />
        <h1 className="text-4xl sm:text-5xl md:text-7xl mx-auto font-bold mb-6 text-yellow-500">
          Risus
        </h1>

        {/* Categories */}
        <div className="flex gap-3 sm:gap-4 flex-wrap justify-center mb-8">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === cat.name ? null : cat.name
                )
              }
              className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full border text-sm sm:text-base transition ${
                selectedCategory === cat.name
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              {cat.icon}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex w-full max-w-xl items-center gap-2 mb-6">
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Customize your Joke"
            className="
              flex-1
              p-3 sm:p-4
              text-base sm:text-lg
              rounded-full 
              border border-gray-300 dark:border-gray-700 
              bg-white dark:bg-gray-800 
              placeholder-gray-500 dark:placeholder-gray-400 
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
          />

          <button
            onClick={generateJoke}
            disabled={loadingJoke || (!userInput && !selectedCategory)}
            className="
              bg-indigo-600 hover:bg-indigo-700
              text-white
              p-3 sm:p-4
              rounded-full
              flex items-center justify-center
              transition
            "
          >
            {loadingJoke ? (
              <motion.span
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
              />
            ) : (
              <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>

        {/* Joke */}
        <div className="min-h-16 mb-4 text-center text-base sm:text-lg md:text-xl text-gray-900 dark:text-gray-100">
          {loadingJoke ? (
            "Thinking..."
          ) : joke ? (
            <div className="max-w-xl rounded backdrop-blur-lg p-8 shadow text-base sm:text-2xl md:text-3xl">
              {`"${joke}"`}
            </div>
          ) : (
            <p className="text-indigo-700">Your joke will appear here.</p>
          )}
        </div>

        {/* Feedback */}
        {joke && (
          <div className="flex justify-between items-center gap-3">
            <p className="text-yellow-700 text-xl">Rate the Joke :</p>
            <div className="flex gap-3 justify-between items-center rounded-full px-5 py-3 shadow-lg bg-white">
              <button
                onClick={() => sendFeedback("up")}
                className={`text-2xl sm:text-3xl transition border-gray-700 ${
                  rating === "up"
                    ? "text-green-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <ThumbsUp size={24} />
              </button>

              <button
                onClick={() => sendFeedback("down")}
                className={`text-2xl sm:text-3xl transition ${
                  rating === "down"
                    ? "text-red-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <ThumbsDown size={24} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
