"use client";

import React from "react";
import { motion } from "framer-motion";

export default function CraftsmanshipHeritageSection({
  title = "Handcrafted with Heart, Rooted in Tradition.",
  text = "Every khakhra at Annapurna is prepared by skilled women artisans trained in the art of slow-roasting.\n Nothing factory-made. Nothing mass-produced. Only original, authentic, handcrafted crunch.",
  image = "/14.webp",
  ctaText = "Our Story",
  ctaHref = "/about",
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  return (
    <section className="relative w-full bg-gradient-to-br from-amber-50 via-white to-slate-50 py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(251,191,36,0.1),transparent)]" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">

        {/* LEFT CONTENT */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-8"
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl font-semibold font-heading bg-[#7C4A0E] bg-clip-text text-transparent leading-snug mb-6 tracking-tight"
          >
            {title}
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-[#cc760e] font-body text-base sm:text-lg md:text-xl max-w-xl leading-relaxed font-light whitespace-pre-line"
          >
            {text}
          </motion.p>

          <motion.a
            variants={itemVariants}
            href={ctaHref}
            className="group relative inline-block bg-gradient-to-r from-[#7C4A0E] to-[#aa7534] text-white font-body font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {ctaText}
          </motion.a>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          variants={imageVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative w-full h-[300px] sm:h-[380px] md:h-[440px] overflow-hidden rounded-3xl shadow-2xl group"
        >
          <img
            src={image}
            alt="Artisans preparing Khakhra"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-amber-100/20" />

          {/* Decorative overlays */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-amber-200/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-lg animate-bounce [animation-delay:1s]" />
        </motion.div>
      </div>

      {/* Bottom Decorative Wave */}
      <motion.div
        initial={{ translateY: 50, opacity: 0 }}
        whileInView={{ translateY: 0, opacity: 0.9 }}
        viewport={{ once: true }}
        className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0]"
      >
        <svg
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          className="w-full h-12 md:h-16 relative -translate-y-1"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fdfbf7" />
              <stop offset="50%" stopColor="#f5e8c7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fdfbf7" />
            </linearGradient>
          </defs>

          <path
            d="M0,0 C150,60 450,0 600,30 C750,60 1050,0 1200,30 L1200,60 L0,60 Z"
            fill="url(#waveGradient)"
            className="animate-wave"
          />
        </svg>

        <style jsx>{`
          @keyframes wave {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(10px); }
          }
          .animate-wave {
            animation: wave 6s ease-in-out infinite;
          }
        `}</style>
      </motion.div>
    </section>
  );
}
