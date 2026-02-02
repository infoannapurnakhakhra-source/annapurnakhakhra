"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Phone, Mail, MapPin, ChevronDown, ChevronUp, Youtube, Facebook, Instagram, } from "lucide-react";
import DownloadBrochure from "./DownloadBrochure";
export default function Footer() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (name) => {
    setOpenSection(openSection === name ? null : name);
  };




  const router = useRouter();

  const pathname = usePathname();
  const isProductPage = pathname.startsWith("/product/");

  const quickLinks = [
    // { name: "Home", path: "/" },
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { path: "/shopbycollection", name: "Collection" },
    { path: "/gallery", name: "Gallery" },
    { path: "/blog", name: "Blog" },
    { path: "/contact", name: "Contact" },
  ];

  const policiesLinks = [
    { name: "Terms & Conditions", path: "/terms&condition" },
    { name: "Shipping Policy", path: "/shipping-policy" },
    { name: "Return Policy", path: "/return-policy" },
    { name: "Privacy Policy", path: "/privacy-policy" },
  ];

  return (
    <footer className={`bg-yellow-50 text-gray-800 border-t border-amber-200 w-full ${isProductPage ? "pb-24" : "mb-0"}`}>
      {/* TOP GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 
                      grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 
                      gap-6 sm:gap-8 lg:gap-10">

        {/* BRAND */}
        <div className="text-center md:text-left col-span-1 md:col-span-2 lg:col-span-1 order-1">
          <Link href="/" className="inline-block">
            <img
              src="/logo.webp"
              alt="Khakhra Logo"
              className="w-32 sm:w-36 md:w-[200px] mx-auto md:mx-0 h-auto rounded-xl mb-3 sm:mb-4"
            />
          </Link>

          <p className="text-amber-700 font-body text-xs sm:text-sm md:text-base leading-relaxed px-2 md:px-0">
            Khakhra brings the crunchy delight of Gujarati tradition to your table.
            <br className="hidden sm:block" />
            <span className="text-amber-800 font-medium block mt-1 sm:inline">
              Crispy. Flavorful. Authentic.
            </span>
          </p>

          {/* Social Media Links */}
          <div className="flex justify-center md:justify-start gap-4 mt-4">
            <a
              href="https://www.instagram.com/annapurna_khakhra?igsh=amI0Yzc0c3J1ZGty"
              target="_blank"
              className="w-10 h-10 rounded-full  bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center hover:scale-110 transition shadow-md"
            >
              <Instagram className="w-5 h-5 text-white" />
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=61584134072914"
              target="_blank"
              className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center hover:scale-110 transition shadow-md"
            >
              <Facebook className="w-5 h-5 text-white" />
            </a>

            <a
              href="https://wa.me/9638478118"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-md hover:scale-110 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="white"
              >
                <path d="M20.52 3.48A11.91 11.91 0 0012.06 0C5.45 0 .06 5.39.06 12c0 2.11.55 4.17 1.6 6L0 24l6.17-1.61a11.93 11.93 0 005.89 1.5h.01c6.61 0 12-5.39 12-12a11.92 11.92 0 00-3.55-8.41zM12.06 21a9 9 0 01-4.59-1.25l-.33-.2-3.66.96.98-3.57-.22-.36A9 9 0 1112.06 21zm5.23-6.42c-.29-.15-1.72-.85-1.99-.95-.27-.1-.47-.15-.67.15-.2.29-.77.95-.94 1.14-.17.2-.35.22-.64.07-.29-.15-1.23-.45-2.35-1.43-.87-.77-1.45-1.72-1.62-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.15-.17.2-.29.29-.47.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.29-1.04 1.02-1.04 2.48s1.06 2.87 1.21 3.07c.15.2 2.09 3.19 5.07 4.48.71.31 1.26.49 1.69.63.7.22 1.34.19 1.84.12.56-.08 1.72-.7 1.96-1.38.25-.68.25-1.26.17-1.38-.07-.12-.27-.2-.56-.35z" />
              </svg>
            </a>

            <a
              href="https://youtube.com"
              target="_blank"
              className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center hover:scale-110 transition shadow-md"
            >
              <Youtube className="w-5 h-5 text-white" />
            </a>


          </div>
        </div>


        {/* QUICK LINKS */}
        <div className="md:text-left border-b border-amber-200 md:border-none pb-4 order-3 md:order-2">
          <button
            className="w-full flex justify-between items-center md:block text-left cursor-pointer"
            onClick={() => toggleSection("quick")}
          >
            <h3 className="text-base sm:text-lg font-semibold text-amber-800 mb-3">
              Quick Links
            </h3>

            <span className="md:hidden text-amber-800">
              {openSection === "quick" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </span>
          </button>

          <ul
            className={`overflow-hidden transition-all duration-300 ease-in-out md:block 
            ${openSection === "quick" ? "max-h-100" : "max-h-0 md:max-h-full"}`}
          >

            {quickLinks.map((link) => (
              <li key={link.path} className="mb-2">
                <Link
                  href={link.path}
                  className="text-amber-700 hover:text-amber-900 text-xs sm:text-sm md:text-base block py-1"
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li><DownloadBrochure /></li>
          </ul>
        </div>

        {/* POLICIES */}
        <div className="md:text-left border-b border-amber-200 md:border-none pb-4 order-2 md:order-3">
          <button
            className="w-full flex justify-between items-center md:block text-left cursor-pointer"
            onClick={() => toggleSection("policies")}
          >
            <h3 className="text-base sm:text-lg font-semibold text-amber-800 mb-3">
              Policies
            </h3>

            <span className="md:hidden text-amber-800">
              {openSection === "policies" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </span>
          </button>

          <ul
            className={`overflow-hidden transition-all duration-300 ease-in-out md:block 
            ${openSection === "policies" ? "max-h-100" : "max-h-0 md:max-h-full"}`}
          >
            {policiesLinks.map((link) => (
              <li key={link.path} className="mb-2">
                <Link
                  href={link.path}
                  className="text-amber-700 hover:text-amber-900 text-xs sm:text-sm md:text-base block py-1"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* CONTACT */}
        <div className="md:text-left border-b border-amber-200 md:border-none pb-4 order-4">
          <button
            className="w-full flex justify-between items-center md:block text-left cursor-pointer"
            onClick={() => toggleSection("contact")}
          >
            <h3 className="text-base sm:text-lg font-semibold text-amber-800 mb-3">
              Contact Info
            </h3>
            <span className="md:hidden text-amber-800">
              {openSection === "contact" ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </span>
          </button>

          <ul
            className={`overflow-hidden transition-all duration-300 ease-in-out md:block 
            ${openSection === "contact" ? "max-h-100" : "max-h-0 md:max-h-full"}`}
          >
            <li className="flex items-start gap-2 mb-2 text-xs sm:text-sm">
              <Phone className="w-4 h-4 text-amber-800" />
              <span className="text-amber-700">+91 96384 78118</span>
            </li>

            <li className="flex items-start gap-2 mb-2 text-xs sm:text-sm">
              <Mail className="w-4 h-4 text-amber-800" />
              <span className="text-amber-700">annapurnakhakhra@storeview.in</span>
            </li>

            <li className="flex items-start gap-2 text-xs sm:text-sm">
              <MapPin className="w-4 h-4 text-amber-800" />
              <span className="text-amber-700 leading-relaxed">
                412, New Escon Plaza,<br />
                Chhaprabhatha Road, Amroli,<br />
                Surat, Gujarat - 394107
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* FOOTER IMAGE */}
      <div className="w-full mt-6 sm:mt-10">
        <img src="/footers.png" alt="footer" className="w-full h-auto object-cover" />
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-amber-200 my-4 mx-4"></div>

      <div className="text-center text-amber-700 text-xs sm:text-sm pb-4 px-4">
        © {new Date().getFullYear()}
        <span className="font-medium text-amber-800"> Annapurna Khakhra By Storeview </span> — All Rights Reserved. |
        <a href="https://www.megascale.in/" target="_blank" className="text-amber-800"> Powered by Megascale</a>
      </div>
    </footer>
  );
}
