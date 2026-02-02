// "use client";

// import Image from "next/image";

// export default function HeroSection() {
//   return (
//     <section className="w-full flex items-center justify-center bg-[#fcfbf7]">
//       <div className="relative w-full h-screen">
//         <Image
//           src="/banner.webp" // image in /public
//           alt="Hero Image"
//           fill
//           priority
//           className="object-contain "
//         />
//       </div>
//     </section>
//   );
// }

"use client";

import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="w-full bg-[#fcfbf7]">
      <div className="relative w-full aspect-[16/9] sm:aspect-[4/3] md:aspect-[16/9]">
        <Image
          src="/banner.webp"
          alt="Annapurna Khakhra Banner"
          fill
          priority
          sizes="100vw"
          className="object-contain"
        />
      </div>
    </section>
  );
}

