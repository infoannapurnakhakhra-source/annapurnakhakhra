"use client";
import { useEffect, useState } from "react";
import { X, MapPin, CreditCard, Truck, Wallet, CheckCircle, Mail, ShieldCheck, Loader2, RefreshCw, Plus, Minus, Trash2, Calculator, ShoppingCart, Smartphone } from 'lucide-react';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressFetched, setAddressFetched] = useState(false);

  // Checkout States - UPDATED: Added phone and login_phone/login_otp steps
  const [checkoutStep, setCheckoutStep] = useState(0); // 0 = cart view, 1 = login_phone, 2 = login_otp, 3 = checkout
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // For login
  const [otp, setOtp] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Shipping & Tax calculation states
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationData, setCalculationData] = useState(null);
  const [calculationError, setCalculationError] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Email validation
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const ALLOWED_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "proton.me"];

  const validatePublicEmail = (email) => {
    if (!email) return false;
    const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicRegex.test(email)) return false;
    const domain = email.split("@")[1]?.toLowerCase();
    return ALLOWED_DOMAINS.includes(domain);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|in|net|org|co|io)$/i;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (!email) {
      setEmailError("Email is required");
    } else if (!validatePublicEmail(email)) {
      setEmailError("Use Gmail, Yahoo, Outlook, iCloud or Proton email only");
    } else {
      setEmailError("");
    }
  }, [email]);

  const handlePlaceOrder = async () => {
    if (!calculationData || isPlacingOrder) return;

    try {
      setIsPlacingOrder(true);
      await placeOrder();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

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

  // ✅ Listen for successful login to reload cart
  useEffect(() => {
    const handleCustomerUpdate = () => {
      const newCustomerId = localStorage.getItem("customerShopifyId");
      if (newCustomerId) {
        setIsLoggedIn(true);
        loadCartAfterLogin();
      }
    };

    window.addEventListener("customer-updated", handleCustomerUpdate);
    return () => window.removeEventListener("customer-updated", handleCustomerUpdate);
  }, []);

  // ✅ Function to reload cart after login
  const loadCartAfterLogin = async () => {
    const customerId = localStorage.getItem("customerShopifyId");
    if (!customerId) return;

    try {
      setLoading(true);
      const res = await fetch("/api/cart/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerShopifyId: customerId,
          cartId: localStorage.getItem("cartId") || null,
        }),
      });

      const data = await res.json();
      if (data?.cart) {
        setCart(data.cart);
        if (data.cart.id) {
          localStorage.setItem("cartId", data.cart.id);
        }
      }

      await fetchUserProfile();
    } catch (err) {
      console.error("Failed to reload cart after login:", err);
    } finally {
      setLoading(false);
    }
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

  // ✅ EXTRACT fetchUserProfile as a standalone function
  const fetchUserProfile = async () => {
    const customerId = customerShopifyId || localStorage.getItem("customerShopifyId");
    if (!customerId) {
      console.log("❌ No customerShopifyId in localStorage");
      setIsLoggedIn(false);
      return;
    }

    console.log("🚀 CART PAGE - Fetching profile for customerShopifyId:", customerId);
    setAddressLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
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
        setEmail(
          validatePublicEmail(data.customer.email)
            ? data.customer.email
            : ""
        );
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

  // Fetch user profile and default address
  useEffect(() => {
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
      try {
        setLoading(true);

        const body = {
          customerShopifyId: customerShopifyId || null,
          cartId: localStorage.getItem("cartId") || localStorage.getItem("guestCartId") || null,
        };

        const res = await fetch("/api/cart/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (data?.cart?.id) {
          if (customerShopifyId) {
            localStorage.setItem("cartId", data.cart.id);
          } else {
            localStorage.setItem("guestCartId", data.cart.id);
            localStorage.setItem("cartId", data.cart.id);
          }
        }

        if (data?.expired && !customerShopifyId) {
          window.dispatchEvent(new CustomEvent('guest-cart-expired', { detail: { cartId: data.cart?.id } }));
        }

        setCart(data.cart || null);

        setTimeout(() => window.dispatchEvent(new Event("cart-updated")), 100);
      } catch (e) {
        console.error("Failed to fetch cart:", e);
        setCart(null);
      } finally {
        setLoading(false);
      }
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

  const includedTaxPercentRaw =
    includedTaxAmount > 0
      ? (includedTaxAmount / (subtotal - includedTaxAmount)) * 100
      : 0;

  const includedTaxPercent = Number(includedTaxPercentRaw.toFixed(20));
  const multipliedTaxPercent = Number((includedTaxPercent * 2));
  const basetaxAmount = Number(((subtotal * multipliedTaxPercent) / 100));
  const baseSubtotal = Number((subtotal - basetaxAmount));

  const taxAmount = Number(
    ((baseSubtotal * multipliedTaxPercent) / 100).toFixed(2)
  );

  const shippingAmount = calculationData?.shipping?.price?.amount
    ? Number(calculationData.shipping.price.amount)
    : 0;

  const totalAmount = Number(
    (subtotal + shippingAmount).toFixed(2)
  );

  // Calculate shipping and tax
  const calculateShippingAndTax = async () => {
    if (!address.firstName || !address.lastName || !address.address1 ||
      !address.city || !address.province || !address.zip) {
      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    if (!cart || !cart.lines || cart.lines.edges.length === 0) {
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

        const sessionId = localStorage.getItem("abandoned_checkout_session_id");
        if (sessionId) {
          const shopurl = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "your-store.myshopify.com";

          const trackingPayload = {
            shopurl,
            sessionId,
            event: "checkout_calculated",
            address: {
              firstName: address.firstName,
              lastName: address.lastName,
              address1: address.address1,
              city: address.city,
              province: address.province,
              provinceCode: address.provinceCode || address.province,
              country: address.country,
              zip: address.zip,
              phone: address.phone || null,
            },
            pricing: {
              subtotal: subtotal,
              shipping: {
                title: processedData.shipping?.title || "Standard Shipping",
                price: parseFloat(processedData.shipping?.price?.amount || 0),
              },
              tax: {
                amount: parseFloat(processedData.tax?.shopMoney?.amount || 0),
                currency: processedData.tax?.shopMoney?.currencyCode || "INR",
              },
              total: parseFloat(
                processedData.total?.shopMoney?.amount ||
                subtotal + parseFloat(processedData.shipping?.price?.amount || 0)
              ),
            },
            meta: {
              url: window.location.href,
              timestamp: new Date().toISOString(),
            },
          };

          if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(trackingPayload)], { type: "application/json" });
            navigator.sendBeacon("/api/track/checkout", blob);
          } else {
            fetch("/api/track/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(trackingPayload),
              keepalive: true,
            }).catch(() => { });
          }
        }

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

  // ✅ Auto-calculate when all fields are filled
  useEffect(() => {
    if (checkoutStep !== 3) return;

    const allFieldsFilled =
      address.firstName?.trim() &&
      address.lastName?.trim() &&
      address.address1?.trim() &&
      address.city?.trim() &&
      address.province?.trim() &&
      address.zip?.trim() &&
      address.phone?.trim() &&
      email?.trim() &&
      validateEmail(email);

    if (allFieldsFilled && !calculationData && !isCalculating) {
      console.log("🔄 Auto-calculating shipping and tax...");
      calculateShippingAndTax();
    }
  }, [
    checkoutStep,
    address.firstName,
    address.lastName,
    address.address1,
    address.city,
    address.province,
    address.zip,
    address.phone,
    email,
    calculationData,
    isCalculating
  ]);

  // ✅ NEW: Send OTP for Login
  const handleSendLoginOtp = async () => {
    const isValidPhone = (value) => /^[6-9]\d{9}$/.test(value);

    if (!isValidPhone(phone.trim())) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          storeName: process.env.SHOPIFY_STORE_DOMAIN,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("OTP sent to your WhatsApp!");
        setCheckoutStep(2); // Move to OTP verification step
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Verify OTP for Login
  const handleVerifyLoginOtp = async () => {
    const isValidOtp = (value) => /^\d{6}$/.test(value);

    if (!isValidOtp(otp.trim())) {
      alert("OTP must be exactly 6 digits");
      return;
    }

    setLoading(true);

    try {
      const guestCartId = localStorage.getItem("guestCartId");

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          storeName: process.env.SHOPIFY_STORE_DOMAIN,
          enteredOtp: otp.trim(),
          guestCartId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const shopifyId = data.user.storeEntry.shopifyCustomerId;
        localStorage.setItem("customerShopifyId", shopifyId);

        const merge = data.user?.merge;
        const finalCartId = data.cartId || (merge?.merged ? merge.mergedCartId : guestCartId);

        if (finalCartId) {
          localStorage.setItem("cartId", finalCartId);
        }

        try {
          const resCart = await fetch("/api/cart/get", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerShopifyId: shopifyId, cartId: localStorage.getItem("cartId") || null }),
          });
          const cartData = await resCart.json();
          if (cartData?.cart?.id) {
            localStorage.setItem("cartId", cartData.cart.id);
            setCart(cartData.cart);
          }
        } catch (e) {
          console.error("Error fetching cart:", e);
        }

        if (merge?.merged) {
          localStorage.removeItem("guestCartId");
        }

        setIsLoggedIn(true);
        await fetchUserProfile();

        window.dispatchEvent(new Event("customer-updated"));
        window.dispatchEvent(new Event("cart-updated"));

        // Move to checkout step
        setCheckoutStep(3);
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
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
      const cartId = cart?.id || localStorage.getItem("cartId") || localStorage.getItem("guestCartId");
      if (!cartId) return alert("Cart ID missing");

      const res = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, lineId }),
      });

      const data = await res.json();

      if (data.success) {
        setCart(data.cart);
        setCalculationData(null);

        if (data.cart?.id) {
          localStorage.setItem("cartId", data.cart.id);
          if (!customerShopifyId) {
            localStorage.setItem("guestCartId", data.cart.id);
          }
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

      if (paymentMethod === "cod") {
        const res = await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: customerShopifyId,
            email,
            firstName: address.firstName,
            lastName: address.lastName,
            phoneNumber: address.phone,
            shippingAddress: {
              ...address,
              provinceCode: address.provinceCode || address.province,
            },
            lineItems,
            paymentMethod: "cod",
          }),
        });

        const data = await res.json();

        if (data.success) {
          const orderId =
            data?.order?.data?.draftOrderComplete?.draftOrder?.order?.name?.replace("#", "");

          await fetch("/api/cart/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerShopifyId }),
          });

          try {
            localStorage.removeItem("cartId");
            localStorage.removeItem("guestCartId");
          } catch (e) {
            // ignore
          }

          setCart(null);
          window.dispatchEvent(new Event("cart-updated"));

          localStorage.setItem("recentOrderId", orderId);
          setCheckoutStep(0);
          setAddress(defaultAddress);
          setAddressFetched(false);

          window.location.replace(`/thank-you?order=${orderId}&amount=${totalAmount}&currency=INR`);
          return;
        }

        alert("Order failed. Try again.");
        return;
      }

      if (paymentMethod === "payu") {
        if (!calculationData) {
          alert("Please calculate shipping & tax first");
          return;
        }

        const orderRef = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        localStorage.setItem(
          "pendingPayUOrder",
          JSON.stringify({
            email,
            address,
            lineItems: cart.lines.edges.map((line) => ({
              variant_id: line.node.merchandise.id.split("/").pop(),
              quantity: line.node.quantity,
              price: line.node.merchandise.price.amount,
            })),
            amount: totalAmount.toFixed(2),
            orderRef,
            customerShopifyId,
          })
        );

        try {
          const res = await fetch("/api/payu/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: totalAmount.toFixed(2),
              email,
              phone: address.phone || "",
              firstname: address.firstName,
              productinfo: `Khakhra Order - ${cart.lines.edges.length} items`,
              orderRef,
            }),
          });

          const data = await res.json();

          if (!data.action || !data.params) {
            alert("Payment initialization failed");
            return;
          }

          const form = document.createElement("form");
          form.method = "POST";
          form.action = data.action;

          Object.entries(data.params).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value;
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
        } catch (err) {
          console.error(err);
          alert("Failed to initiate payment. Please try again.");
        }

        return;
      }
    } catch (err) {
      console.error(err);
      alert("Network error! Please try again.");
    }
  };

  const handleProceedToCheckout = () => {
    const customerShopifyId = localStorage.getItem("customerShopifyId");

    // ✅ If not logged in, go to login step (step 1)
    if (!customerShopifyId) {
      setCheckoutStep(1);
      return;
    }

    // Generate a NEW unique sessionId every time checkout is initiated
    const sessionId = `chk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (typeof window !== "undefined") {
      localStorage.setItem("abandoned_checkout_session_id", sessionId);
    }

    // TRACKING CODE START
    if (typeof window.fbq !== 'undefined') {
      window.fbq('track', 'InitiateCheckout', {
        value: subtotal || 0,
        currency: 'INR',
        num_items: cart?.lines?.edges?.length || 0
      });
    }
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'begin_checkout', {
        value: subtotal || 0,
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

    const shopurl = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "hit-megascale.myshopify.com";

    const cartSnapshot = {
      id: cart?.id || null,
      checkoutUrl: cart?.checkoutUrl || null,
      totalQuantity: cart?.totalQuantity || 0,
      subtotal: subtotal || cart?.cost?.subtotalAmount?.amount || 0,
      currency: cart?.cost?.subtotalAmount?.currencyCode || "INR",
      items:
        cart?.lines?.edges?.map(({ node }) => ({
          line_id: node.id.split("/").pop().split("?")[0],
          variant_id: node.merchandise.id.split("/").pop(),
          product_title: node.merchandise.product.title,
          variant_title:
            node.merchandise.title !== "Default Title"
              ? node.merchandise.title
              : null,
          price: Number(node.merchandise.price.amount),
          quantity: node.quantity,
          image: node.merchandise.product.featuredImage?.url || null,
        })) || [],
    };

    const customerInfo =
      isLoggedIn && user
        ? {
          id: customerShopifyId || user.id || null,
          email: email || user.email || null,
          firstName: address?.firstName || user.firstName || "",
          lastName: address?.lastName || user.lastName || "",
          phone: address?.phone || null,
        }
        : null;

    const checkoutAddress =
      isLoggedIn && addressFetched && address?.address1
        ? {
          firstName: address.firstName,
          lastName: address.lastName,
          address1: address.address1,
          city: address.city,
          province: address.province,
          provinceCode: address.provinceCode || address.province,
          country: address.country || "India",
          zip: address.zip,
          phone: address.phone || null,
        }
        : null;

    const trackingPayload = {
      shopurl,
      sessionId,
      event: "checkout_started",
      customer: customerInfo,
      cart: cartSnapshot,
      address: checkoutAddress,
      pricing: null,
      meta: {
        url: typeof window !== "undefined" ? window.location.href : "",
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "",
        referrer:
          typeof document !== "undefined" ? document.referrer : "",
        timestamp: new Date().toISOString(),
        timezoneOffset: new Date().getTimezoneOffset(),
        screenResolution:
          typeof window !== "undefined"
            ? `${window.screen.width}x${window.screen.height}`
            : null,
      },
    };

    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(trackingPayload)], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/track/checkout", blob);
    } else {
      fetch("/api/track/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trackingPayload),
        keepalive: true,
      }).catch(() => { });
    }

    // Move to checkout step
    setCheckoutStep(3);
  };

  const handleBackToCart = () => {
    setCheckoutStep(0);
    setCalculationData(null);
    setCalculationError(null);
  };

  const handleReloadAddress = () => {
    console.log("🔄 CART PAGE - Manual reload triggered");
    if (user) {
      populateAddressFromUser(user);
    } else {
      console.log("❌ No user data available to reload");
    }
  };

  const paymentIcons = {
    cod: Truck,
    payu: CreditCard,
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
        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {checkoutStep === 0 && "Your Shopping Cart"}
                {checkoutStep === 1 && "Login to Continue"}
                {checkoutStep === 2 && "Enter OTP"}
                {checkoutStep === 3 && "Complete Your Order"}
              </h2>
              <p className="text-sm text-white/90">
                {checkoutStep === 0 && `${cart?.lines?.edges?.length || 0} items in your cart`}
                {checkoutStep === 1 && "Enter your mobile number"}
                {checkoutStep === 2 && "We've sent a code to your WhatsApp"}
                {checkoutStep === 3 && (isLoggedIn ? "Review and confirm your order" : "Complete your order details")}
              </p>
            </div>
          </div>

          {/* CART VIEW */}
          {checkoutStep === 0 && (
            <div className="p-6">
              {/* Free Shipping Progress */}
              <div className="relative overflow-hidden mb-6">
                {/* Animated background gradient */}
                <div className={`absolute inset-0 ${isFreeDelivery
                  ? 'bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10'
                  : 'bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5'
                  }`} />

                {/* Confetti Cannon Effects */}
                {isFreeDelivery && (
                  <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                    {/* Left Bottom Confetti Cannon */}
                    <div className="absolute bottom-0 left-0">
                      {[...Array(40)].map((_, i) => (
                        <div
                          key={`left-${i}`}
                          className="absolute bottom-0 left-0 w-2.5 h-4 rounded-sm confetti-left-diagonal"
                          style={{
                            backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#fbbf24', '#34d399', '#fb923c', '#a78bfa'][i % 10],
                            animationDelay: `${Math.random() * 0.6}s`,
                            '--shoot-x': `${100 + Math.random() * 400}px`,
                            '--shoot-y': `${-80 - Math.random() * 120}px`,
                            '--final-x': `${150 + Math.random() * 600}px`,
                            '--final-y': `${100 + Math.random() * 300}px`,
                            '--rot-start': `${Math.random() * 360}deg`,
                            '--rot-end': `${360 + Math.random() * 1080}deg`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Right Bottom Confetti Cannon */}
                    <div className="absolute bottom-0 right-0">
                      {[...Array(40)].map((_, i) => (
                        <div
                          key={`right-${i}`}
                          className="absolute bottom-0 right-0 w-2.5 h-4 rounded-sm confetti-right-diagonal"
                          style={{
                            backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#fbbf24', '#34d399', '#fb923c', '#a78bfa'][i % 10],
                            animationDelay: `${Math.random() * 0.6}s`,
                            '--shoot-x': `${-100 - Math.random() * 400}px`,
                            '--shoot-y': `${-80 - Math.random() * 120}px`,
                            '--final-x': `${-150 - Math.random() * 600}px`,
                            '--final-y': `${100 + Math.random() * 300}px`,
                            '--rot-start': `${Math.random() * 360}deg`,
                            '--rot-end': `${360 + Math.random() * 1080}deg`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Extra confetti from left */}
                    <div className="absolute bottom-0 left-[10%]">
                      {[...Array(25)].map((_, i) => (
                        <div
                          key={`left-extra-${i}`}
                          className="absolute bottom-0 left-0 w-2 h-3 rounded-sm confetti-left-wide"
                          style={{
                            backgroundColor: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#fb923c'][i % 5],
                            animationDelay: `${0.2 + Math.random() * 0.5}s`,
                            '--shoot-x': `${50 + Math.random() * 250}px`,
                            '--shoot-y': `${-60 - Math.random() * 80}px`,
                            '--final-x': `${100 + Math.random() * 450}px`,
                            '--final-y': `${120 + Math.random() * 250}px`,
                            '--rot-start': `${Math.random() * 360}deg`,
                            '--rot-end': `${360 + Math.random() * 720}deg`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Extra confetti from right */}
                    <div className="absolute bottom-0 right-[10%]">
                      {[...Array(25)].map((_, i) => (
                        <div
                          key={`right-extra-${i}`}
                          className="absolute bottom-0 right-0 w-2 h-3 rounded-sm confetti-right-wide"
                          style={{
                            backgroundColor: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#fb923c'][i % 5],
                            animationDelay: `${0.2 + Math.random() * 0.5}s`,
                            '--shoot-x': `${-50 - Math.random() * 250}px`,
                            '--shoot-y': `${-60 - Math.random() * 80}px`,
                            '--final-x': `${-100 - Math.random() * 450}px`,
                            '--final-y': `${120 + Math.random() * 250}px`,
                            '--rot-start': `${Math.random() * 360}deg`,
                            '--rot-end': `${360 + Math.random() * 720}deg`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative px-4 py-2.5 border-b border-gray-200">
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`relative p-1.5 rounded-lg ${isFreeDelivery
                          ? 'bg-gradient-to-br from-green-400 to-green-600'
                          : 'bg-gradient-to-br from-amber-800 to-yellow-700'
                          } shadow-lg`}>
                          <Truck size={14} className="text-white" />
                          {isFreeDelivery && (
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                              <span className="text-[7px] font-bold">✓</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 leading-tight">
                            {isFreeDelivery ? 'Free Shipping!' : 'Free Shipping Available'}
                          </p>
                          <p className="text-[10px] text-gray-500 leading-tight">
                            {isFreeDelivery ? 'You saved delivery charges' : 'On orders above ₹499'}
                          </p>
                        </div>
                      </div>

                      {!isFreeDelivery && (
                        <div className="text-right">
                          <div className="px-2.5 py-0.5 bg-gradient-to-r from-amber-800 to-yellow-800 text-white text-xs font-bold rounded-full shadow-md">
                            ₹{(499 - subtotal).toFixed(0)}
                          </div>
                          <p className="text-[9px] text-gray-500 mt-0.5">more needed</p>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 relative">
                      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`relative h-full transition-all duration-700 ease-out ${isFreeDelivery
                            ? 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-500'
                            : 'bg-gradient-to-r from-amber-700 via-yellow-800 to-brown-900'
                            }`}
                          style={{
                            width: `${Math.min((subtotal / 500) * 100, 100)}%`
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine" />
                        </div>
                      </div>

                      {/* Progress labels */}
                      <div className="flex justify-between items-center px-0.5">
                        <span className="text-[9px] text-gray-500 font-medium">
                          ₹{subtotal.toFixed(0)}
                        </span>
                        <span className="text-[9px] text-gray-600 font-bold flex items-center gap-1">
                          ₹499 {isFreeDelivery && <span className="text-green-600">✓</span>}
                        </span>
                      </div>
                    </div>

                    {/* Status Message */}
                    <div className={`flex items-center justify-center gap-1 py-1 px-2 rounded-lg relative ${isFreeDelivery
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
                      }`}>
                      <span className="text-sm relative z-10">
                        {isFreeDelivery ? '🏆' : '📦'}
                      </span>
                      <p className={`text-[10px] font-semibold relative z-10 ${isFreeDelivery ? 'text-green-700' : 'text-[#7d4b0e]'
                        }`}>
                        {isFreeDelivery ? (
                          <span className="animate-pulse">🎉 Free delivery unlocked! 🎉</span>
                        ) : (
                          <>Add <span className="font-bold text-[#7d4b0e]">₹{(499 - subtotal).toFixed(0)}</span> more for free delivery!</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add animations */}
              <style jsx>{`
                @keyframes shine {
                  0% {
                    transform: translateX(-100%) skewX(-15deg);
                  }
                  100% {
                    transform: translateX(200%) skewX(-15deg);
                  }
                }
                .animate-shine {
                  animation: shine 3s infinite;
                }
                
                @keyframes confetti-left-diagonal {
                  0% {
                    transform: translate(0, 0) rotate(var(--rot-start)) scale(0);
                    opacity: 0;
                  }
                  8% {
                    opacity: 1;
                    transform: translate(20px, -20px) rotate(var(--rot-start)) scale(1);
                  }
                  30% {
                    transform: translate(var(--shoot-x), var(--shoot-y)) rotate(calc(var(--rot-start) + 180deg)) scale(1);
                    opacity: 1;
                  }
                  100% {
                    transform: translate(var(--final-x), var(--final-y)) rotate(var(--rot-end)) scale(0.85);
                    opacity: 0;
                  }
                }
                
                @keyframes confetti-right-diagonal {
                  0% {
                    transform: translate(0, 0) rotate(var(--rot-start)) scale(0);
                    opacity: 0;
                  }
                  8% {
                    opacity: 1;
                    transform: translate(-20px, -20px) rotate(var(--rot-start)) scale(1);
                  }
                  30% {
                    transform: translate(var(--shoot-x), var(--shoot-y)) rotate(calc(var(--rot-start) + 180deg)) scale(1);
                    opacity: 1;
                  }
                  100% {
                    transform: translate(var(--final-x), var(--final-y)) rotate(var(--rot-end)) scale(0.85);
                    opacity: 0;
                  }
                }
                
                @keyframes confetti-left-wide {
                  0% {
                    transform: translate(0, 0) rotate(var(--rot-start)) scale(0);
                    opacity: 0;
                  }
                  10% {
                    opacity: 1;
                    transform: translate(15px, -15px) rotate(var(--rot-start)) scale(1);
                  }
                  35% {
                    transform: translate(var(--shoot-x), var(--shoot-y)) rotate(calc(var(--rot-start) + 120deg)) scale(1);
                    opacity: 1;
                  }
                  100% {
                    transform: translate(var(--final-x), var(--final-y)) rotate(var(--rot-end)) scale(0.8);
                    opacity: 0;
                  }
                }
                
                @keyframes confetti-right-wide {
                  0% {
                    transform: translate(0, 0) rotate(var(--rot-start)) scale(0);
                    opacity: 0;
                  }
                  10% {
                    opacity: 1;
                    transform: translate(-15px, -15px) rotate(var(--rot-start)) scale(1);
                  }
                  35% {
                    transform: translate(var(--shoot-x), var(--shoot-y)) rotate(calc(var(--rot-start) + 120deg)) scale(1);
                    opacity: 1;
                  }
                  100% {
                    transform: translate(var(--final-x), var(--final-y)) rotate(var(--rot-end)) scale(0.8);
                    opacity: 0;
                  }
                }
                
                .confetti-left-diagonal {
                  animation: confetti-left-diagonal 4.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
                
                .confetti-right-diagonal {
                  animation: confetti-right-diagonal 4.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
                
                .confetti-left-wide {
                  animation: confetti-left-wide 4.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
                
                .confetti-right-wide {
                  animation: confetti-right-wide 4.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
              `}</style>

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
                      <img
                        src={image}
                        alt={product.title}
                        className="w-full sm:w-24 sm:h-24 md:w-28 md:h-28 h-40 rounded-lg object-cover shadow-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-1 truncate">
                            {product.title}
                          </h4>
                          <p className="text-sm text-gray-500 mb-3 truncate">
                            {node.merchandise.title}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => handleUpdateQuantity(node.id, node.quantity - 1)}
                              disabled={node.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-10 text-center font-semibold">
                              {node.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(node.id, node.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <span className="font-bold text-[#8b4513] text-base sm:text-lg">
                            ₹{(Number(node.merchandise.price.amount) * node.quantity).toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(node.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2 transition-colors self-end sm:self-start flex-shrink-0 cursor-pointer"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Cart Summary */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 sm:p-5 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                  <span className="text-gray-700 font-medium text-sm sm:text-base">
                    Subtotal
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    ₹{subtotal.toFixed(0)}
                  </span>
                </div>
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:shadow-xl transition-all active:scale-[0.98] hover:scale-[1.02] cursor-pointer"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}

          {/* ✅ LOGIN STEP 1: Enter Phone Number */}
          {checkoutStep === 1 && (
            <div className="p-6 md:p-8">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Smartphone size={24} className="text-[#7d4b0e]" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Mobile Number</h4>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    placeholder="Enter your 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-lg focus:border-[#7d4b0e] focus:outline-none transition-colors"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    We'll send a secure OTP to verify your number
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleBackToCart}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Back to Cart
                  </button>
                  <button
                    onClick={handleSendLoginOtp}
                    disabled={loading || phone.length !== 10}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ LOGIN STEP 2: Enter OTP */}
          {checkoutStep === 2 && (
            <div className="p-6 md:p-8">
              <div className="max-w-md mx-auto">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-center text-gray-700 text-sm">
                    OTP sent from <strong>+91 8128109049</strong> to
                  </p>
                  <p className="text-center text-[#7d4b0e] font-bold text-lg">
                    {phone}
                  </p>
                </div>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <ShieldCheck size={24} className="text-[#7d4b0e]" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Enter OTP</h4>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-center text-2xl tracking-widest font-bold focus:border-[#7d4b0e] focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setCheckoutStep(1);
                      setOtp("");
                    }}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerifyLoginOtp}
                    disabled={loading || otp.length !== 6}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? "Verifying..." : "Verify & Continue"}
                  </button>
                </div>
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={handleSendLoginOtp}
                    disabled={loading}
                    className="text-sm text-gray-600 hover:text-[#7d4b0e] font-medium cursor-pointer disabled:opacity-50"
                  >
                    Didn't receive OTP? Resend
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

                    {isCalculating && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm">
                        <p className="text-amber-800 font-medium flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Calculating shipping automatically...
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
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailTouched(true);
                            setCalculationData(null);
                          }}
                          onBlur={() => setEmailTouched(true)}
                          className={`w-full px-4 py-3 rounded-lg focus:outline-none transition-colors ${emailError && emailTouched
                            ? "border-2 border-red-500 bg-white focus:border-red-500"
                            : "border-2 border-gray-200 focus:border-[#7d4b0e]"
                            }`}
                          placeholder="your.email@example.com"
                        />
                        {emailError && emailTouched && (
                          <p className="mt-1 text-sm text-red-600">
                            {emailError}
                          </p>
                        )}
                      </div>
                    </div>
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

                    {!isCalculating && !calculationData && !calculationError && (
                      <div className="text-base text-gray-600 italic">
                        Fill in all fields to see shipping cost
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

                    <div className="space-y-4">
                      {[
                        {
                          value: 'cod',
                          label: 'Partial Cash on Delivery (COD)',
                          description: 'Pay booking amount via UPI to confirm your order, rest at delivery.',
                          icon: Truck,
                          color: '#16a34a',
                        },
                      ].map((option) => {
                        const Icon = option.icon;
                        const isSelected = paymentMethod === option.value;

                        return (
                          <div key={option.value} className="space-y-3">
                            <label
                              className={`relative flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 
                                ${isSelected
                                  ? 'border-[#7d4b0e] bg-amber-50 shadow-md ring-2 ring-[#7d4b0e]/20'
                                  : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                            >
                              <input
                                type="radio"
                                name="payment"
                                value={option.value}
                                checked={isSelected}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-5 h-5 text-[#7d4b0e] border-gray-300 focus:ring-[#7d4b0e] cursor-pointer accent-[#7d4b0e]"
                              />

                              <div className="flex items-center gap-4 flex-1">
                                <div className={`p-3 rounded-lg ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                                  <Icon size={24} style={{ color: option.color }} />
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900 text-lg">
                                      {option.label}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {option.description}
                                  </p>
                                </div>
                              </div>

                              {isSelected && (
                                <div className="absolute top-2 right-2">
                                  <CheckCircle size={20} className="text-[#7d4b0e]" />
                                </div>
                              )}
                            </label>

                            {/* Show QR Code for Partial COD */}
                            {isSelected && (
                              <div className="mt-4 p-6 bg-gradient-to-br from-white to-amber-50 border-2 border-amber-200 rounded-2xl shadow-inner animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                  {/* QR Code */}
                                  <div className="relative group">
                                    <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-[#7d4b0e] rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                                    <div className="relative bg-white p-3 rounded-xl shadow-lg">
                                      <img
                                        src="/QRCODE.jpg"
                                        alt="UPI QR Code"
                                        className="w-40 h-40 object-contain"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-[1px] rounded-xl">
                                        <span className="bg-[#7d4b0e] text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-lg">SCAN TO PAY</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex-1 space-y-4 text-center md:text-left">
                                    <div>
                                      <p className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-1">UPI ID</p>
                                      <div className="flex items-center justify-center md:justify-start gap-3">
                                        <code className="bg-amber-100/50 text-[#7d4b0e] font-mono font-bold px-4 py-2 rounded-lg border border-amber-200 text-lg">
                                          8128109049@okicici
                                        </code>
                                        <button
                                          onClick={() => {
                                            if (typeof navigator !== "undefined" && navigator.clipboard) {
                                              navigator.clipboard.writeText("8128109049@okicici");
                                              alert("UPI ID copied to clipboard!");
                                            }
                                          }}
                                          className="p-2 hover:bg-amber-100 rounded-lg transition-colors text-amber-800 cursor-pointer"
                                          title="Copy UPI ID"
                                        >
                                          <RefreshCw size={18} />
                                        </button>
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <p className="text-sm text-amber-800 flex items-center justify-center md:justify-start gap-2">
                                        <CheckCircle size={16} className="text-green-600" />
                                        Scan with any UPI app (GPay, PhonePe, Paytm)
                                      </p>
                                      <p className="text-sm text-gray-500 italic">
                                        Please pay the booking amount to confirm your order. Rest can be paid at delivery.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleBackToCart}
                      className="flex-1 px-8 py-4 border-2 border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors text-lg cursor-pointer"
                    >
                      Back to Cart
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={!calculationData || isPlacingOrder}
                      className="flex-1 px-8 py-4 bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white rounded-lg font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isPlacingOrder ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                          </svg>
                          Placing Order…
                        </>
                      ) : (
                        "Place Order"
                      )}
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