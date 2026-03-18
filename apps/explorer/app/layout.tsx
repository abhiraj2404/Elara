import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Elara | Proof-of-Thought Protocol",
  description:
    "The first Proof-of-Thought protocol enabling verifiable reasoning and deterministic integrity for autonomous entities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(geist.variable, geistMono.variable, spaceGrotesk.variable)}>
      <body className="min-h-screen bg-white antialiased overflow-x-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
