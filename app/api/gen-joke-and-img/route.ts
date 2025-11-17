import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import jokesData from "../../data/jokes.json";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { userInput } = await req.json();
    if (!userInput)
      return NextResponse.json({ error: "No input" }, { status: 400 });

    // Prepare prompt including local jokes as context
    const prompt = `Using these jokes as inspiration: ${JSON.stringify(
      jokesData.slice(0, 50) // maybe limit to first 50 for performance
    )}, write a short witty joke about: "${userInput}"`;

    // Generate joke
    const jokeResp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const jokeCandidate =
      jokeResp.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        .join("") ?? "No joke generated.";

    const joke = jokeCandidate.trim();

    // Generate image
    // const imageResp = await ai.models.generateImages({
    //   model: "gemini-2.5-flash-image",
    //   prompt: `Create a funny, cartoon-style illustration for: "${joke}"`,
    //   config: { numberOfImages: 1, aspectRatio: "1:1" },
    // });

    // const firstImage: any = imageResp.generatedImages?.[0];
    // const base64Data =
    //   firstImage?.b64Json ||
    //   firstImage?.b64_json ||
    //   firstImage?.dataUri?.split(",")[1];

    // let imageUrl: string | null = null;
    // if (base64Data) {
    //   const imageRef = ref(storage, `jokes/${Date.now()}.png`);
    //   await uploadString(imageRef, base64Data, "base64", {
    //     contentType: "image/png",
    //   });
    //   imageUrl = await getDownloadURL(imageRef);
    // }

    // // Save to Firestore
    // await addDoc(collection(db, "jokes"), {
    //   joke,
    //   imageUrl,
    //   createdAt: new Date().toISOString(),
    // });

    return NextResponse.json({ joke });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
