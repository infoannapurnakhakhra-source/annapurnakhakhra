"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import CartDrawer from "@/components/CartDrawer";

export default function ClientLayout({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState(null);

  /* ---------------- Load Cart Initially ---------------- */
  useEffect(() => {
    refreshCart();
  }, []);

  /* ---------------- Refresh Cart Helper ---------------- */
  const refreshCart = async () => {
    try {
      const customerShopifyId =
        typeof window !== "undefined"
          ? localStorage.getItem("customerShopifyId")
          : null;

      const res = await fetch("/api/cart/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerShopifyId }),
      });

      const data = await res.json();
      setCart(data.cart || null);
    } catch (err) {
      console.error("Failed to refresh cart:", err);
      setCart(null);
    }
  };

  /* ---------------- Listen for Cart Updates ---------------- */
  useEffect(() => {
    const handleCartUpdate = () => {
      refreshCart();
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    return () =>
      window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  /* ---------------- Quantity / Remove Hooks ---------------- */
  const onUpdateQuantity = () => {
    refreshCart();
  };

  const onRemoveItem = () => {
    refreshCart();
  };

  const onCheckout = () => {
    window.location.href = "/cart";
  };

  /* ---------------- Global OPEN Cart Drawer ---------------- */
  useEffect(() => {
    const openCart = () => setIsCartOpen(true);

    window.addEventListener("open-cart-drawer", openCart);
    return () =>
      window.removeEventListener("open-cart-drawer", openCart);
  }, []);

  /* ---------------- Global CLOSE Cart Drawer ---------------- */
  useEffect(() => {
    const closeCart = () => setIsCartOpen(false);

    window.addEventListener("close-cart-drawer", closeCart);
    return () => 
      window.removeEventListener("close-cart-drawer", closeCart);
  }, []);

  return (
    <>
      <Header openCart={() => setIsCartOpen(true)} cart={cart} />

      <CartDrawer
        cart={cart}
        isOpen={isCartOpen}
        setIsOpen={setIsCartOpen}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        onCheckout={onCheckout}
      />

      {children}
    </>
  );
}
