"use client";

import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="w-full flex items-center justify-center bg-[#fcfbf7]">
      <div className="relative w-full h-[30vh] sm:h-[40vh] md:h-[55vh] lg:h-[60vh] xl:h-[90vh] 2xl:h-[95vh]">
        <Image
          src="/b9.webp" // image in /public
          alt="Hero Image"
          fill
          priority
          className="object-contain "
        />
      </div>
    </section>
  );
}
