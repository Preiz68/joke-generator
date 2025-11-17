import ToggleDarkmode from "../components/ToggleDarkmode";
import "./globals.css";
import { ReactNode } from "react";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Risus (AI-Joke Generator)",
  description: "AI powered joke generator that creates jokes along with images",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.className} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
