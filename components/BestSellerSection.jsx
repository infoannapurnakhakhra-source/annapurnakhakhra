
"use client";

import Link from "next/link";

export default function BestSellerSection() {
  const products = [
    { name: "Chat Khakhra", img: "/Single Chat Khakhra.webp", href: "chaat-khakhra-made-with-pure-ghee" },
    { name: "Palak Khakhra", img: "/Single Palak Khakhra.webp", href: "palak-khakhra-made-with-pure-ghee" },
    { name: "Manchurian Khakhra", img: "/Single Manchurian Khakhra.webp", href: "manchurian-khakhra-made-with-pure-ghee" },
    { name: "Panipuri Khakhra", img: "/Single Panipuri Khakhra.webp", href: "panipuri-khakhra-made-with-pure-ghee" },
    { name: "Makai Khakhra", img: "/Single Makai Khakhra.webp", href: "makai-khakhra-made-with-pure-ghee" },
    { name: "Ragi Khakhra", img: "/Single Ragi Khakhra.webp", href: "ragi-khakhra-made-with-pure-ghee" },
  ];

  return (
    <section className="py-8 sm:py-12 md:py-16 px-4">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-10 text-[#013348]">
        Best Seller
      </h2>

      {/* MOBILE: STACKED (< 768px) */}
      <div className="flex flex-col items-center gap-8 md:hidden">
        {/* Video First on Mobile */}
        <div className="w-64 h-64">
          <video
            src="/grok-video-49cb73cb-1808-4dd5-b1b0-a8b78812a74d.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-contain rounded-xl"
          />
        </div>

        {/* Products Grid Below Video */}
        <div className="grid grid-cols-2 gap-6 w-full max-w-md">
          {products.map((p, i) => (
            <Link key={i} href={`/product/${p.href}`} className="text-center cursor-pointer">
              <img
                src={p.img}
                alt={p.name}
                className="w-28 h-28 rounded-full object-cover mx-auto hover:scale-105 transition"
              />
              <p className="mt-2 text-sm font-medium">{p.name}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* TABLET: 2 ROWS LAYOUT (768px - 1024px) */}
      <div className="hidden md:block lg:hidden">
        {/* Video Centered */}
        <div className="w-64 h-64 md:w-72 md:h-72 mx-auto mb-8">
          <video
            src="/grok-video-49cb73cb-1808-4dd5-b1b0-a8b78812a74d.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-contain rounded-xl"
          />
        </div>

        {/* Products in 2 Rows */}
        <div className="space-y-8">
          {/* First Row - 3 Products */}
          <div className="flex justify-center gap-8">
            {products.slice(0, 3).map((p, i) => (
              <Link key={i} href={`/product/${p.href}`} className="text-center cursor-pointer">
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover mx-auto hover:scale-105 transition"
                />
                <p className="mt-2 font-medium">{p.name}</p>
              </Link>
            ))}
          </div>

          {/* Second Row - 3 Products */}
          <div className="flex justify-center gap-8">
            {products.slice(3, 6).map((p, i) => (
              <Link key={i} href={`/product/${p.href}`} className="text-center cursor-pointer">
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover mx-auto hover:scale-105 transition"
                />
                <p className="mt-2 font-medium">{p.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* DESKTOP: HORIZONTAL LAYOUT (≥ 1024px) */}
      <div className="hidden lg:flex lg:items-center lg:justify-center gap-10">
        {/* LEFT SIDE - 3 Products */}
        <div className="flex gap-10">
          {products.slice(0, 3).map((p, i) => (
            <Link key={i} href={`/product/${p.href}`} className="text-center cursor-pointer">
              <img
                src={p.img}
                alt={p.name}
                className="w-36 h-36 rounded-full object-cover mx-auto hover:scale-105 transition"
              />
              <p className="mt-2 font-medium">{p.name}</p>
            </Link>
          ))}
        </div>

        {/* CENTER - Video */}
        <div className="w-64 h-64">
          <video
            src="/grok-video-49cb73cb-1808-4dd5-b1b0-a8b78812a74d.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-contain rounded-xl"
          />
        </div>

        {/* RIGHT SIDE - 3 Products */}
        <div className="flex gap-10">
          {products.slice(3, 6).map((p, i) => (
            <Link key={i} href={`/product/${p.href}`} className="text-center cursor-pointer">
              <img
                src={p.img}
                alt={p.name}
                className="w-36 h-36 rounded-full object-cover mx-auto hover:scale-105 transition"
              />
              <p className="mt-2 font-medium">{p.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}