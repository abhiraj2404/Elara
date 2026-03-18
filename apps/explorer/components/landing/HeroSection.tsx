"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Search } from "lucide-react";

export function HeroSection() {
  const [agentId, setAgentId] = useState("");
  const router = useRouter();

  const viewDocsHandler = () => {
    router.push(process.env.NEXT_PUBLIC_DOCS_URL ||" http://localhost:5000");
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (agentId.trim()) {
      router.push(`/agent/${encodeURIComponent(agentId.trim())}`);
    }
  };

  return (
    <section className="relative pt-24 pb-16 px-6 lg:px-20 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold tracking-tighter text-[#121212] mb-6"
        >
          Cryptographic Accountability <br />
          <span className="text-[#39FF14] bg-[#121212] px-4 inline-block -rotate-1">
            for AI Agents.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 font-normal"
        >
          The first Proof-of-Thought protocol enabling verifiable reasoning and
          deterministic integrity for autonomous entities.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-wrap justify-center gap-4"
        >
          <button className="bg-[#39FF14] text-black px-8 py-4 rounded font-bold hover:scale-[1.02] transition-transform shadow-[0_0_15px_rgba(57,255,20,0.4)]">
            Get Started
          </button>
          <button className="border border-black/10 hover:bg-black/5 text-[#121212] px-8 py-4 rounded font-bold transition-colors" onClick={viewDocsHandler}>
            View Documentation
          </button>
        </motion.div>

        {/* Agent Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="mt-10 max-w-lg mx-auto"
        >
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="agent-search"
                placeholder="Enter agent ID to explore"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full h-11 pl-9 pr-4 rounded border border-black/10 bg-slate-50 text-[#121212] text-sm placeholder:text-slate-400 outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/30 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!agentId.trim()}
              className="h-11 px-6 bg-[#121212] hover:bg-black text-white text-sm font-bold rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Explore
            </button>
          </form>
          <p className="mt-3 text-sm text-slate-500">
            Or{" "}
            <a href="/signup" className="text-[#121212] font-medium hover:text-[#39FF14] transition-colors">
              create an account
            </a>{" "}
            to start adding your own agents.
          </p>
        </motion.div>
      </div>

      {/* Visual: Wireframe Sphere */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        className="relative mt-20 flex justify-center"
      >
        <div className="relative size-[300px] md:size-[500px] bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.15)_0%,transparent_70%)] rounded-full border border-[#39FF14]/30 flex items-center justify-center overflow-hidden">
          {/* Inner wireframe rings */}
          <div className="absolute inset-0 border border-[#39FF14]/10 rounded-full scale-90 rotate-45" />
          <div className="absolute inset-0 border border-[#39FF14]/20 rounded-full scale-75 -rotate-12" />

          {/* Pulse signature line */}
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-[3px] bg-[#39FF14] shadow-[0_0_20px_#39FF14] rotate-[35deg]"
          />

          {/* Background texture */}
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBotHQSVXCPsoOY19WLz5af78AsJHYRAK8yz-0fMJk4SBV-4NOlpLQ45VipEruh1eWQB780UbJJ0pFG3QBWoXiiFNkBDAW0Owr7nvj43ynAiSZfl7ww6O3Sba5F1TdlnS1HcSpwRuHLX6XbEJO0CiPpuQPVV-EB-A6gYbJ91PzFAAPy6Ir78NFJ785qabHbqTgL1pdc56sdPA_RvTPnG7McWzHGIKiKOipI1gWI4R9dnITwSa-aXahBB_MhZ-aHPwviFAk9ac0Lcfo"
            alt="3D translucent wireframe sphere representing AI mind"
            fill
            className="object-cover mix-blend-multiply opacity-20"
            priority
          />
        </div>

        {/* Floating status card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
          className="absolute top-1/2 left-1/4 -translate-y-1/2 hidden lg:block"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-[#39FF14]/40 p-4 rounded">
            <div className="text-[10px] uppercase tracking-widest text-[#121212] font-bold mb-1">
              Status
            </div>
            <div className="text-[#121212] font-mono text-sm font-bold flex items-center gap-2">
              <span className="size-2 bg-[#39FF14] rounded-full" />
              COGNITION_VERIFIED
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
