"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { Hexagon, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth?action=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Login failed");
        return;
      }

      localStorage.setItem("elara_token", data.token);
      toast.success("Logged in!");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-[family-name:var(--font-display)] bg-white">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#121212] relative overflow-hidden flex-col justify-between p-12">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(57,255,20,0.12)_0%,transparent_60%)] pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="size-8 bg-[#39FF14] flex items-center justify-center rounded">
            <Hexagon className="size-5 text-black" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Elara</span>
        </Link>

        {/* Center content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10"
        >
          <h2 className="text-4xl font-bold tracking-tighter text-white mb-4">
            Proof-of-Thought
            <br />
            <span className="text-[#39FF14]">Protocol.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-md">
            Cryptographic accountability for AI agents. Verify reasoning, ensure integrity, build
            trust.
          </p>
        </motion.div>

        {/* Bottom status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative z-10"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-[#39FF14]/20 p-4 rounded inline-block">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
              Network
            </div>
            <div className="text-white font-mono text-sm font-bold flex items-center gap-2">
              <span className="size-2 bg-[#39FF14] rounded-full animate-pulse" />
              PROTOCOL_ACTIVE
            </div>
          </div>
        </motion.div>

        {/* Decorative lines */}
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 border-l border-t border-[#39FF14]/10 rounded-tl-[120px] pointer-events-none" />
        <div className="absolute top-20 right-20 size-40 border border-[#39FF14]/5 rounded-full pointer-events-none" />
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="size-8 bg-[#39FF14] flex items-center justify-center rounded">
              <Hexagon className="size-5 text-black" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#121212]">Elara</span>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-[#121212] mb-2">Welcome back</h1>
          <p className="text-slate-500 mb-8">Enter your credentials to access your dashboard.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#121212]">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 px-4 rounded border border-black/10 bg-slate-50 text-[#121212] text-sm placeholder:text-slate-400 outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/30 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#121212]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 px-4 rounded border border-black/10 bg-slate-50 text-[#121212] text-sm placeholder:text-slate-400 outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/30 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#39FF14] text-black rounded font-bold text-sm hover:shadow-[0_0_15px_rgba(57,255,20,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Logging in…
                </>
              ) : (
                <>
                  Log In
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#121212] font-medium hover:text-[#39FF14] transition-colors"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
