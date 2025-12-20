"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = {
      firstName: formData.get("firstName").trim(),
      lastName: formData.get("lastName").trim(),
      email: formData.get("email").trim(),
      password: formData.get("password"),
      phone: formData.get("phone").trim(),
      address: {
        address1: formData.get("address1").trim(),
        address2: formData.get("address2")?.trim() || null,
        city: formData.get("city").trim(),
        province: formData.get("province").trim(),
        zip: formData.get("zip").trim(),
        country: formData.get("country")?.trim() || "India",
      },
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        alert(result.message || "Registration successful!");
        router.push("/auth/login");
      } else {
        alert(result.error || "Registration failed");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcfbf7] to-[#f5f0e8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7d4b0e] to-[#a0682a] py-12 px-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Create Your Account
          </h1>
          <p className="text-white/90 mt-3 text-lg">
            Join us and start shopping today!
          </p>
        </div>

        {/* Form */}
        <div className="p-10 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                required
                className="w-full px-5 py-4 border border-[#e8e3d9] rounded-xl text-lg focus:border-[#7d4b0e] focus:ring-2 focus:ring-[#7d4b0e]/20 focus:outline-none transition-all"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                required
                className="w-full px-5 py-4 border border-[#e8e3d9] rounded-xl text-lg focus:border-[#7d4b0e] focus:ring-2 focus:ring-[#7d4b0e]/20 focus:outline-none transition-all"
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              className="w-full px-5 py-4 border border-[#e8e3d9] rounded-xl text-lg focus:border-[#7d4b0e] focus:ring-2 focus:ring-[#7d4b0e]/20 focus:outline-none transition-all"
            />

            <input
              type="password"
              name="password"
              placeholder="Password (minimum 6 characters)"
              required
              minLength={6}
              className="w-full px-5 py-4 border border-[#e8e3d9] rounded-xl text-lg focus:border-[#7d4b0e] focus:ring-2 focus:ring-[#7d4b0e]/20 focus:outline-none transition-all"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              required
              className="w-full px-5 py-4 border border-[#e8e3d9] rounded-xl text-lg focus:border-[#7d4b0e] focus:ring-2 focus:ring-[#7d4b0e]/20 focus:outline-none transition-all"
            />

            {/* Address Section */}
            <div className="space-y-6 pt-6 border-t border-[#e8e3d9]">
              <h3 className="text-2xl font-semibold text-[#7d4b0e]">
                Delivery Address
              </h3>

              <input
                type="text"
                name="address1"
                placeholder="Address Line 1"
                required
                className="w-full px-5 py-4 border border-[#e8e3d9] rounded-xl text-lg focus:border-[#7d4b0e] focus:ring-2 focus:ring-[#7d4b0e]/20 focus:outline-none transition-all"
              />
              <input
                type="text"
                name="address2"
                placeholder="Address Line 2 (optional)"
                className="w-full px-5 py-4 border border-[#e8e3d9] rounded-xl text-lg focus:border-[#7d4b0e] focus:ring-2 focus:ring-[#7d4b0e]/20 focus:outline-none transition-all"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  required
                  className="w-full px-5 py-4 border border-[#e8e3d9] rounded-xl text-lg focus:border-[#7d4b0e] focus:ring-2 focus:ring-[#7d4b0e]/20 focus:outline-none transition-all"
                />
                <input
                  type="text"
                  name="province"
                  placeholder="State / Province"
                  required
                  className="w-full px-5 py-4 border border-[#e8e3d9] rounded-xl text-lg focus:border-[#7d4b0e] focus:ring-2 focus:ring-[#7d4b0e]/20 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="zip"
                  placeholder="ZIP / Postal Code"
                  required
                  className="w-full px-5 py-4 border border-[#e8e3d9] rounded-xl text-lg focus:border-[#7d4b0e] focus:ring-2 focus:ring-[#7d4b0e]/20 focus:outline-none transition-all"
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value="India"
                  readOnly
                  className="w-full px-5 py-4 border border-[#e8e3d9] rounded-xl text-lg bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7d4b0e] hover:bg-[#5a360a] text-white font-bold text-xl py-5 rounded-xl transition disabled:opacity-70 mt-8 shadow-lg"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-8 text-gray-600">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-[#7d4b0e] font-bold hover:underline"
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}