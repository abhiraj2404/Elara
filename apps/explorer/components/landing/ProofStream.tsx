"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Shield, Key, GitBranch } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StreamItem {
  icon: LucideIcon;
  hash: string;
  block: string;
  description: string;
  time: string;
  faded?: boolean;
}

const streamItems: StreamItem[] = [
  {
    icon: ShieldCheck,
    hash: "0x71C...492E",
    block: "842,012",
    description: "Reasoning Path Verified",
    time: "2ms ago",
  },
  {
    icon: Shield,
    hash: "0x4A2...881B",
    block: "842,011",
    description: "Logical Consistency Checked",
    time: "8ms ago",
  },
  {
    icon: Key,
    hash: "0x9B1...022F",
    block: "842,010",
    description: "Cryptographic Signature Finalized",
    time: "14ms ago",
  },
  {
    icon: GitBranch,
    hash: "0xF33...771A",
    block: "842,009",
    description: "Agent ID Authenticated",
    time: "22ms ago",
    faded: true,
  },
];

export function ProofStream() {
  return (
    <section className="py-20 border-y border-black/5 bg-slate-50">
      <div className="px-6 lg:px-20">
        <h4 className="text-[#121212] text-xs uppercase tracking-[0.3em] font-bold text-center mb-12">
          Proof Stream
        </h4>

        <div className="max-w-2xl mx-auto h-[320px] overflow-hidden relative [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
          <div className="flex flex-col gap-4">
            {streamItems.map((item, i) => (
              <motion.div
                key={item.hash}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: item.faded ? 0.5 : 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="bg-white backdrop-blur-xl border border-black/5 flex items-center justify-between p-4 rounded"
              >
                <div className="flex items-center gap-4">
                  <item.icon className="size-5 text-[#39FF14] shrink-0" />
                  <div>
                    <p className="text-[#121212] font-mono text-sm font-bold">{item.hash}</p>
                    <p className="text-slate-500 text-xs">
                      Block {item.block} • {item.description}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#121212] bg-[#39FF14]/20 px-2 py-1 rounded font-bold whitespace-nowrap">
                  {item.time}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
