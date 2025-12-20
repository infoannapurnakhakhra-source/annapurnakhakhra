"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import DownloadBrochure from "./DownloadBrochure";
export default function Footer() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (name) => {
    setOpenSection(openSection === name ? null : name);
  };

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "AboutPage", path: "/about" },
    { name: "FAQ", path: "/faq" },
    { name: "ContactForm", path: "/contact" },
    { name: "BlogPage", path: "/blog" },
  ];

  const policiesLinks = [
    { name: "Terms & Conditions", path: "/terms&condition" },
    { name: "Shipping Policy", path: "/shipping-policy" },
    { name: "Return Policy", path: "/return-policy" },
    { name: "Privacy Policy", path: "/privacy-policy" },
  ];

  return (
    <footer className="bg-yellow-50 text-gray-800 border-t border-amber-200 w-full">
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
        </div>

        {/* QUICK LINKS */}
        <div className="md:text-left border-b border-amber-200 md:border-none pb-4 order-3 md:order-2">
          <button
            className="w-full flex justify-between items-center md:block text-left"
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
            ${openSection === "quick" ? "max-h-48" : "max-h-0 md:max-h-full"}`}
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
            <li><DownloadBrochure/></li>
          </ul>
        </div>

        {/* POLICIES */}
        <div className="md:text-left border-b border-amber-200 md:border-none pb-4 order-2 md:order-3">
          <button
            className="w-full flex justify-between items-center md:block text-left"
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
            ${openSection === "policies" ? "max-h-48" : "max-h-0 md:max-h-full"}`}
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
            className="w-full flex justify-between items-center md:block text-left"
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
            ${openSection === "contact" ? "max-h-48" : "max-h-0 md:max-h-full"}`}
          >
            <li className="flex items-start gap-2 mb-2 text-xs sm:text-sm">
              <Phone className="w-4 h-4 text-amber-800" />
              <span className="text-amber-700">+91-9313869017</span>
            </li>

            <li className="flex items-start gap-2 mb-2 text-xs sm:text-sm">
              <Mail className="w-4 h-4 text-amber-800" />
              <span className="text-amber-700">info.annapurnakhakhara@gmail.com</span>
            </li>

            <li className="flex items-start gap-2 text-xs sm:text-sm">
              <MapPin className="w-4 h-4 text-amber-800" />
              <span className="text-amber-700 leading-relaxed">
                411, New Escon Plaza,<br />
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
        <span className="font-medium text-amber-800"> Annapurna khakhra</span> — All Rights Reserved. |
        <a href="https://www.megascale.in/" target="_blank" className="text-amber-800"> Powered by Megascale</a>
      </div>
    </footer>
  );
}
