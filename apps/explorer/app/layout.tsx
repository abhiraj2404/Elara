import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Elara Explorer — Proof-of-Thought Protocol",
  description:
    "Verify AI agent autonomy. Browse cryptographic proof chains for any Elara-enabled agent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark font-sans", geist.variable, geistMono.variable)}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <a href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="text-lg">🔐</span>
              <span>Elara Explorer</span>
            </a>
            <span className="text-xs text-muted-foreground">Proof-of-Thought Protocol</span>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
