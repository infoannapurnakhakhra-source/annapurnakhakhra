"use client";
import { useState, useEffect } from "react";
import YouMayAlsoLike from "./Suggestedproductssection";
import { X, Trash2, Plus, Minus, MapPin, CreditCard, Truck, Wallet, CheckCircle, Mail, ShieldCheck, Loader2, RefreshCw, ShoppingCart, Calculator } from "lucide-react";
export default function CartDrawer({
  cart: initialCart,
  isOpen,
  setIsOpen,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) {
  // Cart state
  const [cart, setCart] = useState(initialCart);
  const [loading, setLoading] = useState(true);
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  // User & Auth states
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressFetched, setAddressFetched] = useState(false);
  // Modal States
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
  // Handle animation when drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isOpen]);
  // Function to populate address from user data
  const populateAddressFromUser = (userData) => {
    if (!userData) {
      console.log("❌ No user data provided to populateAddressFromUser");
      return;
    }
    console.log("=".repeat(50));
    console.log("🔍 CART DRAWER - STARTING ADDRESS POPULATION");
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
      console.log("🚀 CART DRAWER - Fetching profile for customerShopifyId:", customerShopifyId);
      setAddressLoading(true);
      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId: customerShopifyId }),
        });
        const data = await res.json();
        console.log("=".repeat(50));
        console.log("📦 CART DRAWER - PROFILE API RESPONSE:");
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
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen, customerShopifyId]);
  // Re-populate when checkout step reaches 3
  useEffect(() => {
    if (checkoutStep === 3 && isLoggedIn && user) {
      console.log("🔄 CART DRAWER - Checkout step 3 reached - Re-populating address");
      populateAddressFromUser(user);
    }
  }, [checkoutStep, isLoggedIn, user]);
  // Load cart when drawer opens
  useEffect(() => {
    async function loadCart() {
      if (!isOpen || !customerShopifyId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    }
    if (isOpen) {
      loadCart();
    }
  }, [isOpen, customerShopifyId]);
  // Update cart when initialCart prop changes
  useEffect(() => {
    if (initialCart) {
      setCart(initialCart);
      setLoading(false);
    }
  }, [initialCart]);



  // Calculate shipping and tax
  const calculateShippingAndTax = async () => {
    // Validation
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
        // Apply free shipping rule if subtotal >= 500
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
  if (!shouldRender) return null;
  const subtotal =
    cart?.lines?.edges?.reduce(
      (sum, { node }) =>
        sum + Number(node.merchandise.price.amount) * node.quantity,
      0
    ) || 0;
  const isFreeDelivery = subtotal >= 500;
  // Calculate totals with shipping and tax
  // const shippingAmount = calculationData?.shipping?.price?.amount
  //   ? Number(calculationData.shipping.price.amount)
  //   : 0;
  // const taxAmount = calculationData?.tax?.shopMoney?.amount
  //   ? Number(calculationData.tax.shopMoney.amount)
  //   : 0;
  // const totalAmount = subtotal + shippingAmount ;


  // const subtotal = Number(subtotalAmount); // tax included
  // Subtotal includes original tax

  // 1️⃣ Included tax amount (from Shopify)
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
  // Internal update quantity handler
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
        // Reset calculation when cart changes
        setCalculationData(null);
        if (onUpdateQuantity) {
          onUpdateQuantity(lineId, quantity);
        }
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        alert("Failed to update quantity: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update quantity");
    }
  };
  // Internal remove item handler
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
        // Reset calculation when cart changes
        setCalculationData(null);
        if (onRemoveItem) {
          onRemoveItem(lineId);
        }
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
    // Validation
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
        setIsOpen(false);
        setCheckoutStep(0);
        // Reset address after successful order placement
        setAddress(defaultAddress);
        setAddressFetched(false);
        alert(`Order Placed Successfully!\nOrder ID: ${data?.order?.data?.draftOrderComplete?.draftOrder?.order?.name}`);
        // PASS TOTAL AMOUNT TO THANK YOU PAGE
        window.location.replace(`/thank-you?order=${orderId}&amount=${totalAmount}&currency=INR`);
        return;
      } else {
        alert("Order failed: " + (data.error || "Try again"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error! Please try again.");
    }
  };
  const handleClose = () => {
    setIsOpen(false);
    setCheckoutStep(0);
    setEmail("");
    setOtp("");
    setOrderPlaced(false);
    setCalculationData(null);
    setCalculationError(null);
    // Reset address when closing drawer
    setAddress(defaultAddress);
    setAddressFetched(false);
  };
  const handleProceedToCheckout = () => {
    // TRACKING CODE START
    if (typeof window.fbq !== 'undefined') {
      window.fbq('track', 'InitiateCheckout', {
        value: totalAmount,
        currency: 'INR',
        num_items: cart?.lines?.edges?.length || 0
      });
    }
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'begin_checkout', {
        value: totalAmount,
        currency: 'INR',
        items: cart?.lines?.edges?.map(edge => ({
          item_id: edge.node.merchandise.id,
          item_name: edge.node.merchandise.product.title,
          price: edge.node.merchandise.price.amount,
          quantity: edge.node.quantity
        }))
      });
    }
    // TRACKING CODE END

    if (isLoggedIn) {
      setCheckoutStep(3);
    } else {
      setCheckoutStep(1);
    }
  };
  const handleReloadAddress = () => {
    console.log("🔄 CART DRAWER - Manual reload triggered");
    if (user) {
      populateAddressFromUser(user);
    } else {
      console.log("❌ No user data available to reload");
    }
  };
  const paymentIcons = {
    cod: Truck,
    online: CreditCard,
    upi: Wallet
  };
  const PaymentIcon = paymentIcons[paymentMethod];
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-0'
          }`}
        style={{ backdropFilter: isAnimating ? 'blur(4px)' : 'none' }}
        onClick={handleClose}
      />
      {/* Drawer */}
      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full shadow-2xl z-50 transition-transform duration-300 ease-out ${isAnimating ? 'translate-x-0' : 'translate-x-full'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Desktop split layout */}
        <div className="flex h-full max-w-[700px] ml-auto bg-white ">
          <div className="hidden lg:block w-[40%] border-r border-gray-200 overflow-y-auto">
            <YouMayAlsoLike />
          </div>
          <div className="w-full lg:w-[60%] flex flex-col bg-white ">
            {/* Header - Dynamic based on step */}
            <div className="bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white p-6 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
              <div className="relative z-10">
                <h2 className="text-xl font-bold">
                  {checkoutStep === 0 && "Your Cart"}
                  {checkoutStep === 1 && "Email Verification"}
                  {checkoutStep === 2 && "Enter OTP"}
                  {checkoutStep === 3 && "Checkout"}
                </h2>
                <p className="text-sm text-white/90 mt-1">
                  {checkoutStep === 0 && `${cart?.lines?.edges?.length || 0} items`}
                  {checkoutStep === 1 && "Enter your email to continue"}
                  {checkoutStep === 2 && "We've sent a code to your email"}
                  {checkoutStep === 3 && (isLoggedIn ? "Review and confirm your order" : "Complete your order details")}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="relative z-10 bg-white/20 hover:bg-white/30 transition-colors rounded-full p-2"
              >
                <X size={20} />
              </button>
            </div>
            {/* CART VIEW */}
            {checkoutStep === 0 && (
              <>
                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <Loader2 className="w-16 h-16 text-[#7d4b0e] animate-spin mb-4" />
                    <p className="text-[#7d4b0e] font-semibold">Loading your cart...</p>
                  </div>
                ) : !cart || !cart.lines || cart.lines.edges.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                      <ShoppingCart size={40} className="text-[#8b4513]" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium">Your cart is empty</p>
                    <p className="text-gray-400 text-sm mt-2">Add some delicious khakhra!</p>
                    <a
                      href="/collection"
                      className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#7d4b0e] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-yellow-600"
                    >
                      Start Shopping
                    </a>
                  </div>
                ) : (
                  <>
                    {/* Free Shipping Progress Bar - Moved to Top */}
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Truck size={14} />
                            Free Shipping on orders over ₹500
                          </span>
                          <span className="text-xs font-medium text-gray-700">
                            {isFreeDelivery
                              ? "Unlocked! 🎉"
                              : `₹${(500 - subtotal).toFixed(0)} more`
                            }
                          </span>
                        </div>
                        <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${isFreeDelivery
                              ? 'bg-green-500'
                              : 'bg-amber-500'
                              }`}
                            style={{
                              width: `${Math.min((subtotal / 500) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-2">
                      {cart?.lines?.edges?.map(({ node }) => {
                        const product = node.merchandise.product;
                        const image =
                          product.featuredImage?.url ||
                          product.images?.edges?.[0]?.node?.url;
                        return (
                          <div key={node.id} className="flex gap-4 py-4 border-b border-gray-200 last:border-b-0">
                            <img
                              src={image}
                              className="w-20 h-20 rounded-lg object-cover shadow-sm"
                              alt={product.title}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{product.title}</h4>
                              <p className="text-sm text-gray-500 truncate">
                                {node.merchandise.title}
                              </p>
                              <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                  <button
                                    onClick={() =>
                                      handleUpdateQuantity(node.id, node.quantity - 1)
                                    }
                                    disabled={node.quantity <= 1}
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="w-8 text-center font-medium">{node.quantity}</span>
                                  <button
                                    onClick={() =>
                                      handleUpdateQuantity(node.id, node.quantity + 1)
                                    }
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                                <span className="font-bold text-[#8b4513]">
                                  ₹{(Number(node.merchandise.price.amount) * node.quantity).toFixed(0)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(node.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2 transition-colors self-start"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="lg:hidden">
                      <YouMayAlsoLike />
                    </div>
                    <div className="border-t border-gray-200 p-4 space-y-3 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-lg font-bold text-gray-900">₹{subtotal.toFixed(0)}</span>
                      </div>
                      <button
                        onClick={handleProceedToCheckout}
                        className="w-full bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02]"
                      >
                        Proceed to Checkout
                      </button>
                      <button
                        onClick={() => (window.location.href = "/cart")}
                        className="text-sm text-black hover:underline ml-2 flex items-center gap-2"
                      >
                        View Cart →
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
            {/* EMAIL STEP */}
            {checkoutStep === 1 && (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Mail size={20} className="text-[#7d4b0e]" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">Email Address</h4>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#7d4b0e] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCheckoutStep(0)}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={sendOTP}
                      disabled={!email}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* OTP STEP */}
            {checkoutStep === 2 && (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <ShieldCheck size={20} className="text-[#7d4b0e]" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">Verification Code</h4>
                    </div>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#7d4b0e] focus:outline-none transition-colors text-center text-lg tracking-widest"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCheckoutStep(1)}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={verifyOTP}
                      disabled={!otp}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify OTP
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* CHECKOUT STEP */}
            {checkoutStep === 3 && (
              <div className="flex-1 overflow-y-auto p-6">
                {orderPlaced ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Order Placed Successfully!
                    </h3>
                    <p className="text-gray-600">Thank you for your purchase</p>
                  </div>
                ) : addressLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-[#7d4b0e] animate-spin mb-2" />
                    <p className="text-gray-600">Loading your details...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Address Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <MapPin size={20} className="text-[#7d4b0e]" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Delivery Address</h4>
                        </div>

                      </div>
                      {isLoggedIn && addressFetched && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
                          <p className="text-blue-800 font-medium flex items-center gap-2">
                            <CheckCircle size={16} />
                            Auto-filled from your saved address
                          </p>
                        </div>
                      )}
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:border-[#7d4b0e] focus:outline-none transition-colors"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:border-[#7d4b0e] focus:outline-none transition-colors"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
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
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:border-[#7d4b0e] focus:outline-none transition-colors"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:border-[#7d4b0e] focus:outline-none transition-colors"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:border-[#7d4b0e] focus:outline-none transition-colors"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:border-[#7d4b0e] focus:outline-none transition-colors"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:border-[#7d4b0e] focus:outline-none transition-colors"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            placeholder="Phone Number"
                            value={address.phone}
                            onChange={(e) =>
                              setAddress({ ...address, phone: e.target.value })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:border-[#7d4b0e] focus:outline-none transition-colors"
                            required
                          />
                        </div>
                      </div>
                      {/* Calculate Button */}
                      <button
                        onClick={calculateShippingAndTax}
                        disabled={isCalculating}
                        className="w-full mt-4 px-4 py-3 bg-amber-100 text-[#7d4b0e] rounded-lg font-semibold hover:bg-amber-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isCalculating ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Calculating...
                          </>
                        ) : (
                          <>
                            <Calculator size={18} />
                            Calculate Shipping & Tax
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle size={18} className="text-green-600" />
                        Order Summary
                      </h4>
                      {/* Loading state */}
                      {isCalculating && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Loader2 size={16} className="animate-spin" />
                          Calculating shipping & tax...
                        </div>
                      )}
                      {/* Error state */}
                      {calculationError && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                          {calculationError}
                        </div>
                      )}
                      {/* Summary */}
                      {!isCalculating && calculationData && (
                        <div className="space-y-2 text-sm mt-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between opacity-50">
                            <span className="text-gray-600">Tax (included)</span>
                            <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Shipping ({calculationData.shipping?.title || "—"}) {isFreeDelivery ? "(Free)" : ""}
                            </span>
                            <span className="font-medium">
                              {isFreeDelivery ? "₹0" : `₹${shippingAmount.toFixed(2)}`}
                            </span>
                          </div>
                          <div className="pt-2 border-t-2 border-amber-300 flex justify-between">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="font-bold text-[#7d4b0e] text-lg">
                              ₹{totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Payment Method Section */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <PaymentIcon size={20} className="text-[#7d4b0e]" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Payment Method</h4>
                      </div>
                      <div className="space-y-2">
                        {[
                          { value: 'cod', label: 'Cash on Delivery', icon: Truck, color: '#16a34a' },
                        ].map((option) => {
                          const Icon = option.icon;
                          const isSelected = paymentMethod === option.value;
                          return (
                            <label
                              key={option.value}
                              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
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
                                className="w-4 h-4 cursor-pointer accent-[#7d4b0e]"
                              />
                              <Icon size={20} style={{ color: option.color }} />
                              <span className="font-medium text-gray-900 flex-1">
                                {option.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleClose}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={placeOrder}
                        disabled={!calculationData}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    </>
  );
}
