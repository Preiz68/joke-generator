import fs from "fs";
import fetch from "node-fetch";

const NUM_JOKES = 1000;
const OUTPUT_FILE = "gemini_jokes_keywords.json";
const DELAY = 200;

const headers = {
  "User-Agent": "Node.js Joke Scraper",
  Accept: "application/json",
};

interface JokeItem {
  joke: string;
  source: string;
  keywords: string[];
}

interface GeminiFormat {
  prompt: string;
  completion: string;
}

interface IcanHazDadJokeResponse {
  id: string;
  joke: string;
  status: number;
}

interface JokeAPIResponse {
  error: boolean;
  category: string;
  type: string;
  joke?: string;
}

interface RedditPost {
  data: {
    title: string;
    selftext: string;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
  };
}

// Safe type guards
function isIcanHazResponse(obj: any): obj is IcanHazDadJokeResponse {
  return obj && typeof obj.joke === "string" && typeof obj.id === "string";
}

function isJokeAPIResponse(obj: any): obj is JokeAPIResponse {
  return obj && typeof obj.error === "boolean" && typeof obj.type === "string";
}

function isRedditResponse(obj: any): obj is RedditResponse {
  return obj && obj.data && Array.isArray(obj.data.children);
}

function generateKeywords(jokeItem: JokeItem): string[] {
  const kws = [jokeItem.source];
  if (jokeItem.source === "jokeapi") kws.push("general");
  else if (jokeItem.source === "icanhaz") kws.push("dad");
  else if (jokeItem.source === "reddit") kws.push("top");
  return kws;
}

async function fetchIcanhazDadJoke(): Promise<JokeItem | null> {
  try {
    const res = await fetch("https://icanhazdadjoke.com/", { headers });
    const data = await res.json();
    if (isIcanHazResponse(data)) {
      const jokeItem: JokeItem = {
        joke: data.joke.trim(),
        source: "icanhaz",
        keywords: [],
      };
      jokeItem.keywords = generateKeywords(jokeItem);
      return jokeItem;
    }
  } catch (err) {
    console.log("icanhazdadjoke error:", err);
  }
  return null;
}

async function fetchJokeAPI(): Promise<JokeItem | null> {
  try {
    const res = await fetch("https://v2.jokeapi.dev/joke/Any?type=single", {
      headers,
    });
    const data = await res.json();
    if (isJokeAPIResponse(data) && data.joke) {
      const jokeItem: JokeItem = {
        joke: data.joke.trim(),
        source: "jokeapi",
        keywords: [],
      };
      jokeItem.keywords = generateKeywords(jokeItem);
      return jokeItem;
    }
  } catch (err) {
    console.log("JokeAPI error:", err);
  }
  return null;
}

async function fetchRedditJokes(limit = 10): Promise<JokeItem[]> {
  const jokes: JokeItem[] = [];
  try {
    const res = await fetch(
      `https://www.reddit.com/r/Jokes/top/.json?t=all&limit=${limit}`,
      {
        headers: { ...headers, "User-Agent": "nodejs-gemini-joke-scraper" },
      }
    );
    const data = await res.json();
    if (isRedditResponse(data)) {
      const posts = data.data.children;
      for (const post of posts) {
        const title = post.data?.title;
        const punchline = post.data?.selftext;
        if (title && punchline) {
          const jokeItem: JokeItem = {
            joke: `${title} ${punchline}`.trim(),
            source: "reddit",
            keywords: [],
          };
          jokeItem.keywords = generateKeywords(jokeItem);
          jokes.push(jokeItem);
        }
      }
    }
  } catch (err) {
    console.log("Reddit error:", err);
  }
  return jokes;
}

// Sleep helper
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const jokesMap = new Map<string, JokeItem>();
  let attempts = 0;

  while (jokesMap.size < NUM_JOKES && attempts < NUM_JOKES * 10) {
    const source = ["icanhaz", "jokeapi", "reddit"][
      Math.floor(Math.random() * 3)
    ];
    let jokeItem: JokeItem | null = null;

    if (source === "icanhaz") jokeItem = await fetchIcanhazDadJoke();
    else if (source === "jokeapi") jokeItem = await fetchJokeAPI();
    else if (source === "reddit") {
      const redditJokes = await fetchRedditJokes(5);
      if (redditJokes.length > 0)
        jokeItem = redditJokes[Math.floor(Math.random() * redditJokes.length)];
    }

    if (jokeItem && jokeItem.joke.length > 10) {
      const key = jokeItem.joke.toLowerCase();
      if (!jokesMap.has(key)) jokesMap.set(key, jokeItem);
    }

    attempts++;
    process.stdout.write(`\rCollected ${jokesMap.size} jokes...`);
    await sleep(DELAY);
  }

  const geminiData: GeminiFormat[] = Array.from(jokesMap.values()).map((j) => ({
    prompt: `Write a funny joke in a ${
      j.source
    }-style format using keywords: ${j.keywords.join(", ")}.`,
    completion: j.joke,
  }));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(geminiData, null, 2), "utf-8");
  console.log(`\nDone! Collected ${geminiData.length} jokes.`);
  console.log(`Saved to ${OUTPUT_FILE}`);
}

main().catch((err) => console.error("Fatal error:", err));
