"use client";

import { motion } from "framer-motion";

export function FinalCTA() {
  return (
    <section className="py-32 px-6 lg:px-20 text-center relative overflow-hidden bg-white">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold text-[#121212] tracking-tighter mb-8"
        >
          Ready to secure your AI?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          viewport={{ once: true }}
          className="text-xl text-slate-600 mb-12 font-normal"
        >
          Join the leading AI labs and enterprises using Elara to build the foundation of autonomous
          trust.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <button className="bg-[#39FF14] text-black px-10 py-5 rounded font-bold text-lg hover:scale-[1.02] transition-transform shadow-[0_0_15px_rgba(57,255,20,0.4)]">
            Get Started for Free
          </button>
          <button className="border border-black/10 hover:bg-black/5 text-[#121212] px-10 py-5 rounded font-bold text-lg transition-colors">
            Talk to an Expert
          </button>
        </motion.div>
      </div>
    </section>
  );
}
