"use client";

import { motion } from "framer-motion";
import { Lock, EyeOff, Activity } from "lucide-react";

const codeLines = [
  { num: 1, content: 'protocol.initialize({', color: "text-white" },
  { num: 2, content: '  agentId: "ELARA_AGENT_01",', color: "text-slate-400" },
  { num: 3, content: '  scheme: "ECDSA_P256",', color: "text-slate-400" },
  { num: 4, content: '  zkEnabled: true', color: "text-slate-400" },
  { num: 5, content: '});', color: "text-white" },
  { num: 6, content: '', color: "" },
  { num: 7, content: 'await protocol.proveThought(stream, {', color: "text-white" },
  { num: 8, content: '  depth: 12,', color: "text-slate-400" },
  { num: 9, content: '  integrityCheck: "STRICT"', color: "text-slate-400" },
  { num: 10, content: '});', color: "text-white" },
];

const specs = [
  {
    icon: Lock,
    title: "ECDSA P-256 Signatures",
    description:
      "Industry-standard elliptic curve cryptography ensuring high-performance non-repudiation for every agent interaction.",
  },
  {
    icon: EyeOff,
    title: "Zero-Knowledge Proofs (Optional)",
    description:
      "Privacy-preserving verification paths that prove correctness without revealing proprietary model prompts or sensitive data.",
  },
  {
    icon: Activity,
    title: "Real-time Telemetry",
    description:
      "Sub-millisecond latency for live cognitive monitoring and immediate intervention capabilities on drifting reasoning paths.",
  },
];

export function TechSpecs() {
  return (
    <section className="py-32 px-6 lg:px-20 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        {/* Left: Feature list */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="lg:w-1/2"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-[#121212] tracking-tight mb-8">
            Built for Scale. <br />
            <span className="text-slate-400">Hardened for Security.</span>
          </h2>

          <div className="space-y-8">
            {specs.map((spec, i) => (
              <motion.div
                key={spec.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                viewport={{ once: true }}
                className="flex gap-4"
              >
                <div className="size-10 rounded bg-[#39FF14]/10 flex items-center justify-center shrink-0">
                  <spec.icon className="size-5 text-[#121212]" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-[#121212] font-bold mb-1">{spec.title}</h4>
                  <p className="text-slate-500 text-sm font-normal">{spec.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Code preview */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true }}
          className="lg:w-1/2 w-full"
        >
          <div className="bg-[#121212] p-1 rounded overflow-hidden border border-black/10 shadow-[0_0_15px_rgba(57,255,20,0.4)]">
            <div className="bg-black/95 p-6 font-mono text-sm space-y-2">
              {codeLines.map((line) => (
                <div key={line.num} className="flex gap-2">
                  <span className="text-[#39FF14]/50 select-none w-6 text-right">{line.num}</span>
                  <span className={line.color}>{line.content}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
