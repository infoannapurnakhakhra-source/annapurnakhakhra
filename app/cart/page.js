"use client";
import { useEffect, useState } from "react";
import { X, MapPin, CreditCard, Truck, Wallet, CheckCircle, Mail, ShieldCheck, Loader2, RefreshCw, Plus, Minus, Trash2, Calculator, ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressFetched, setAddressFetched] = useState(false);

  // Checkout States
  const [checkoutStep, setCheckoutStep] = useState(0); // 0 = cart view, 1 = email, 2 = otp, 3 = checkout
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Shipping & Tax calculation states
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationData, setCalculationData] = useState(null);
  const [calculationError, setCalculationError] = useState(null);

  const [address, setAddress] = useState({
    address1: "",
    city: "",
    province: "",
    provinceCode: "",
    country: "India",
    zip: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const customerShopifyId =
    typeof window !== "undefined"
      ? localStorage.getItem("customerShopifyId")
      : null;

  // Default empty address
  const defaultAddress = {
    address1: "",
    city: "",
    province: "",
    provinceCode: "",
    country: "India",
    zip: "",
    firstName: "",
    lastName: "",
    phone: "",
  };

  // Function to populate address from user data
  const populateAddressFromUser = (userData) => {
    if (!userData) {
      console.log("❌ No user data provided to populateAddressFromUser");
      return;
    }

    console.log("=".repeat(50));
    console.log("🔍 CART PAGE - STARTING ADDRESS POPULATION");
    console.log("=".repeat(50));
    console.log("Full user data object:", JSON.stringify(userData, null, 2));

    let addresses = [];

    if (userData.addresses?.edges) {
      addresses = userData.addresses.edges;
      console.log("✅ Found addresses in userData.addresses.edges");
    } else if (userData.addresses?.nodes) {
      addresses = userData.addresses.nodes.map(node => ({ node }));
      console.log("✅ Found addresses in userData.addresses.nodes");
    } else if (Array.isArray(userData.addresses)) {
      addresses = userData.addresses.map(addr => ({ node: addr }));
      console.log("✅ Found addresses as direct array");
    } else if (userData.defaultAddress) {
      addresses = [{ node: userData.defaultAddress }];
      console.log("✅ Found single defaultAddress");
    }

    console.log("📍 Total addresses found:", addresses.length);

    if (addresses.length === 0) {
      console.log("⚠️ NO ADDRESSES FOUND - User may not have saved any addresses");
      return;
    }

    let selectedAddr = null;

    selectedAddr = addresses.find(edge => {
      const node = edge.node || edge;
      return node?.defaultAddress === true;
    });
    if (selectedAddr) {
      selectedAddr = selectedAddr.node || selectedAddr;
      console.log("✅ Strategy 1 Success: Found via defaultAddress flag");
    }

    if (!selectedAddr) {
      selectedAddr = addresses.find(edge => {
        const node = edge.node || edge;
        return node?.isDefault === true;
      });
      if (selectedAddr) {
        selectedAddr = selectedAddr.node || selectedAddr;
        console.log("✅ Strategy 2 Success: Found via isDefault flag");
      }
    }

    if (!selectedAddr) {
      selectedAddr = addresses.find(edge => {
        const node = edge.node || edge;
        return node?.default === true;
      });
      if (selectedAddr) {
        selectedAddr = selectedAddr.node || selectedAddr;
        console.log("✅ Strategy 3 Success: Found via default property");
      }
    }

    if (!selectedAddr) {
      selectedAddr = addresses[0]?.node || addresses[0];
      console.log("✅ Strategy 4: Using first address as fallback");
    }

    if (!selectedAddr) {
      console.log("❌ CRITICAL: No valid address found after all strategies");
      return;
    }

    console.log("📋 Selected address object:", JSON.stringify(selectedAddr, null, 2));

    const newAddress = {
      firstName: selectedAddr.firstName || selectedAddr.firstname || selectedAddr.first_name || "",
      lastName: selectedAddr.lastName || selectedAddr.lastname || selectedAddr.last_name || "",
      address1: selectedAddr.address1 || selectedAddr.address || selectedAddr.street || "",
      city: selectedAddr.city || "",
      province: selectedAddr.province || selectedAddr.provinceCode || selectedAddr.state || selectedAddr.stateCode || "",
      provinceCode: selectedAddr.provinceCode || selectedAddr.province || selectedAddr.stateCode || "",
      country: selectedAddr.country || selectedAddr.countryCode || selectedAddr.countryCodeV2 || "India",
      zip: selectedAddr.zip || selectedAddr.zipCode || selectedAddr.postalCode || selectedAddr.postal_code || "",
      phone: selectedAddr.phone || selectedAddr.phoneNumber || selectedAddr.phone_number || "",
    };

    console.log("🎯 Created new address object:", JSON.stringify(newAddress, null, 2));

    setAddress(newAddress);
    setAddressFetched(true);

    console.log("✅ ADDRESS POPULATION COMPLETE");
    console.log("=".repeat(50));
  };

  // Fetch user profile and default address
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!customerShopifyId) {
        console.log("❌ No customerShopifyId in localStorage");
        setIsLoggedIn(false);
        return;
      }

      console.log("🚀 CART PAGE - Fetching profile for customerShopifyId:", customerShopifyId);
      setAddressLoading(true);

      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId: customerShopifyId }),
        });

        const data = await res.json();

        console.log("=".repeat(50));
        console.log("📦 CART PAGE - PROFILE API RESPONSE:");
        console.log("=".repeat(50));
        console.log(JSON.stringify(data, null, 2));
        console.log("=".repeat(50));

        if (data.success && data.customer) {
          console.log("✅ Profile API call successful");
          setUser(data.customer);
          setIsLoggedIn(true);
          setEmail(data.customer.email || "");
          populateAddressFromUser(data.customer);
        } else {
          console.log("❌ Profile API call failed or no customer data");
          console.log("Response:", data);
        }
      } catch (err) {
        console.error("❌ Network error fetching profile:", err);
      } finally {
        setAddressLoading(false);
      }
    };

    fetchUserProfile();
  }, [customerShopifyId]);

  // Re-populate when checkout step reaches 3
  useEffect(() => {
    if (checkoutStep === 3 && isLoggedIn && user) {
      console.log("🔄 CART PAGE - Checkout step 3 reached - Re-populating address");
      populateAddressFromUser(user);
    }
  }, [checkoutStep, isLoggedIn, user]);

  // Load cart when page loads
  useEffect(() => {
    async function loadCart() {
      if (!customerShopifyId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/cart/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerShopifyId }),
        });

        const data = await res.json();
        setCart(data.cart || null);
      } catch (e) {
        console.error("Failed to fetch cart:", e);
        setCart(null);
      }

      setLoading(false);
    }

    loadCart();
  }, [customerShopifyId]);

  // Calculate subtotal
  const subtotal =
    cart?.lines?.edges?.reduce(
      (sum, { node }) =>
        sum + Number(node.merchandise.price.amount) * node.quantity,
      0
    ) || 0;

  const isFreeDelivery = subtotal >= 500;

  // Calculate totals with shipping and tax
  const includedTaxAmount = calculationData?.tax?.shopMoney?.amount
    ? Number(calculationData.tax.shopMoney.amount)
    : 0;

  // 2️⃣ Calculate INCLUDED tax percentage (2 decimals)
  const includedTaxPercentRaw =
    includedTaxAmount > 0
      ? (includedTaxAmount / (subtotal - includedTaxAmount)) * 100
      : 0;

  const includedTaxPercent = Number(includedTaxPercentRaw.toFixed(20));

  // 3️⃣ Multiply tax percentage × 2 (again keep 2 decimals)
  const multipliedTaxPercent = Number((includedTaxPercent * 2));

  const basetaxAmount = Number(((subtotal * multipliedTaxPercent) / 100));

  // 4️⃣ Remove INCLUDED tax from subtotal → base subtotal
  const baseSubtotal = Number((subtotal - basetaxAmount));

  // 5️⃣ Calculate FINAL tax using multiplied percentage
  const taxAmount = Number(
    ((baseSubtotal * multipliedTaxPercent) / 100).toFixed(2)
  );

  // 6️⃣ Shipping
  const shippingAmount = calculationData?.shipping?.price?.amount
    ? Number(calculationData.shipping.price.amount)
    : 0;

  // 7️⃣ Final total
  const totalAmount = Number(
    (subtotal + shippingAmount).toFixed(2)
  );

  // Calculate shipping and tax
  const calculateShippingAndTax = async () => {
    if (!address.firstName || !address.lastName || !address.address1 ||
      !address.city || !address.province || !address.zip) {
      alert("Please fill in all required address fields first");
      return;
    }
    if (!cart || !cart.lines || cart.lines.edges.length === 0) {
      alert("Cart is empty");
      return;
    }

    setIsCalculating(true);
    setCalculationError(null);

    try {
      const lineItems = cart.lines.edges.map((line) => ({
        variant_id: line.node.merchandise.id,
        quantity: line.node.quantity,
      }));

      const res = await fetch("/api/calculate-shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          shippingAddress: {
            firstName: address.firstName,
            lastName: address.lastName,
            address1: address.address1,
            city: address.city,
            provinceCode: address.provinceCode || address.province,
            zip: address.zip,
          },
          lineItems,
        }),
      });

      const data = await res.json();
      console.log("Calculation response:", data);

      if (data.success) {
        let processedData = { ...data };
        if (subtotal >= 500 && processedData.shipping) {
          processedData.shipping.price.amount = "0.00";
          console.log("✅ Applied free shipping rule");
        }
        setCalculationData(processedData);
        setCalculationError(null);
      } else {
        setCalculationError(data.error || "Failed to calculate shipping and tax");
        setCalculationData(null);
      }
    } catch (err) {
      console.error("Calculation error:", err);
      setCalculationError("Network error. Please try again.");
      setCalculationData(null);
    } finally {
      setIsCalculating(false);
    }
  };

  // STEP 1 — SEND OTP (only for non-logged in users)
  const sendOTP = async () => {
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          shop: process.env.SHOPIFY_STORE_DOMAIN,
        }),
      });

      const data = await res.json();
      if (data.success) setCheckoutStep(2);
      else if (data.message?.includes("already verified")) setCheckoutStep(3);
      else alert(data.message || "Failed to send OTP");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  // STEP 2 — VERIFY OTP
  const verifyOTP = async () => {
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          shop: process.env.SHOPIFY_STORE_DOMAIN,
        }),
      });

      const data = await res.json();
      if (data.success) setCheckoutStep(3);
      else alert("Invalid OTP");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  // UPDATE QUANTITY API
  const handleUpdateQuantity = async (lineId, quantity) => {
    try {
      const cartId = cart?.id || localStorage.getItem("cartId");
      if (!cartId) return alert("Cart ID missing");

      const res = await fetch("/api/cart/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, lineId, quantity }),
      });

      const data = await res.json();

      if (data.success) {
        setCart(data.cart);
        localStorage.setItem("cartId", data.cart.id);
        setCalculationData(null);
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        alert("Failed to update quantity: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update quantity");
    }
  };

  // REMOVE ITEM
  const handleRemoveItem = async (lineId) => {
    try {
      const cartId = cart?.id || localStorage.getItem("cartId");

      if (!customerShopifyId || !cartId) {
        return alert("Customer or Cart ID missing");
      }

      const res = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerShopifyId,
          cartId,
          lineId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCart(data.cart);
        setCalculationData(null);
      } else {
        alert(data.error || "Failed to remove item");
      }
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error(err);
      alert("Failed to remove item");
    }
  };

  // STEP 3 — PLACE ORDER
  const placeOrder = async () => {
    if (!address.firstName || !address.lastName || !address.address1 ||
      !address.city || !address.province || !address.zip || !address.phone) {
      alert("Please fill in all address fields");
      return;
    }

    try {
      const lineItems = cart.lines.edges.map((line) => ({
        variant_id: line.node.merchandise.id.split("/").pop(),
        quantity: line.node.quantity,
        price: line.node.merchandise.price.amount,
      }));

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          shippingAddress: {
            ...address,
            provinceCode: address.provinceCode || address.province,
          },
          lineItems,
          paymentMethod,
        }),
      });

      const data = await res.json();
      console.log("API Response:", data);

      if (data.success && data?.order?.data?.draftOrderComplete?.draftOrder?.order?.name) {
        const orderId = data?.order?.data?.draftOrderComplete?.draftOrder?.order?.name.replace("#", "");

        await fetch("/api/cart/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerShopifyId }),
        });

        localStorage.setItem("recentOrderId", orderId);
        setAddress(defaultAddress);
        setAddressFetched(false);
        alert(`Order Placed Successfully!\nOrder ID: ${data?.order?.data?.draftOrderComplete?.draftOrder?.order?.name}`);
        window.location.replace(`/thank-you?order=${orderId}`);
        return;
      } else {
        alert("Order failed: " + (data.error || "Try again"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error! Please try again.");
    }
  };

  const handleProceedToCheckout = () => {
    if (isLoggedIn) {
      setCheckoutStep(3);
    } else {
      setCheckoutStep(1);
    }
  };

  const handleReloadAddress = () => {
    console.log("🔄 CART PAGE - Manual reload triggered");
    if (user) {
      populateAddressFromUser(user);
    } else {
      console.log("❌ No user data available to reload");
    }
  };

  const handleBackToCart = () => {
    setCheckoutStep(0);
    setCalculationData(null);
    setCalculationError(null);
  };

  const paymentIcons = {
    cod: Truck,
    online: CreditCard,
    upi: Wallet
  };

  const PaymentIcon = paymentIcons[paymentMethod];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#7d4b0e] animate-spin mx-auto mb-4" />
          <p className="text-[#7d4b0e] font-semibold text-xl">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.lines?.edges?.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={60} className="text-[#8b4513]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#7d4b0e] mb-4">
            Your Cart is Empty
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Looks like you haven't added any delicious khakhra yet!
          </p>
          <a
            href="/collection"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#7d4b0e] to-[#a0682a] text-white rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Start Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress Indicator */}
        {/* <div className="mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {['Cart', 'Email', 'Verify', 'Checkout'].map((label, idx) => (
              <div key={label} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full font-semibold text-sm ${checkoutStep >= idx
                    ? 'bg-[#7d4b0e] text-white'
                    : 'bg-gray-200 text-gray-500'
                  }`}>
                  {checkoutStep > idx ? <CheckCircle size={20} /> : idx + 1}
                </div>
                <span className={`ml-2 text-xs md:text-sm font-medium ${checkoutStep >= idx ? 'text-[#7d4b0e]' : 'text-gray-400'
                  }`}>
                  {label}
                </span>
                {idx < 3 && (
                  <div className={`w-8 md:w-16 h-0.5 mx-2 ${checkoutStep > idx ? 'bg-[#7d4b0e]' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div> */}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {checkoutStep === 0 && "Your Shopping Cart"}
                {checkoutStep === 1 && "Email Verification"}
                {checkoutStep === 2 && "Enter OTP"}
                {checkoutStep === 3 && "Complete Your Order"}
              </h2>
              <p className="text-sm text-white/90">
                {checkoutStep === 0 && `${cart?.lines?.edges?.length || 0} items in your cart`}
                {checkoutStep === 1 && "Enter your email to continue"}
                {checkoutStep === 2 && "We've sent a verification code to your email"}
                {checkoutStep === 3 && "Review and confirm your order"}
              </p>
            </div>
          </div>

          {/* CART VIEW */}
          {checkoutStep === 0 && (
            <div className="p-6">
              {/* Free Shipping Progress */}
              <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium flex items-center gap-2">
                    <Truck size={16} className="text-[#7d4b0e]" />
                    Free Shipping on orders over ₹500
                  </span>
                  <span className="text-xs font-semibold text-[#7d4b0e]">
                    {isFreeDelivery
                      ? "Unlocked! 🎉"
                      : `₹${(500 - subtotal).toFixed(0)} more`
                    }
                  </span>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${isFreeDelivery ? 'bg-green-500' : 'bg-amber-500'
                      }`}
                    style={{ width: `${Math.min((subtotal / 500) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart?.lines?.edges?.map(({ node }) => {
                  const product = node.merchandise.product;
                  const image = product.featuredImage?.url || product.images?.edges?.[0]?.node?.url;
                  return (
                    <div
                      key={node.id}
                      className="flex flex-col sm:flex-row gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-amber-300 transition-colors"
                    >
                      {/* Product Image */}
                      <img
                        src={image}
                        alt={product.title}
                        className="w-full sm:w-24 sm:h-24 md:w-28 md:h-28 h-40 rounded-lg object-cover shadow-md flex-shrink-0"
                      />

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-1 truncate">
                            {product.title}
                          </h4>

                          <p className="text-sm text-gray-500 mb-3 truncate">
                            {node.merchandise.title}
                          </p>
                        </div>

                        {/* Quantity + Price */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => handleUpdateQuantity(node.id, node.quantity - 1)}
                              disabled={node.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus size={16} />
                            </button>

                            <span className="w-10 text-center font-semibold">
                              {node.quantity}
                            </span>

                            <button
                              onClick={() => handleUpdateQuantity(node.id, node.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {/* Price */}
                          <span className="font-bold text-[#8b4513] text-base sm:text-lg">
                            ₹{(Number(node.merchandise.price.amount) * node.quantity).toFixed(0)}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(node.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2 transition-colors self-end sm:self-start flex-shrink-0"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                  );
                })}
              </div>

              {/* Cart Summary */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 sm:p-5 md:p-6">
                {/* Subtotal Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                  <span className="text-gray-700 font-medium text-sm sm:text-base">
                    Subtotal
                  </span>

                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    ₹{subtotal.toFixed(0)}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-gradient-to-r from-[#8f4a12] to-[#5a3102]
               text-white py-3 sm:py-4 rounded-xl
               font-bold text-base sm:text-lg
               hover:shadow-xl transition-all
               active:scale-[0.98] hover:scale-[1.02]"
                >
                  Proceed to Checkout
                </button>
              </div>

            </div>
          )}

          {/* EMAIL STEP */}
          {checkoutStep === 1 && (
            <div className="p-6 md:p-8">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Mail size={24} className="text-[#7d4b0e]" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Email Address</h4>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-base focus:border-[#7d4b0e] focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleBackToCart}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Back to Cart
                  </button>
                  <button
                    onClick={sendOTP}
                    disabled={!email}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* OTP STEP */}
          {checkoutStep === 2 && (
            <div className="p-6 md:p-8">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <ShieldCheck size={24} className="text-[#7d4b0e]" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Verification Code</h4>
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-center text-xl tracking-widest focus:border-[#7d4b0e] focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCheckoutStep(1)}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={verifyOTP}
                    disabled={!otp}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Verify OTP
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CHECKOUT STEP */}
          {checkoutStep === 3 && (
            <div className="p-6 md:p-8">
              {orderPlaced ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={48} className="text-green-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    Order Placed Successfully!
                  </h3>
                  <p className="text-gray-600 text-lg">Thank you for your purchase</p>
                </div>
              ) : addressLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-[#7d4b0e] animate-spin mb-4" />
                  <p className="text-gray-600 text-lg">Loading your details...</p>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Address Section */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                          <MapPin size={24} className="text-[#7d4b0e]" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Delivery Address</h4>
                      </div>
                    </div>

                    {isLoggedIn && addressFetched && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-800 font-semibold flex items-center gap-2">
                          <CheckCircle size={18} />
                          Auto-filled from your saved address
                        </p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          placeholder="First Name"
                          value={address.firstName}
                          onChange={(e) => {
                            setAddress({ ...address, firstName: e.target.value });
                            setCalculationData(null);
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#7d4b0e] focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={address.lastName}
                          onChange={(e) => {
                            setAddress({ ...address, lastName: e.target.value });
                            setCalculationData(null);
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#7d4b0e] focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Address *
                        </label>
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={address.address1}
                          onChange={(e) => {
                            setAddress({ ...address, address1: e.target.value });
                            setCalculationData(null);
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#7d4b0e] focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          placeholder="City"
                          value={address.city}
                          onChange={(e) => {
                            setAddress({ ...address, city: e.target.value });
                            setCalculationData(null);
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#7d4b0e] focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          State/Province *
                        </label>
                        <input
                          type="text"
                          placeholder="Province"
                          value={address.province}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAddress({
                              ...address,
                              province: val,
                              provinceCode: val
                            });
                            setCalculationData(null);
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#7d4b0e] focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Country *
                        </label>
                        <input
                          type="text"
                          placeholder="Country"
                          value={address.country}
                          onChange={(e) => {
                            setAddress({ ...address, country: e.target.value });
                            setCalculationData(null);
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#7d4b0e] focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Zip Code *
                        </label>
                        <input
                          type="text"
                          placeholder="Zip Code"
                          value={address.zip}
                          onChange={(e) => {
                            setAddress({ ...address, zip: e.target.value });
                            setCalculationData(null);
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#7d4b0e] focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={address.phone}
                          onChange={(e) =>
                            setAddress({ ...address, phone: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#7d4b0e] focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Calculate Button */}
                    <button
                      onClick={calculateShippingAndTax}
                      disabled={isCalculating}
                      className="w-full mt-6 px-6 py-4 bg-amber-100 text-[#7d4b0e] rounded-lg font-bold hover:bg-amber-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-lg"
                    >
                      {isCalculating ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Calculator size={20} />
                          Calculate Shipping & Tax
                        </>
                      )}
                    </button>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
                      <CheckCircle size={22} className="text-green-600" />
                      Order Summary
                    </h4>

                    {isCalculating && (
                      <div className="flex items-center gap-2 text-gray-600 py-4">
                        <Loader2 size={18} className="animate-spin" />
                        <span>Calculating shipping & tax...</span>
                      </div>
                    )}

                    {calculationError && (
                      <div className="mt-2 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 font-medium">
                        {calculationError}
                      </div>
                    )}

                    {!isCalculating && calculationData && (
                      <div className="space-y-3 text-base">
                        <div className="flex justify-between py-2">
                          <span className="text-gray-700">Subtotal</span>
                          <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 opacity-50">
                          <span className="text-gray-700">Tax (included)</span>
                          <span className="font-semibold text-gray-900">₹{taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-700">
                            Shipping ({calculationData.shipping?.title || "—"})
                            {isFreeDelivery && <span className="ml-2 text-green-600 font-semibold">(Free)</span>}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {isFreeDelivery ? "₹0" : `₹${shippingAmount.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="pt-3 border-t-2 border-amber-300 flex justify-between">
                          <span className="font-bold text-gray-900 text-lg">Total</span>
                          <span className="font-bold text-[#7d4b0e] text-2xl">
                            ₹{totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <PaymentIcon size={24} className="text-[#7d4b0e]" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">Payment Method</h4>
                    </div>

                    <div className="space-y-3">
                      {[
                        { value: 'cod', label: 'Cash on Delivery', icon: Truck, color: '#16a34a' },
                      ].map((option) => {
                        const Icon = option.icon;
                        const isSelected = paymentMethod === option.value;
                        return (
                          <label
                            key={option.value}
                            className={`flex items-center gap-3 p-5 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                              ? 'border-[#7d4b0e] bg-amber-50'
                              : 'border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            <input
                              type="radio"
                              name="payment"
                              value={option.value}
                              checked={isSelected}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="w-5 h-5 cursor-pointer accent-[#7d4b0e]"
                            />
                            <Icon size={24} style={{ color: option.color }} />
                            <span className="font-semibold text-gray-900 flex-1 text-lg">
                              {option.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleBackToCart}
                      className="flex-1 px-8 py-4 border-2 border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors text-lg"
                    >
                      Back to Cart
                    </button>
                    <button
                      onClick={placeOrder}
                      disabled={!calculationData}
                      className="flex-1 px-8 py-4 bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white rounded-lg font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}