"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ShopByOilPreferenceSection({
  title = "Choose Your Oil. Choose Your Lifestyle.",
  oils = [
    {
      name: "Vegetable Oil Khakhra",
      desc: "Light, crisp, and perfect for daily snacking.",
      image: "/7.webp",
      cta: "Shop Now",
      link: "/shop/veg-oil",
    },
    {
      name: "Groundnut Oil Khakhra",
      desc: "Rich aroma & wholesome traditional taste.",
      image: "/8.webp",
      cta: "Shop Now",
      link: "/shop/groundnut-oil",
    },
    {
      name: "Pure Ghee Khakhra",
      desc: "Luxurious, aromatic, and truly divine.",
      image: "/9.webp",
      cta: "Shop Now",
      link: "/shop/pure-ghee",
    },
  ],
}) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { delayChildren: 0.2, staggerChildren: 0.18 },
    },
  };

  const card = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 12 },
    },
  };

  return (
    <section className="relative w-full bg-[#fdfbf7] py-20 md:py-28 overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.35) 1px, transparent 0)",
          backgroundSize: "55px 55px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-[#7C4A0E]">
            {title}
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12"
        >
          {oils.map((oil, index) => (
            <motion.div
              key={index}
              variants={card}
              whileHover={{
                scale: 1.06,
                rotateY: 6,
                rotateX: 2,
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              }}
              transition={{ type: "spring", stiffness: 150, damping: 10 }}
              className="relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 shadow-lg overflow-hidden group"
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            >
              <div className="relative w-full rounded-b-3xl overflow-hidden">
                <motion.img
                  src={oil.image}
                  alt={oil.name}
                  loading="lazy"
                  className="w-full h-auto object-contain transition-transform duration-[1400ms] group-hover:scale-105"
                  whileHover={{ rotate: -1 }}
                />
              </div>

              <div className="p-7 text-center">
                <h3 className="text-2xl font-bold font-heading text-[#7C4A0E]">
                  {oil.name}
                </h3>

                <p className="text-[#cc760e] font-body mt-2 mb-6 text-sm sm:text-base">
                  {oil.desc}
                </p>

                <motion.a
                  href={oil.link}
                  whileHover={{ scale: 1.1 }}
                  className="inline-block bg-gradient-to-r font-body from-[#7C4A0E] to-[#aa7534] text-[#ffffff] font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-xl transition-all"
                >
                  {oil.cta}
                </motion.a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0] opacity-90">
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-14 md:h-20">
          <path d="M0,0 C300,40 900,40 1200,0 L1200,60 L0,60 Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  );
}
