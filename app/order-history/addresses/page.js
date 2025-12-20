"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MyAddressesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); 

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    country: "India",
    province: "",
    zip: "",
    phone: "",
    isDefault: false,
  });

  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const customerId = localStorage.getItem("customerShopifyId");
      if (!customerId) {
        alert("Please login first!");
        window.location.href = "/auth/login";
        return;
      }

      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId }),
        });
        const data = await res.json();

        if (data.success) {
          setUser(data.customer);
        } else {
          alert("Session expired. Please login again.");
          localStorage.removeItem("customerShopifyId");
          window.location.href = "/auth/login";
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // You can add your save address API here later
    alert("Address saved successfully!");
    setShowForm(false); // Close form after save
    // Optionally refresh user data
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfbf7] flex items-center justify-center">
        <div className="text-3xl font-bold text-[#7d4b0e] animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fcfbf7] flex flex-col">

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold" style={{ color: "#7d4b0e" }}>
            My Account
          </h1>
          <p className="text-2xl text-gray-600 mt-4 font-medium">
            Your Addresses
          </p>
        </div>

        {/* Add New Address Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={() => setShowForm(!showForm)} // Toggle form
            className="px-10 py-4 bg-[#7d4b0e] text-white rounded-full font-semibold text-lg hover:bg-[#5a360a] transition shadow-lg flex items-center gap-2"
          >
            <Plus size={20} />
            ADD A NEW ADDRESS
          </button>
        </div>

        {/* Add Address Form - Appears below button */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-[#e8e3d9] p-10 md:p-12 mb-12 animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold" style={{ color: "#7d4b0e" }}>
                Add New Address
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-600 hover:text-[#7d4b0e]"
              >
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First & Last Name */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium mb-2" style={{ color: "#7d4b0e" }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#7d4b0e] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-2" style={{ color: "#7d4b0e" }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#7d4b0e] outline-none"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="block text-lg font-medium mb-2" style={{ color: "#7d4b0e" }}>
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#7d4b0e] outline-none"
                />
              </div>

              {/* Address 1 & 2 */}
              <div>
                <label className="block text-lg font-medium mb-2" style={{ color: "#7d4b0e" }}>
                  Address 1
                </label>
                <input
                  type="text"
                  name="address1"
                  value={formData.address1}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#7d4b0e] outline-none"
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-2" style={{ color: "#7d4b0e" }}>
                  Address 2
                </label>
                <input
                  type="text"
                  name="address2"
                  value={formData.address2}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#7d4b0e] outline-none"
                />
              </div>

              {/* City & Country */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium mb-2" style={{ color: "#7d4b0e" }}>
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#7d4b0e] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-2" style={{ color: "#7d4b0e" }}>
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#7d4b0e] outline-none"
                  >
                    <option value="India">India</option>
                  </select>
                </div>
              </div>

              {/* Province */}
              <div>
                <label className="block text-lg font-medium mb-2" style={{ color: "#7d4b0e" }}>
                  Province
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#7d4b0e] outline-none"
                >
                  <option value="">Select Province</option>
                  <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                  <option value="Gujarat">Gujarat</option>
                  {/* Add more as needed */}
                </select>
              </div>

              {/* Zip & Phone */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium mb-2" style={{ color: "#7d4b0e" }}>
                    Postal/Zip Code
                  </label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#7d4b0e] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium mb-2" style={{ color: "#7d4b0e" }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#7d4b0e] outline-none"
                  />
                </div>
              </div>

              {/* Set as Default */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#7d4b0e] rounded"
                />
                <label htmlFor="isDefault" className="text-lg font-medium cursor-pointer">
                  Set as default address
                </label>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 mt-10">
                <button
                  type="submit"
                  className="flex-1 bg-[#7d4b0e] text-white py-4 rounded-full font-semibold text-lg hover:bg-[#5a360a] transition shadow-lg"
                >
                  ADD ADDRESS
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-full font-semibold text-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        

        {/* Back Link */}
        <div className="text-center mt-12">
          <a
            href="/profile"
            className="inline-flex items-center gap-2 text-[#7d4b0e] hover:text-[#a0682a] font-medium text-lg transition"
          >
            <ArrowLeft size={20} />
                 Return To Account Details
          </a>
        </div>
      </main>

      {/* Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}