"use client";

import { useEffect, useState } from "react";

export default function ClientSafetyWrapper({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 🔒 GLOBAL SAFETY FOR FB IN-APP BROWSER
    try {
      localStorage.setItem("__test", "1");
      localStorage.removeItem("__test");
    } catch {
      window.localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
      };
    }

    try {
      sessionStorage.setItem("__test", "1");
      sessionStorage.removeItem("__test");
    } catch {
      window.sessionStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
      };
    }
  }, []);

  // 🚫 Prevent hydration crash
  if (!mounted) return null;

  return children;
}
