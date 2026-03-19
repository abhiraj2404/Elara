"use client";

import { motion } from "framer-motion";
import { Fingerprint, PenLine, BadgeCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Fingerprint,
    title: "Identity",
    description:
      "Decentralized identifiers specifically engineered for autonomous software entities. Persistent, globally unique, and revocable.",
  },
  {
    icon: PenLine,
    title: "Signing",
    description:
      "Cryptographic proof of every step in the thought process. Ensure that AI outputs haven't been tampered with or hallucinated mid-stream.",
  },
  {
    icon: BadgeCheck,
    title: "Verification",
    description:
      "Real-time validation of logical consistency. A mathematical guarantee that an agent's actions align with its governing instructions.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const;

export function ProtocolStack() {
  return (
    <section className="py-32 px-6 lg:px-20 max-w-7xl mx-auto">
      <div className="mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold text-[#121212] tracking-tight mb-4"
        >
          The Protocol Stack
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-slate-500 text-lg"
        >
          Infrastructure designed for the autonomy era.
        </motion.p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={cardVariants}
            className="group relative bg-slate-50 border border-black/5 p-8 rounded hover:border-[#39FF14] transition-all duration-300"
          >
            <div className="mb-6">
              <feature.icon className="size-9 text-[#121212]" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-[#121212] mb-3">{feature.title}</h3>
            <p className="text-slate-600 leading-relaxed font-normal">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
