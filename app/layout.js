// app/layout.js — FINAL: NO CART LOGIC AT ALL (Super clean)

import "./globals.css";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/Footer";
import ClientLayout from "@/components/ClientLayout";



export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {/* Header — No cart count, no () call */}
        {/* <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
          <Header/>
        </header> */}
        <ClientLayout>{children}</ClientLayout>

        {/* Footer */}
        <Footer/>
      </body>
    </html>
  );
}