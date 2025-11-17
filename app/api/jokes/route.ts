import { NextResponse } from "next/server";
import { GoogleGenAI, type GenerateContentParameters } from "@google/genai";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import jokes from "../../data/jokes.json";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    console.log("POST /api/gen-joke-and-image called");

    // 1️⃣ Parse incoming JSON
    let body;
    try {
      body = await req.json();
      console.log("Request body:", body);
    } catch (parseErr) {
      console.error("Failed to parse request body:", parseErr);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { keywords, userInput } = body;

    if (!userInput && !keywords) {
      console.log("No keywords or userInput provided");
      return NextResponse.json(
        { error: "Please provide keywords or user input" },
        { status: 400 }
      );
    }

    // 2️⃣ Check jokes data
    if (!jokes || !Array.isArray(jokes) || jokes.length === 0) {
      console.error("Jokes JSON is empty or invalid");
      return NextResponse.json(
        { error: "No jokes available" },
        { status: 500 }
      );
    }
    console.log(`Loaded ${jokes.length} jokes from JSON`);

    // 3️⃣ Pick 5 random examples
    const examples = jokes.sort(() => 0.5 - Math.random()).slice(0, 5);
    console.log("Selected example jokes:", examples);

    // 4️⃣ Build few-shot prompt safely
    const fewShotText = examples
      .map((j, idx) => {
        const promptPart =
          j.prompt?.split("keywords:")[1]?.trim() ?? "[missing keywords]";
        const completionPart = j.completion ?? "[missing completion]";
        return `Example ${
          idx + 1
        }:\nKeywords: ${promptPart}\nJoke: ${completionPart}`;
      })
      .join("\n\n");
    console.log("Few-shot text:\n", fewShotText);

    const prompt = `
You are a joke-generating AI. Here are some example jokes:
${fewShotText}

Now create a new, original joke using keywords: "${keywords}" and user description: "${userInput}".
`;
    console.log("Final prompt:\n", prompt);

    // 5️⃣ Call Gemini API
    let response;
    try {
      const params: GenerateContentParameters = {
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      };
      response = await ai.models.generateContent(params);
      console.log("Gemini response:", response);
    } catch (aiErr) {
      console.error("Gemini API call failed:", aiErr);
      return NextResponse.json(
        { error: "AI generation failed" },
        { status: 500 }
      );
    }

    // 6️⃣ Parse AI output
    const jokeCandidate =
      response.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .join("") ?? "";
    const joke = jokeCandidate.trim() || "No joke generated.";
    console.log("Generated joke:", joke);

    // 7️⃣ Save to Firestore
    try {
      const docRef = await addDoc(collection(db, "jokes"), {
        joke,
        userInput,
        createdAt: new Date().toISOString(),
      });
      console.log("Joke saved to Firestore, doc ID:", docRef.id);
    } catch (dbErr) {
      console.error("Failed to save joke to Firestore:", dbErr);
      return NextResponse.json(
        {
          error: "DB save failed",
          details: dbErr instanceof Error ? dbErr.message : dbErr,
        },
        { status: 500 }
      );
    }

    // 8️⃣ Return result
    return NextResponse.json({ joke });
  } catch (err) {
    console.error("Unexpected error in POST handler:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
