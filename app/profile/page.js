"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  Package,
  LogOut,
  Home,
  User,
  MapPin,
  ShoppingBag,
  Edit,
  X,
  Mail,
  Phone as PhoneIcon,
  Trash2,
  Plus,
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [newAddress, setNewAddress] = useState({
    address1: "",
    address2: "",
    city: "",
    province: "",
    zip: "",
    country: "India",
    phone: "",
    default: false,
  });

  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const customerId = localStorage.getItem("customerShopifyId");
      if (!customerId) {
        alert("Please login first!");
        router.push("/auth/login");
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

          setEditForm({
            firstName: data.customer.firstName || "",
            lastName: data.customer.lastName || "",
            email: data.customer.email || "",
            phone: data.customer.phone || "",
          });
        } else {
          alert("Failed to load profile. Please login again.");
          localStorage.removeItem("customerShopifyId");
          router.push("/auth/login");
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    alert("Logged out successfully!");
    localStorage.removeItem("customerShopifyId");
    localStorage.removeItem("cartId");
    router.push("/");
  };

  const openEditModal = () => setEditModalOpen(true);
  const openAddAddressModal = () => setAddModalOpen(true);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleAddressInputChange = (e, isNew = false) => {
    const { name, value } = e.target;
    if (isNew) {
      setNewAddress({ ...newAddress, [name]: value });
    } else {
      setEditingAddress({ ...editingAddress, [name]: value });
    }
  };

  const saveProfile = async () => {
    let phone = user.phone?.trim() || "";
    phone = phone.replace(/^\+?91/, "");

    if (!phone) {
      alert("Phone number not found. Please login again.");
      return;
    }

    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          email: editForm.email.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Profile updated successfully!");
        setEditModalOpen(false);
        refreshUser();
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (err) {
      alert("Error updating profile.");
    }
  };

  const refreshUser = async () => {
    const customerId = localStorage.getItem("customerShopifyId");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.customer);
        setEditForm({
          firstName: data.customer.firstName || "",
          lastName: data.customer.lastName || "",
          email: data.customer.email || "",
          phone: data.customer.phone || "",
        });
      }
    } catch (err) {
      console.error("Refresh failed", err);
    }
  };

  const openEditAddressModal = (addr) => {
    setEditingAddress({ ...addr, isDefault: addr.id === user.defaultAddress?.id });
    setEditModalOpen(true);
  };

  const saveEditedAddress = async () => {
    try {
      const res = await fetch("/api/address/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user.id,
          addressId: editingAddress.id,
          address: {
            ...editingAddress,
            default: editingAddress.isDefault || false,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        setEditModalOpen(false);
        setEditingAddress(null);
        alert("Address updated successfully!");
      } else {
        alert("Failed to update address");
      }
    } catch (err) {
      alert("Error updating address");
    }
  };

  const deleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch("/api/address/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: user.id, addressId }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        alert("Address deleted successfully!");
      }
    } catch (err) {
      alert("Error deleting address");
    }
  };

  const saveNewAddress = async () => {
    try {
      const res = await fetch("/api/address/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user.id,
          address: { ...newAddress, default: newAddress.default || false },
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        setAddModalOpen(false);
        setNewAddress({
          address1: "", address2: "", city: "", province: "", zip: "", country: "India", phone: "", default: false,
        });
        alert("New address added successfully!");
      } else {
        alert("Failed to add address");
      }
    } catch (err) {
      alert("Error adding address");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-2xl sm:text-3xl font-bold text-amber-700 animate-pulse">
          Loading your profile...
        </div>
      </div>
    );
  }

  if (!user) return null;

  const allAddresses = [
    ...(user.addresses || []),
    ...(user.defaultAddress && !user.addresses?.some(a => a.id === user.defaultAddress.id) ? [user.defaultAddress] : [])
  ].filter(Boolean);

  const validAddresses = allAddresses.filter(addr =>
    addr.address1?.trim() || addr.city?.trim() || addr.zip?.trim()
  );

  return (
    <>
      <div className="min-h-screen bg-amber-50">
        {/* Header Banner */}
        <header
          className="relative h-48 sm:h-64 md:h-80 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/b5.webp')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/20"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mt-2 sm:mt-3">
              Your Annapurna Khakhra Family
            </p>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
          {/* Profile Card */}
          <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12 mb-10 border border-amber-100">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-8 mb-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[#7d4b0e] to-[#a0682a] flex items-center justify-center text-white text-3xl sm:text-4xl md:text-5xl font-bold shadow-lg flex-shrink-0">
                  {user.firstName?.[0] || "U"}
                </div>
                <div className="text-center sm:text-left flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: "#7d4b0e" }}>
                      {user.firstName} {user.lastName}
                    </h2>
                    <button onClick={openEditModal} className="text-[#7d4b0e] hover:text-[#a0682a]">
                      <Edit className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                    </button>
                  </div>
                  <p className="text-base sm:text-lg md:text-xl text-amber-700 flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" /> {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-base sm:text-lg text-amber-700 flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5" /> {user.phone}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-medium sm:font-semibold text-base sm:text-lg hover:scale-105 transition"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>

            {/* Default Address Preview */}
            {user.defaultAddress && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 sm:p-8 border-l-4 border-[#7d4b0e] shadow-lg mt-8">
                <p className="font-bold text-lg sm:text-xl mb-3 flex items-center gap-3" style={{ color: "#7d4b0e" }}>
                  <MapPin className="w-6 h-6 sm:w-7 sm:h-7" /> Default Delivery Address
                </p>
                <p className="text-amber-800 text-sm sm:text-base leading-relaxed">
                  {user.defaultAddress.address1}
                  {user.defaultAddress.address2 && `, ${user.defaultAddress.address2}`}
                  <br />
                  {user.defaultAddress.city}, {user.defaultAddress.province} - {user.defaultAddress.zip}
                  <br />
                  {user.defaultAddress.country}
                </p>
              </div>
            )}
          </section>

          {/* Addresses Section */}
          <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12 border border-amber-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <MapPin className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: "#7d4b0e" }} />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: "#7d4b0e" }}>
                  My Addresses
                </h2>
              </div>
              {validAddresses.length < 10 && (
                <button
                  onClick={openAddAddressModal}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#7d4b0e] text-white px-5 py-3 rounded-xl font-medium hover:scale-105 transition text-sm sm:text-base"
                >
                  <Plus className="w-5 h-5" />
                  Add New
                </button>
              )}
            </div>

            {validAddresses.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-white rounded-2xl shadow-xl">
                <p className="text-xl sm:text-2xl text-amber-700 mb-6">No addresses saved yet.</p>
                <button
                  onClick={openAddAddressModal}
                  className="bg-[#7d4b0e] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:scale-105 transition text-base sm:text-lg"
                >
                  Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {validAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`rounded-2xl p-6 border-2 transition-all ${
                      addr.id === user.defaultAddress?.id
                        ? "border-[#7d4b0e] bg-amber-50 shadow-lg"
                        : "border-amber-200 bg-white hover:border-amber-400"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-lg sm:text-xl" style={{ color: "#7d4b0e" }}>
                        {addr.id === user.defaultAddress?.id ? "Default Address" : "Address"}
                      </h4>
                      <div className="flex gap-2 sm:gap-3">
                        <button onClick={() => openEditAddressModal(addr)} className="text-[#7d4b0e]">
                          <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => deleteAddress(addr.id)} className="text-red-600">
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-amber-800 text-sm sm:text-base leading-relaxed">
                      {addr.address1}
                      {addr.address2 && `, ${addr.address2}`}
                      <br />
                      {addr.city}, {addr.province} - {addr.zip}
                      <br />
                      {addr.country}
                      {addr.phone && <><br />Phone: {addr.phone}</>}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* CTA Buttons */}
          <div className="text-center space-y-6 py-8 sm:py-12">
            <a
              href="/"
              className="inline-flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-[#7d4b0e] to-[#a0682a] text-white px-8 sm:px-12 py-4 sm:py-6 rounded-2xl text-xl sm:text-2xl font-bold shadow-2xl hover:scale-105 transition"
            >
              <Home className="w-6 h-6 sm:w-8 sm:h-8" />
              Continue Shopping
            </a>

            <div className="mt-6">
              <button
                onClick={() => router.push("/order-history")}
                className="text-lg sm:text-xl text-[#7d4b0e] underline hover:text-[#a0682a] transition"
              >
                View Order History →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals - Responsive */}
      {/* Profile Edit Modal */}
      {editModalOpen && !editingAddress && !addModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#7d4b0e]">Edit Profile</h3>
              <button onClick={() => setEditModalOpen(false)}>
                <X className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="firstName" value={editForm.firstName} onChange={handleEditChange} placeholder="First Name" className="w-full p-3 sm:p-4 border border-amber-200 rounded-xl focus:border-[#7d4b0e] text-base sm:text-lg" />
                <input name="lastName" value={editForm.lastName} onChange={handleEditChange} placeholder="Last Name" className="w-full p-3 sm:p-4 border border-amber-200 rounded-xl focus:border-[#7d4b0e] text-base sm:text-lg" />
              </div>
              <input name="email" type="email" value={editForm.email} onChange={handleEditChange} placeholder="Email" className="w-full p-3 sm:p-4 border border-amber-200 rounded-xl focus:border-[#7d4b0e] text-base sm:text-lg" />
              <input name="phone" value={editForm.phone} readOnly className="w-full p-3 sm:p-4 border border-amber-200 rounded-xl bg-gray-100 text-base sm:text-lg" />
            </div>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={saveProfile} className="flex-1 bg-gradient-to-r from-[#7d4b0e] to-[#a0682a] text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg">
                Save Changes
              </button>
              <button onClick={() => setEditModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {editModalOpen && editingAddress && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#7d4b0e]">Edit Address</h3>
              <button onClick={() => { setEditModalOpen(false); setEditingAddress(null); }}>
                <X className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <input name="address1" value={editingAddress.address1 || ""} onChange={handleAddressInputChange} placeholder="Address Line 1" className="w-full p-3 sm:p-4 border border-amber-200 rounded-xl text-base" />
              <input name="address2" value={editingAddress.address2 || ""} onChange={handleAddressInputChange} placeholder="Address Line 2 (optional)" className="w-full p-3 sm:p-4 border border-amber-200 rounded-xl text-base" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="city" value={editingAddress.city || ""} onChange={handleAddressInputChange} placeholder="City" className="w-full p-3 sm:p-4 border border-amber-200 rounded-xl text-base" />
                <input name="province" value={editingAddress.province || ""} onChange={handleAddressInputChange} placeholder="State" className="w-full p-3 sm:p-4 border border-amber-200 rounded-xl text-base" />
              </div>
              <input name="zip" value={editingAddress.zip || ""} onChange={handleAddressInputChange} placeholder="PIN Code" className="w-full p-3 sm:p-4 border border-amber-200 rounded-xl text-base" />
              <input name="phone" value={editingAddress.phone || ""} onChange={handleAddressInputChange} placeholder="Phone" className="w-full p-3 sm:p-4 border border-amber-200 rounded-xl text-base" />
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editingAddress.isDefault || false}
                  onChange={(e) => setEditingAddress({ ...editingAddress, isDefault: e.target.checked })}
                  className="w-5 h-5"
                />
                <label className="font-medium text-base">Set as default address</label>
              </div>
            </div>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={saveEditedAddress} className="flex-1 bg-gradient-to-r from-[#7d4b0e] to-[#a0682a] text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg">
                Save Address
              </button>
              <button onClick={() => { setEditModalOpen(false); setEditingAddress(null); }} className="flex-1 bg-gray-200 text-gray-800 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Address Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#7d4b0e]">Add New Address</h3>
              <button onClick={() => setAddModalOpen(false)}>
                <X className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <input name="address1" value={newAddress.address1} onChange={(e) => handleAddressInputChange(e, true)} placeholder="Address Line 1" className="w-full p-3 sm:p-4 border border-amber-200 rounded-xl text-base" />
              <input name="address2" value={newAddress.address2} onChange={(e) => handleAddressInputChange(e, true)} placeholder="Address Line 2 (optional)" className="w-full p-3 sm:p-4 border border-amber-200 rounded-xl text-base" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="city" value={newAddress.city} onChange={(e) => handleAddressInputChange(e, true)} placeholder="City" className="w-full p-3 sm:p-4 border border-amber-200 rounded-xl text-base" />
                <input name="province" value={newAddress.province} onChange={(e) => handleAddressInputChange(e, true)} placeholder="State" className="w-full p-3 sm:p-4 border border-amber-200 rounded-xl text-base" />
              </div>
              <input name="zip" value={newAddress.zip} onChange={(e) => handleAddressInputChange(e, true)} placeholder="PIN Code" className="w-full p-3 sm:p-4 border border-amber-200 rounded-xl text-base" />
              <input name="phone" value={newAddress.phone} onChange={(e) => handleAddressInputChange(e, true)} placeholder="Phone" className="w-full p-3 sm:p-4 border border-amber-200 rounded-xl text-base" />
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={newAddress.default}
                  onChange={(e) => setNewAddress({ ...newAddress, default: e.target.checked })}
                  className="w-5 h-5"
                />
                <label className="font-medium text-base">Set as default address</label>
              </div>
            </div>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={saveNewAddress} className="flex-1 bg-gradient-to-r from-[#7d4b0e] to-[#a0682a] text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg">
                Save Address
              </button>
              <button onClick={() => setAddModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}