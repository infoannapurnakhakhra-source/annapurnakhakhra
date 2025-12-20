"use client";

import React from "react";
import { motion } from "framer-motion";

export default function KhakhraMakingProcess() {
  const steps = [
    {
      image: "/k5.webp",
      title: "Premium Ingredients",
      desc: "Finest wheat, spices, and oils carefully selected for rich authentic taste."
    },
    {
      image: "/k6.webp",
      title: "Perfect Dough",
      desc: "Soft, smooth dough kneaded with precision for ideal texture."
    },
    {
      image: "/k7.webp",
      title: "Hand Rolling",
      desc: "Each khakhra is rolled evenly for thin, uniform crispness."
    },
    {
      image: "/k8.webp",
      title: "Slow Roasting",
      desc: "Roasted on low flame to achieve a golden, crunchy perfection."
    },
    {
      image: "/k9.webp",
      title: "Flavor Seasoning",
      desc: "Balanced seasoning added for consistent, delightful taste."
    },
    {
      image: "/k10.webp",
      title: "Fresh Packing",
      desc: "Packed with hygiene and care so freshness stays locked in."
    }
  ];

  return (
    <section className="py-20 bg-[#fff7e5] relative overflow-hidden">

      {/* Soft Background Pattern */}
      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl font-extrabold mb-4 bg-[#7C4A0E] font-heading bg-clip-text text-transparent"
        >
          How Our Khakhra is Made
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-2xl mx-auto text-[#cc760e] font-body mb-14 text-lg"
        >
          Traditional techniques blended with modern hygiene. Each Khakhra is handmade with care, purity and love.
        </motion.p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/40 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="h-auto w-full overflow-hidden flex items-center justify-center">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full object-contain"
                />
              </div>

              {/* Text */}
              <div className="p-7 text-center">
                <h3 className="text-2xl font-semibold font-heading text-[#7C4A0E] mb-2">
                  {step.title}
                </h3>
                <p className="text-[#cc760e] font-body text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
