"use client";

import { motion } from "framer-motion";
import { CircleCheck } from "lucide-react";

interface Tier {
  name: string;
  price: string;
  suffix?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const tiers: Tier[] = [
  {
    name: "Developer",
    price: "$0",
    suffix: " / mo",
    features: ["Up to 3 Agents", "Basic Telemetry", "Community Support"],
    cta: "Start Building",
  },
  {
    name: "Team",
    price: "$199",
    suffix: " / mo",
    features: [
      "Unlimited Agents",
      "Advanced Analytics",
      "Priority Infrastructure",
      "ZK-Proof Add-ons",
    ],
    cta: "Get Team Access",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Custom SLA Agreements",
      "On-Prem Deployment",
      "24/7 Dedicated Support",
      "Audit-Ready Reporting",
    ],
    cta: "Contact Sales",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function Pricing() {
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
            Simple, Transparent Tiers
          </motion.h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={cardVariants}
              className={`p-8 rounded flex flex-col bg-white backdrop-blur-xl border ${
                tier.highlighted
                  ? "border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.4)] relative"
                  : "border-black/[0.08]"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#39FF14] text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <h4 className="text-[#121212] font-bold text-xl mb-2">{tier.name}</h4>
              <div className="text-3xl font-bold text-[#121212] mb-6">
                {tier.price}
                {tier.suffix && (
                  <span className="text-sm font-normal text-slate-400">{tier.suffix}</span>
                )}
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-slate-600 text-sm">
                    <CircleCheck className="size-[18px] text-[#39FF14] shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded font-bold transition-all ${
                  tier.highlighted
                    ? "bg-[#39FF14] text-black hover:opacity-90"
                    : "border border-black/10 text-[#121212] hover:bg-black/5"
                }`}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
