"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export default function DownloadBrochure() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ✅ Shopify store (hidden field value)
  const STORE_NAME = "hit-megascale.myshopify.com";

  // Validation functions
  const validateName = (name) => {
    if (!name || !name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return "Name should only contain letters";
    return "";
  };

  const validateEmail = (email) => {
    if (!email || !email.trim()) return "Email is required";
    
    // More comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address";
    }
    
    // Additional checks
    if (email.includes("..")) return "Email cannot contain consecutive dots";
    if (email.startsWith(".") || email.endsWith(".")) return "Email cannot start or end with a dot";
    
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone || !phone.trim()) return "Phone number is required";
    
    // Remove spaces and special characters for validation
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    
    if (!/^\d{10}$/.test(cleanPhone)) {
      return "Please enter a valid 10-digit phone number";
    }
    
    return "";
  };

  // Handle field blur (when user leaves the field)
  const handleBlur = (fieldName, value) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    
    let error = "";
    switch (fieldName) {
      case "name":
        error = validateName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "phone":
        error = validatePhone(value);
        break;
      default:
        break;
    }
    
    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  // Handle field change
  const handleChange = (fieldName, value) => {
    // Only validate if the field has been touched
    if (touched[fieldName]) {
      let error = "";
      switch (fieldName) {
        case "name":
          error = validateName(value);
          break;
        case "email":
          error = validateEmail(value);
          break;
        case "phone":
          error = validatePhone(value);
          break;
        default:
          break;
      }
      
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const name = form.get("name");
    const email = form.get("email");
    const phone = form.get("phone");

    // Mark all fields as touched on submit
    setTouched({ name: true, email: true, phone: true });

    // Validate all fields
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);

    const newErrors = {};
    if (nameError) newErrors.name = nameError;
    if (emailError) newErrors.email = emailError;
    if (phoneError) newErrors.phone = phoneError;

    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      store: STORE_NAME,
    };

    try {
      const res = await fetch("https://adminrocket.megascale.co.in/api/brochure-download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Request failed");
      }

      // ✅ Trigger brochure download
      const link = document.createElement("a");
      link.href = "/_Khakhra Catalog.pdf";
      link.download = "_Khakhra Catalog.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Reset form and close modal
      e.target.reset();
      setOpen(false);
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error("❌ Brochure submit error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setErrors({});
    setTouched({});
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-amber-700 hover:text-amber-900 cursor-pointer transition-colors cursor-pointer"
      >
        Download Brochure
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 text-2xl cursor-pointer text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>

            <h2 className="flex items-center gap-2 text-xl font-semibold mb-6 text-[#7d4b0e]">
              <Download />
              <span>Download Brochure</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ✅ Hidden store field */}
              <input type="hidden" name="store" value={STORE_NAME} />

              {/* Name Field */}
              <div>
                <input
                  name="name"
                  placeholder="Full Name"
                  className={`w-full border p-3 rounded focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-amber-300"
                  }`}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={(e) => handleBlur("name", e.target.value)}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <input
                  name="email"
                  type="text"
                  placeholder="Email"
                  className={`w-full border p-3 rounded focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-amber-300"
                  }`}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={(e) => handleBlur("email", e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone Number (10 digits)"
                  className={`w-full border p-3 rounded focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-amber-300"
                  }`}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  onBlur={(e) => handleBlur("phone", e.target.value)}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7d4b0e] text-white py-3 rounded disabled:opacity-60 cursor-pointer hover:bg-[#6a3f0c] transition-colors font-medium cursor-pointer"
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