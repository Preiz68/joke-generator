import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "../../../lib/firebase";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { joke } = await req.json();
    if (!joke) {
      return NextResponse.json({ error: "No joke provided" }, { status: 400 });
    }

    const imagePrompt = `Create a funny, cartoon-style illustration representing this joke: "${joke}". No text in image.`;

    const imageResp = await ai.models.generateImages({
      model: "gemini-2.5-flash-image",
      prompt: imagePrompt,
      config: { numberOfImages: 1, aspectRatio: "1:1" },
    });

    const firstImage: any = imageResp.generatedImages?.[0];
    if (!firstImage) {
      throw new Error("No image generated in array");
    }

    const base64Data =
      firstImage.b64Json ||
      firstImage.b64_json ||
      firstImage.dataUri?.split(",")[1];

    if (!base64Data) {
      console.error(
        "Could not find any known property for image data:",
        firstImage
      );
      return NextResponse.json(
        { error: "Unsupported image response format" },
        { status: 500 }
      );
    }

    const imageRef = ref(storage, `jokes/${Date.now()}.png`);
    await uploadString(imageRef, base64Data, "base64", {
      contentType: "image/png",
    });
    const imageUrl = await getDownloadURL(imageRef);

    return NextResponse.json({ joke, image: imageUrl });
  } catch (err) {
    console.error("Error generating image:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
