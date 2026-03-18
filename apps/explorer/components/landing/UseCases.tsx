"use client";

import { motion } from "framer-motion";
import { Bot, GitBranch, Scale, Bitcoin } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface UseCase {
  icon: LucideIcon;
  title: string;
  description: string;
}

const useCases: UseCase[] = [
  {
    icon: Bot,
    title: "AI Agents",
    description:
      "Verifiable reasoning for LLM-based assistants executing complex multi-step tasks.",
  },
  {
    icon: GitBranch,
    title: "Autonomous Workflows",
    description:
      "Ensuring deterministic execution for headless processes and automated business logic.",
  },
  {
    icon: Scale,
    title: "Compliance & Audit",
    description:
      "Immutable proof logs for regulatory review of AI decision-making history.",
  },
  {
    icon: Bitcoin,
    title: "Web3 Agents",
    description:
      "Securing on-chain transactions initiated by autonomous entities with cryptographic signatures.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export function UseCases() {
  return (
    <section className="py-32 px-6 lg:px-20 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-[#121212] tracking-tight mb-4"
          >
            Programmable Trust
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-slate-500 text-lg max-w-2xl mx-auto"
          >
            Deploying Elara across the most demanding intelligent environments.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {useCases.map((uc) => (
            <motion.div
              key={uc.title}
              variants={cardVariants}
              className="p-8 border border-black/5 bg-white rounded hover:border-[#39FF14]/50 transition-colors duration-300"
            >
              <uc.icon className="size-6 text-[#39FF14] mb-6" />
              <h4 className="text-[#121212] font-bold mb-3">{uc.title}</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{uc.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
