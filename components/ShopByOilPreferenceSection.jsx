"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ShopByOilPreferenceSection({
  title = "Choose Your Oil. Choose Your Lifestyle.",
  oils = [
    {
      name: "Oil Khakhra",
      desc: "Light, crisp, and perfect for daily snacking.",
      image: "/7.webp",
      cta: "Shop Now",
      link: "/shop/veg-oil",
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
  return (
    <section className="relative bg-[#fdfbf7] py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#7C4A0E]">
            {title}
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {oils.map((oil, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl border border-amber-100 shadow-sm hover:shadow-xl transition overflow-hidden"
            >
              {/* Image */}
              <div className="bg-[#fff7ec] p-0 ">
                <img
                  src={oil.image}
                  alt={oil.name}
                  className="w-auto h-full object-contain"
                />
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-[#7C4A0E] mb-2">
                  {oil.name}
                </h3>

                <p className="text-sm text-[#9c6b2f] mb-5">
                  {oil.desc}
                </p>

              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
