"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  ShoppingCart,
  LogOut,
  Package,
  UserCircle,
  Menu,
  X,
} from "lucide-react";

export default function Header({ cart, openCart }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerInitial, setCustomerInitial] = useState("?");
  const [customerName, setCustomerName] = useState("");

  const itemCount = cart?.lines?.edges?.reduce((s, { node }) => s + node.quantity, 0) || 0;

  const headerRef = useRef(null);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/collection", label: "Collection" },
    { href: "/gallery", label: "Gallery" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  const leftNavLinks = navLinks.slice(0, 3);
  const rightNavLinks = navLinks.slice(3);

  useEffect(() => {
    const current = navLinks.find((link) => link.href === pathname);
    if (current) setActiveLink(current.label);
  }, [pathname]);

  // Customer data load (unchanged - perfect)
  useEffect(() => {
    const loadCustomerData = async () => {
      if (typeof window === "undefined") return;

      const customerId = localStorage.getItem("customerShopifyId");

      if (!customerId) {
        setIsLoggedIn(false);
        setCustomerInitial("?");
        setCustomerName("");
        return;
      }

      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId }),
        });

        const data = await res.json();

        if (data.success && data.customer) {
          const customer = data.customer;

          setIsLoggedIn(true);

          const fullName = `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
          setCustomerName(fullName || "User");

          if (customer.email && customer.email.trim()) {
            setCustomerInitial(customer.email.trim().charAt(0).toUpperCase());
          } else if (customer.firstName && customer.firstName.trim()) {
            setCustomerInitial(customer.firstName.trim().charAt(0).toUpperCase());
          } else {
            setCustomerInitial("U");
          }
        } else {
          localStorage.removeItem("customerShopifyId");
          setIsLoggedIn(false);
          setCustomerInitial("?");
          setCustomerName("");
        }
      } catch (err) {
        console.error("Header: Failed to fetch customer data", err);
        setIsLoggedIn(true);
        setCustomerInitial("U");
        setCustomerName("User");
      }
    };

    loadCustomerData();

    const handleUpdate = () => loadCustomerData();
    window.addEventListener("customer-updated", handleUpdate);
    window.addEventListener("customer-logout", handleUpdate);

    return () => {
      window.removeEventListener("customer-updated", handleUpdate);
      window.removeEventListener("customer-logout", handleUpdate);
    };
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const toggleUserMenu = () => setIsUserMenuOpen((prev) => !prev);

  const handleNavClick = useCallback((label, href) => {
    setActiveLink(label);
    router.push(href);
    setIsMobileMenuOpen(false);
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("customerShopifyId");
      localStorage.removeItem("customerEmail");
      localStorage.removeItem("customerFirstName");
      localStorage.removeItem("cartId");
      localStorage.removeItem("guestCartId");
    }
    setIsLoggedIn(false);
    setCustomerInitial("?");
    setCustomerName("");
    window.dispatchEvent(new Event("customer-logout"));
    router.push("/");
    setIsUserMenuOpen(false);
  };

  useEffect(() => {
    const handleOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <>
      <div className="w-full bg-gradient-to-b from-gray-50 to-transparent sticky top-0 z-50">
        <div className="py-3 sm:py-4">
          <header ref={headerRef} className="max-w-[1400px] mx-auto px-4 relative">
            {/* Main Rounded Navbar */}
            <div className="relative bg-amber-50/90 backdrop-blur-md rounded-full shadow-xl border border-amber-200">

              {/* LARGE DESKTOP (lg+) - Original Overlapping Layout */}
              <div className="hidden lg:block">
                <div className="px-8 py-5">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
                    <nav className="flex justify-start items-center space-x-2">
                      {leftNavLinks.map((link) => (
                        <button
                          key={link.label}
                          onClick={() => handleNavClick(link.label, link.href)}
                          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${activeLink === link.label
                            ? "bg-white text-[#7d4b0e] shadow-md"
                            : "text-gray-700 hover:text-[#7d4b0e] hover:bg-white/50"
                            }`}
                        >
                          {link.label}
                        </button>
                      ))}
                    </nav>

                    <div className="w-40"></div>

                    <div className="flex justify-end items-center space-x-2">
                      {rightNavLinks.map((link) => (
                        <button
                          key={link.label}
                          onClick={() => handleNavClick(link.label, link.href)}
                          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${activeLink === link.label
                            ? "bg-white text-[#7d4b0e] shadow-md"
                            : "text-gray-700 hover:text-[#7d4b0e] hover:bg-white/50"
                            }`}
                        >
                          {link.label}
                        </button>
                      ))}

                      <button
                        onClick={openCart}
                        className="relative p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                      >
                        <ShoppingCart size={22} className="text-[#7d4b0e]" />
                        {itemCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                            {itemCount > 99 ? "99+" : itemCount}
                          </span>
                        )}
                      </button>

                      {isLoggedIn ? (
                        <div className="relative">
                          <button
                            onClick={toggleUserMenu}
                            className="w-12 h-12 bg-gradient-to-br from-[#7d4b0e] to-[#a0682a] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                          >
                            {customerInitial}
                          </button>
                          {isUserMenuOpen && (
                            <div className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-2xl border border-amber-100 z-50">
                              <div className="p-4 border-b border-amber-100">
                                <p className="text-sm text-gray-600">Welcome back!</p>
                                <p className="font-bold text-[#7d4b0e] text-lg truncate">
                                  {customerName || customerInitial}
                                </p>
                              </div>
                              <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-amber-50 transition">
                                <UserCircle size={20} className="text-[#7d4b0e]" />
                                <span className="font-medium">My Profile</span>
                              </Link>
                              <Link href="/order-history" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-amber-50 transition">
                                <Package size={20} className="text-[#7d4b0e]" />
                                <span className="font-medium">Order History</span>
                              </Link>
                              <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-4 w-full text-left text-red-600 hover:bg-red-50 transition border-t border-amber-100">
                                <LogOut size={20} />
                                <span className="font-medium">Logout</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link href="/auth/login" className="px-6 py-3 bg-[#7d4b0e] text-white rounded-full font-semibold hover:bg-[#6b400c] shadow-lg transition">
                          Login
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Overlapping Logo - Only on Large Screens */}
                <Link
                  href="/"
                  onClick={() => handleNavClick("Home", "/")}
                  className="absolute left-1/2 transform -translate-x-1/2 bottom-0 translate-y-1/2 z-50 hover:scale-105 transition"
                >
                  <img
                    src="/Megascale Logo.png"
                    alt="Megascale Logo"
                    className="h-20 md:h-24 lg:h-28 xl:h-32 w-auto object-contain drop-shadow-2xl"
                  />
                </Link>
              </div>

            
              {/* TABLET & MOBILE (below lg) - Compact Layout */}
              <div className="lg:hidden">
                <div className="relative flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4">
                  {/* LEFT: Menu Button */}
                  <button
                    onClick={toggleMobileMenu}
                    aria-label="Toggle Menu"
                    className="p-2 sm:p-2.5 rounded-full hover:bg-white/60 transition"
                  >
                    {isMobileMenuOpen ? (
                      <X size={26} className="text-[#7d4b0e]" />
                    ) : (
                      <Menu size={26} className="text-[#7d4b0e]" />
                    )}
                  </button>

                  {/* CENTER: LOGO */}
                  <Link
                    href="/"
                    className="absolute left-1/2 -translate-x-1/2 flex items-center"
                  >
                    <img
                      src="/Megascale Logo.png"
                      alt="Megascale Logo"
                      className="h-9 xs:h-10 sm:h-12 md:h-14 w-auto object-contain drop-shadow-md"
                    />
                  </Link>

                  {/* RIGHT: Cart + User */}
                  <div className="relative flex items-center gap-2 sm:gap-3">
                    {/* Cart */}
                    <button
                      onClick={openCart}
                      aria-label="Open Cart"
                      className="relative p-2 sm:p-2.5 bg-white rounded-full shadow-md hover:shadow-lg transition"
                    >
                      <ShoppingCart size={20} className="text-[#7d4b0e]" />
                      {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
                          {itemCount > 99 ? "99+" : itemCount}
                        </span>
                      )}
                    </button>

                    {/* User / Login */}
                    {isLoggedIn ? (
                      <div className="relative">
                        <button
                          onClick={toggleUserMenu}
                          aria-label="User Menu"
                          className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-[#7d4b0e] to-[#a0682a] text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition"
                        >
                          {customerInitial}
                        </button>
                      </div>
                    ) : (
                      <Link
                        href="/auth/login"
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#7d4b0e] text-white rounded-full text-xs sm:text-sm font-medium whitespace-nowrap"
                      >
                        Login
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>


            {isLoggedIn && isUserMenuOpen && (
            <div className="lg:hidden fixed top-20 right-4  w-72  sm:w-172 max-w-sm bg-white rounded-2xl shadow-2xl border border-amber-100 z-[9999]">
    
                <div className="p-4 border-b border-amber-100">
                  <p className="text-sm text-gray-600">Welcome back!</p>
                  <p className="font-bold text-[#7d4b0e] text-lg truncate">
                    {customerName || customerInitial}
                  </p>
                </div>
                <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-amber-50 transition">
                  <UserCircle size={20} className="text-[#7d4b0e]" />
                  <span className="font-medium">My Profile</span>
                </Link>
                <Link href="/order-history" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-amber-50 transition">
                  <Package size={20} className="text-[#7d4b0e]" />
                  <span className="font-medium">Order History</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-4 w-full text-left text-red-600 hover:bg-red-50 transition border-t border-amber-100">
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <div className="lg:hidden mt-4 bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden">
                <nav className="py-3">
                  {navLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => handleNavClick(link.label, link.href)}
                      className={`block w-full text-left px-8 py-4 text-base font-medium transition-all ${activeLink === link.label
                        ? "bg-[#7d4b0e] text-white"
                        : "text-gray-700 hover:bg-amber-50"
                        }`}
                    >
                      {link.label}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </header>
        </div>
      </div>
    </>
  );
}
