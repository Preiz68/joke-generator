// app/api/feedback/route.ts
import { NextResponse } from "next/server";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Add feedback to Firestore
    await addDoc(collection(db, "feedback"), {
      ...body,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Feedback save failed:", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
