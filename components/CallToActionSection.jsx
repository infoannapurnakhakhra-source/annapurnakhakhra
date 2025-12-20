"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion"; // Enhanced with AnimatePresence for better control

export default function CallToActionSection({
  content = "Ready To Taste Authentic Gruh Udhyog Goodness?",
  ctaText = "Shop All Flavours",
  ctaHref = "/collection",
  backgroundGradient = "from-amber-400 via-orange-300 to-amber-500", 
  backgroundImage = "/b5.webp", 
}) {
  // Variant definitions for reusable animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }, // Back ease for bouncy feel
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 30, rotateX: -90 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.6,
        delay: i * 0.05,
        ease: [0.34, 1.56, 0.64, 1], // Custom ease for elastic feel
      },
    }),
  };

  return (
    <AnimatePresence>
      <motion.section
        className="relative w-full py-16 md:py-24 text-center overflow-hidden"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Optional animated background image zoom if no prop provided, but since prop is used, skip */}
        {backgroundImage && (
          <motion.div
            className="absolute inset-0 opacity-0" // Hidden since main bg uses it
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        )}

        {/* Enhanced animated background with floating particles */}
        <div className="absolute inset-0 opacity-20">
          {/* Floating blobs with varied animations */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-12 h-12 md:w-20 md:h-20 bg-white/30 rounded-full mix-blend-multiply filter blur-xl ${i % 2 === 0 ? "top-20 left-20" : "bottom-20 right-20"
                }`}
              animate={{
                y: [0, -30, 0],
                x: [0, 20, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4 + i * 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Optional dynamic gradient overlay (lower opacity for image visibility) */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${backgroundGradient}`}
          animate={{
            opacity: [0.4, 0.5, 0.4], // Reduced opacity to let image shine through
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 z-10">
          {/* Container for staggered entrance */}
          <motion.div variants={containerVariants}>
            {/* Enhanced heading with 3D flip and stagger per word */}
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl font-heading font-semibold text-[#7C4A0E] mb-12  drop-shadow-lg" // Added drop-shadow for better readability over image
              variants={itemVariants}
            >
              {content.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  className="inline-block"
                  custom={index}
                  variants={wordVariants}
                  style={{ perspective: "1000px" }} // For 3D effect
                >
                  {word}{" "}
                </motion.span>
              ))}
            </motion.h2>

            {/* Supercharged button with multi-layer effects: ripple, pulse, and particle burst on hover */}
            <motion.a
              href={ctaHref}
              className="group relative inline-flex items-center font-body justify-center gap-3 bg-gradient-to-r from-[#7C4A0E] to-[#aa7534] text-white font-bold px-10 py-5 rounded-2xl shadow-xl overflow-hidden"
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                y: -4,
                boxShadow: "0 25px 50px -12px rgba(245, 158, 11, 0.4)",
              }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Main text */}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {ctaText}
                {/* Animated arrow icon */}
                <motion.svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 8, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </motion.svg>
              </span>

              {/* Multi-directional ripple effect */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-amber-200/80 to-orange-200/80 -translate-x-full group-hover:translate-x-full"
                transition={{ duration: 0.8, ease: "easeOut" }}
              />

              {/* Pulsing glow ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-200/30 via-amber-200/30 to-orange-200/30 blur-xl -inset-1 animate-pulse opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.5, delay: 0.2 }}
              />

              {/* Subtle particle burst on hover (using pseudo-elements simulation) */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
              >
                {/* Simulated particles with multiple small motions */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-2 h-2 bg-amber-300 rounded-full`}
                    style={{
                      top: `${20 + i * 10}%`,
                      left: `${10 + i * 15}%`,
                    }}
                    animate={{
                      x: [0, Math.random() * 50 - 25, 0],
                      y: [0, -Math.random() * 30, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.1,
                      repeat: 1,
                    }}
                  />
                ))}
              </motion.div>
            </motion.a>
          </motion.div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}