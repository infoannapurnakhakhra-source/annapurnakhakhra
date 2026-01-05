import { useState } from "react";
import { MailQuestionMark } from "lucide-react";

export default function AskExpert() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const STORE_NAME = "hit-megascale.myshopify.com";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    store: STORE_NAME, // ✅ hidden field
  });

  // Validation functions
  const validateName = (name) => {
    if (!name || !name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return "Name should only contain letters";
    return "";
  };

  const validateEmail = (email) => {
    if (!email || !email.trim()) return "Email is required";
    
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address";
    }
    
    if (email.includes("..")) return "Email cannot contain consecutive dots";
    if (email.startsWith(".") || email.endsWith(".")) return "Email cannot start or end with a dot";
    
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone || !phone.trim()) return "Phone number is required";
    
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    
    if (!/^\d{10}$/.test(cleanPhone)) {
      return "Please enter a valid 10-digit phone number";
    }
    
    return "";
  };

  const validateMessage = (message) => {
    if (!message || !message.trim()) return "Message is required";
    if (message.trim().length < 10) return "Message must be at least 10 characters";
    return "";
  };

  // Handle field blur
  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    
    let error = "";
    const value = form[fieldName];
    
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
      case "message":
        error = validateMessage(value);
        break;
      default:
        break;
    }
    
    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Only validate if field has been touched
    if (touched[name]) {
      let error = "";
      
      switch (name) {
        case "name":
          error = validateName(value);
          break;
        case "email":
          error = validateEmail(value);
          break;
        case "phone":
          error = validatePhone(value);
          break;
        case "message":
          error = validateMessage(value);
          break;
        default:
          break;
      }
      
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ name: true, email: true, phone: true, message: true });

    // Validate all fields
    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);
    const phoneError = validatePhone(form.phone);
    const messageError = validateMessage(form.message);

    const newErrors = {};
    if (nameError) newErrors.name = nameError;
    if (emailError) newErrors.email = emailError;
    if (phoneError) newErrors.phone = phoneError;
    if (messageError) newErrors.message = messageError;

    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://adminrocket.megascale.co.in/api/ask-expert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form), // ✅ store included
      });

      const data = await res.json();

      if (data.success) {
        alert("Your message has been sent!");
        setIsOpen(false);

        // ✅ reset but keep hidden field
        setForm({
          name: "",
          email: "",
          phone: "",
          message: "",
          store: STORE_NAME,
        });
        setErrors({});
        setTouched({});
      } else {
        alert("Failed to send message.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setErrors({});
    setTouched({});
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-black hover:underline ml-2 flex items-center gap-2 cursor-pointer"
      >
        <MailQuestionMark className="w-5 h-5" />
        <span>Ask an Expert</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-[#000000b0] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">Ask an Expert</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ✅ Hidden field */}
              <input type="hidden" name="store" value={form.store} />

              {/* Name Field */}
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur("name")}
                  className={`w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-amber-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <input
                  type="text"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  className={`w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-amber-300"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur("phone")}
                  className={`w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-amber-300"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <textarea
                  name="message"
                  placeholder="Message"
                  value={form.message}
                  onChange={handleChange}
                  onBlur={() => handleBlur("message")}
                  className={`w-full border rounded px-4 py-2 h-24 focus:outline-none focus:ring-2 ${
                    errors.message
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-amber-300"
                  }`}
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7C4A0E] text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}