"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ContactPage() {
  const STORE_NAME = "hit-megascale.myshopify.com";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    store: STORE_NAME,
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(""); // sending | success | error
  const [errorMsg, setErrorMsg] = useState("");

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // clear error while typing
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setStatus("sending");
    setErrorMsg("");

    const API_URL = "https://adminrocket.megascale.co.in/api/contact";

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          store: STORE_NAME,
        });
        setErrors({});
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Failed to send message");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }

    setTimeout(() => setStatus(""), 4000);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6">Send us a message</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="store" value={formData.store} />

          {/* Name */}
          <div>
            <label className="block mb-1">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block mb-1">Subject</label>
            <input
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg ${
                errors.subject ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.subject && (
              <p className="text-sm text-red-600 mt-1">{errors.subject}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block mb-1">Message</label>
            <textarea
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg resize-none ${
                errors.message ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.message && (
              <p className="text-sm text-red-600 mt-1">{errors.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full bg-[#7d4b0e] text-white py-3 rounded-lg flex justify-center gap-2"
          >
            {status === "sending" ? "Sending..." : <><Send /> Send Message</>}
          </button>

          {status === "success" && (
            <div className="text-green-700 text-center">
              Message sent successfully!
            </div>
          )}

          {status === "error" && (
            <div className="text-red-700 text-center">{errorMsg}</div>
          )}
        </form>
      </div>
    </div>
  );
}
