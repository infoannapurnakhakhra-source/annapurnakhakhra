"use client";

import { useState } from "react";
import { Download } from "lucide-react";
export default function DownloadBrochure() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      company: window.location.hostname, // ✅ optional metadata
    };

    try {
      // 1️⃣ Save data first
      const res = await fetch("/api/brochure-download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.message || "API failed");
      }

      // 2️⃣ Trigger file download AFTER successful save
      const link = document.createElement("a");
      link.href = "/_Khakhra Catalog.pdf"; // file must exist in /public
      link.download = "/_Khakhra Catalog.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 3️⃣ Close modal
      setOpen(false);
    } catch (err) {
      console.error("❌ Brochure submit error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-amber-700 hover:text-amber-900 "
      >
        Download Brochure
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-xl"
            >
              ✕
            </button>

            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 text-[#7d4b0e]">
              <Download />
              <span>Download Brochure</span>
            </h2>


            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                placeholder="Full Name"
                required
                className="w-full border p-3 rounded"
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="w-full border p-3 rounded"
              />
              <input
                name="phone"
                placeholder="Phone Number"
                required
                className="w-full border p-3 rounded"
              />

              <button
                disabled={loading}
                className="w-full bg-[#7d4b0e] text-white py-3 rounded disabled:opacity-60"
              >
                {loading ? "Downloading..." : "Download"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
