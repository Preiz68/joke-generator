"use client";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { ArrowUp, Smile, Ghost, Bot } from "lucide-react";
import Image from "next/image";

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
  // Load history
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("joke_history") || "[]");
    setHistory(saved);
  }, []);

  const saveToHistory = (text: string) => {
    const updated = [text, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem("joke_history", JSON.stringify(updated));
  };

  // API call
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
    } catch (err) {
      console.error(err);
      setJoke("Error generating joke.");
    }
    setLoadingJoke(false);
  };

  // Feedback
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
    <div className="relative w-full min-h-screen grid grid-cols-12 bg-gray-100 transition-colors">
      <div className="col-span-4">
        <Sidebar
          history={history}
          onCategorySelect={setSelectedCategory}
          {...{ isSidebarOpen, setIsSidebarOpen }}
        />
      </div>
      <div className="flex flex-col w-full h-full items-center justify-around relative z-10 p-6 md:p-12 col-span-8">
        <Image
          src="/background.jpg"
          alt="background"
          fill
          priority
          className="absolute inset-0 object-cover -z-10 opacity-30"
        />

        <h1 className="text-5xl md:text-7xl mx-auto font-bold mb-6 text-yellow-500">
          Risus
        </h1>

        {/* Categories */}
        <div className="flex gap-4 flex-wrap justify-center mb-8">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === cat.name ? null : cat.name
                )
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${
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
            className="flex-1 p-4 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={generateJoke}
            disabled={loadingJoke || (!userInput && !selectedCategory)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full flex items-center justify-center transition"
          >
            {loadingJoke ? "..." : <ArrowUp size={24} />}
          </button>
        </div>

        {/* Joke */}
        <div className="min-h-16 mb-4 text-center text-lg md:text-xl text-gray-900 dark:text-gray-100">
          {loadingJoke ? (
            "Thinking..."
          ) : joke ? (
            <div className="max-w-xl rounded backdrop-blur-lg shadow text-lg h-fit">
              {" "}
              {`"${joke}"`}
            </div>
          ) : (
            <p className="text-indigo-700">Your joke will appear here.</p>
          )}
        </div>

        {/* Feedback */}
        {joke && (
          <div className="flex gap-6 justify-center mt-4">
            <button
              onClick={() => sendFeedback("up")}
              className={`text-2xl transition ${
                rating === "up"
                  ? "text-green-500"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              👍
            </button>
            <button
              onClick={() => sendFeedback("down")}
              className={`text-2xl transition ${
                rating === "down"
                  ? "text-red-500"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              👎
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
