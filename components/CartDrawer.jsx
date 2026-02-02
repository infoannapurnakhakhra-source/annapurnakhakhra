"use client";

import { useState, useEffect } from "react";
import YouMayAlsoLike from "./Suggestedproductssection";
import {
  X,
  Trash2,
  Plus,
  Minus,
  MapPin,
  CreditCard,
  Truck,
  Wallet,
  CheckCircle,
  Mail,
  ShieldCheck,
  Loader2,
  RefreshCw,
  ShoppingCart,
  Calculator,
  Smartphone,
} from "lucide-react";
import safeStorage from "@/lib/safeStorage"; // Safe storage import
import { useRouter } from "next/navigation";

export default function CartDrawer({
  cart: initialCart,
  isOpen,
  setIsOpen,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) {
  // Cart state
  const router = useRouter();

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
  // Modal States - UPDATED: Added phone and login_phone/login_otp steps
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
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  // Email validation
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const ALLOWED_DOMAINS = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "proton.me",
  ];

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
    if (email && !validatePublicEmail(email)) {
      setEmailError("Use Gmail, Yahoo, Outlook, iCloud or Proton email only");
    } else {
      setEmailError("");
    }
  }, [email]);

  const handlePlaceOrder = async () => {
    if (!calculationData || isPlacingOrder) return;

    // 🔥 Manual Customer Creation call right after button press
    try {
      console.log("👤 Attempting manual customer creation/sync...");
      const customerRes = await fetch("/api/customers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: address.firstName,
          lastName: address.lastName,
          email: email,
          phone: address.phone,
        }),
      });
      const customerData = await customerRes.json();
      if (!customerData.success) {
        console.warn("⚠️ Customer creation returned error:", customerData.message);
      } else {
        console.log("✅ Customer creation/sync successful:", customerData.message);
      }
    } catch (e) {
      console.warn("⚠️ Manual customer creation background call failed:", e);
    }

    if (paymentMethod === "cod") {
      try {
        setIsPlacingOrder(true);
        await placeOrder();
      } catch (err) {
        console.error(err);
      } finally {
        setIsPlacingOrder(false);
      }
    } else {
      await initiateOnlinePayment();
    }
  };
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  const initiateOnlinePayment = async () => {
    try {
      setIsPlacingOrder(true);

      const res = await fetch("/api/orders/online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerShopifyId,
          ...(email && validateEmail(email) ? { email } : {}),
          shippingAddress: {
            ...address,
            provinceCode: address.provinceCode || address.province,
          },
          lineItems: cart.lines.edges.map((line) => ({
            variant_id: line.node.merchandise.id.split("/").pop(),
            quantity: line.node.quantity,
          })),
          totalAmount,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error("Init failed");

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Razorpay SDK failed");

      openRazorpay(data);
    } catch (err) {
      console.error(err);
      alert("Unable to start payment");
    } finally {
      setIsPlacingOrder(false);
    }
  };
  const openRazorpay = (data) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order_id: data.razorpayOrderId,
      amount: data.amount,
      currency: data.currency,
      name: "Annapurna Khakhra",
      description: "Online Order Payment",

      handler: async (response) => {
        await verifyPayment(response);
      },

      modal: {
        ondismiss: () => {
          alert("Payment cancelled");
        },
      },

      prefill: {
        name: `${address.firstName} ${address.lastName}`,
        email: email || "guest@example.com",
        contact: address.phone,
      },

      theme: { color: "#8f4a12" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const verifyPayment = async (response) => {
    const res = await fetch("/api/payment/razorpay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    });
    console.log("Verifying payment with response:", res);
    const data = await res.json();

    if (data.success) {
      // same cart cleanup as COD
      await fetch("/api/cart/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerShopifyId }),
      });

      safeStorage.removeItem("cartId");
      safeStorage.removeItem("guestCartId");

      setCart(null);
      window.dispatchEvent(new Event("cart-updated"));
      window.location.replace(`/thank-you?token=${data.token}`);
    } else {
      alert("Payment verification failed");
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

  const customerShopifyId = safeStorage.getItem("customerShopifyId");

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
      const newCustomerId = safeStorage.getItem("customerShopifyId");
      if (newCustomerId) {
        setIsLoggedIn(true);
        loadCartAfterLogin();
      }
    };

    window.addEventListener("customer-updated", handleCustomerUpdate);
    return () =>
      window.removeEventListener("customer-updated", handleCustomerUpdate);
  }, []);

  // ✅ Function to reload cart after login
  const loadCartAfterLogin = async () => {
    const customerId = safeStorage.getItem("customerShopifyId");
    if (!customerId) return;

    try {
      setLoading(true);
      const res = await fetch("/api/cart/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerShopifyId: customerId,
          cartId: safeStorage.getItem("cartId") || null,
        }),
      });

      const data = await res.json();
      if (data?.cart) {
        setCart(data.cart);
        if (data.cart.id) {
          safeStorage.setItem("cartId", data.cart.id);
        }
      }

      await fetchUserProfile();
    } catch (err) {
      console.error("Failed to reload cart after login:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle animation when drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
      window.dispatchEvent(new Event("open-cart-drawer"));
    } else {
      setIsAnimating(false);
      setTimeout(() => setShouldRender(false), 300);
      window.dispatchEvent(new Event("close-cart-drawer"));
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
      addresses = userData.addresses.nodes.map((node) => ({ node }));
      console.log("✅ Found addresses in userData.addresses.nodes");
    } else if (Array.isArray(userData.addresses)) {
      addresses = userData.addresses.map((addr) => ({ node: addr }));
      console.log("✅ Found addresses as direct array");
    } else if (userData.defaultAddress) {
      addresses = [{ node: userData.defaultAddress }];
      console.log("✅ Found single defaultAddress");
    }
    console.log("📍 Total addresses found:", addresses.length);
    if (addresses.length === 0) {
      console.log(
        "⚠️ NO ADDRESSES FOUND - User may not have saved any addresses",
      );
      return;
    }
    let selectedAddr = null;
    selectedAddr = addresses.find((edge) => {
      const node = edge.node || edge;
      return node?.defaultAddress === true;
    });
    if (selectedAddr) {
      selectedAddr = selectedAddr.node || selectedAddr;
      console.log("✅ Strategy 1 Success: Found via defaultAddress flag");
    }
    if (!selectedAddr) {
      selectedAddr = addresses.find((edge) => {
        const node = edge.node || edge;
        return node?.isDefault === true;
      });
      if (selectedAddr) {
        selectedAddr = selectedAddr.node || selectedAddr;
        console.log("✅ Strategy 2 Success: Found via isDefault flag");
      }
    }
    if (!selectedAddr) {
      selectedAddr = addresses.find((edge) => {
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
    console.log(
      "📋 Selected address object:",
      JSON.stringify(selectedAddr, null, 2),
    );
    const newAddress = {
      firstName:
        selectedAddr.firstName ||
        selectedAddr.firstname ||
        selectedAddr.first_name ||
        "",
      lastName:
        selectedAddr.lastName ||
        selectedAddr.lastname ||
        selectedAddr.last_name ||
        "",
      address1:
        selectedAddr.address1 ||
        selectedAddr.address ||
        selectedAddr.street ||
        "",
      city: selectedAddr.city || "",
      province:
        selectedAddr.province ||
        selectedAddr.provinceCode ||
        selectedAddr.state ||
        selectedAddr.stateCode ||
        "",
      provinceCode:
        selectedAddr.provinceCode ||
        selectedAddr.province ||
        selectedAddr.stateCode ||
        "",
      country:
        selectedAddr.country ||
        selectedAddr.countryCode ||
        selectedAddr.countryCodeV2 ||
        "India",
      zip:
        selectedAddr.zip ||
        selectedAddr.zipCode ||
        selectedAddr.postalCode ||
        selectedAddr.postal_code ||
        "",
      phone:
        selectedAddr.phone ||
        selectedAddr.phoneNumber ||
        selectedAddr.phone_number ||
        "",
    };
    console.log(
      "🎯 Created new address object:",
      JSON.stringify(newAddress, null, 2),
    );
    setAddress(newAddress);
    setAddressFetched(true);
    console.log("✅ ADDRESS POPULATION COMPLETE");
    console.log("=".repeat(50));
  };

  // ✅ EXTRACT fetchUserProfile as a standalone function
  const fetchUserProfile = async () => {
    const customerId =
      customerShopifyId || safeStorage.getItem("customerShopifyId");
    if (!customerId) {
      console.log("❌ No customerShopifyId in localStorage");
      setIsLoggedIn(false);
      return;
    }
    console.log(
      "🚀 CART DRAWER - Fetching profile for customerShopifyId:",
      customerId,
    );
    setAddressLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
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
        setEmail(
          validatePublicEmail(data.customer.email) ? data.customer.email : "",
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
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen, customerShopifyId]);

  // Re-populate when checkout step reaches 3
  useEffect(() => {
    if (checkoutStep === 3 && isLoggedIn && user) {
      console.log(
        "🔄 CART DRAWER - Checkout step 3 reached - Re-populating address",
      );
      populateAddressFromUser(user);
    }
  }, [checkoutStep, isLoggedIn, user]);

  // Load cart when drawer opens
  useEffect(() => {
    async function loadCart() {
      if (!isOpen) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const body = {
          customerShopifyId: customerShopifyId || null,
          cartId:
            safeStorage.getItem("cartId") ||
            safeStorage.getItem("guestCartId") ||
            null,
        };

        const res = await fetch("/api/cart/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (data?.cart?.id) {
          if (customerShopifyId) {
            safeStorage.setItem("cartId", data.cart.id);
          } else {
            safeStorage.setItem("guestCartId", data.cart.id);
            safeStorage.setItem("cartId", data.cart.id);
          }
        }

        if (data?.expired && !customerShopifyId) {
          window.dispatchEvent(
            new CustomEvent("guest-cart-expired", {
              detail: { cartId: data.cart?.id },
            }),
          );
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

  const currentCartItems =
    cart?.lines?.edges?.map(({ node }) => ({
      shopifyProductId: node.merchandise.id.split("/").pop(),
    })) || [];

  // Calculate shipping and tax
  const calculateShippingAndTax = async () => {
    if (
      !address.firstName ||
      !address.lastName ||
      !address.address1 ||
      !address.city ||
      !address.province ||
      !address.zip
    ) {
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
          email: email && validateEmail(email) ? email : null,
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
        const sessionId = safeStorage.getItem("abandoned_checkout_session_id");
        if (sessionId) {
          const shopurl =
            process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
            "your-store.myshopify.com";

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
                subtotal +
                parseFloat(processedData.shipping?.price?.amount || 0),
              ),
            },
            meta: {
              url: window.location.href,
              timestamp: new Date().toISOString(),
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
        }
        setCalculationError(null);
      } else {
        setCalculationError(
          data.error || "Failed to calculate shipping and tax",
        );
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
      address.phone?.trim();

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
    calculationData,
    isCalculating,
  ]);

  // INITIATE CHECKOUT TRACKING (New)
  // Facebook & Google Analytics: InitiateCheckout tracking
  useEffect(() => {
    if (checkoutStep === 3 && cart) {
      const estimatedValue =
        cart.lines?.edges?.reduce(
          (acc, { node }) =>
            acc + parseFloat(node.merchandise.price.amount) * node.quantity,
          0,
        ) || 0;

      // Facebook Pixel
      if (typeof window.fbq !== "undefined") {
        window.fbq("track", "InitiateCheckout", {
          currency: "INR",
          value: estimatedValue,
          content_ids: cart.lines?.edges?.map(({ node }) =>
            node.merchandise.id.split("/").pop(),
          ),
          num_items: cart.lines?.edges?.reduce(
            (acc, { node }) => acc + node.quantity,
            0,
          ),
        });
      }

      // Google Analytics (gtag)
      if (typeof window.gtag !== "undefined") {
        window.gtag("event", "begin_checkout", {
          currency: "INR",
          value: estimatedValue,
          items: cart.lines?.edges?.map(({ node }) => ({
            item_id: node.merchandise.id.split("/").pop(),
            item_name: node.merchandise.product?.title,
            price: parseFloat(node.merchandise.price.amount),
            quantity: node.quantity,
          })),
        });
      }
    }
  }, [checkoutStep, cart]);

  // 🔥 NEW: Partial checkout progress tracking (Products + Address + Tax/Shipping)
  // 🔥 FINAL: Track partial checkout progress — Products + Address + Pricing (Tax & Shipping)
  useEffect(() => {
    if (checkoutStep !== 3 || !cart) return;

    const hasAnyData =
      address.firstName?.trim() ||
      address.lastName?.trim() ||
      address.address1?.trim() ||
      address.city?.trim() ||
      address.province?.trim() ||
      address.zip?.trim() ||
      address.phone?.trim() ||
      email?.trim();

    if (!hasAnyData) return;

    const sessionId = safeStorage.getItem("abandoned_checkout_session_id");
    if (!sessionId) return;

    const shopurl =
      process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
      "hit-megascale.myshopify.com";

    const cartSnapshot = {
      id: cart?.id || null,
      checkoutUrl: cart?.checkoutUrl || null,
      totalQuantity: cart?.totalQuantity || cart?.lines?.edges?.length || 0,
      subtotal: subtotal || 0,
      currency: "INR",
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
          sku: node.merchandise.sku || null,
        })) || [],
    };

    const partialAddress = {
      firstName: address.firstName?.trim() || null,
      lastName: address.lastName?.trim() || null,
      address1: address.address1?.trim() || null,
      city: address.city?.trim() || null,
      province: address.province?.trim() || null,
      provinceCode: address.provinceCode || address.province || null,
      country: address.country || "India",
      zip: address.zip?.trim() || null,
      phone: address.phone?.trim() || null,
    };

    const pricingInfo = calculationData
      ? {
        subtotal: subtotal || 0,
        shipping: {
          title: calculationData.shipping?.title || "Standard Shipping",
          price: isFreeDelivery
            ? 0
            : parseFloat(calculationData.shipping?.price?.amount || 0),
        },
        tax: {
          amount: parseFloat(calculationData.tax?.shopMoney?.amount || 0),
          currency: "INR",
        },
        total:
          subtotal +
          (isFreeDelivery
            ? 0
            : parseFloat(calculationData.shipping?.price?.amount || 0)) +
          parseFloat(calculationData.tax?.shopMoney?.amount || 0),
      }
      : null;

    const trackingPayload = {
      shopurl,
      sessionId,
      event: "checkout_progress",
      customer: isLoggedIn
        ? {
          email: email || user?.email || null,
          firstName: address.firstName || null,
          lastName: address.lastName || null,
          phone: address.phone || null,
        }
        : null,
      cart: cartSnapshot,
      address: partialAddress,
      pricing: pricingInfo,
      meta: {
        url: window.location.href,
        timestamp: new Date().toISOString(),
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
    cart,
    isLoggedIn,
    user,
    calculationData,
    // subtotal removed → no more TDZ error!
  ]);

  if (!shouldRender) return null;

  const subtotal =
    cart?.lines?.edges?.reduce(
      (sum, { node }) =>
        sum + Number(node.merchandise.price.amount) * node.quantity,
      0,
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
  const multipliedTaxPercent = Number(includedTaxPercent * 2);
  const basetaxAmount = Number((subtotal * multipliedTaxPercent) / 100);
  const baseSubtotal = Number(subtotal - basetaxAmount);

  const taxAmount = Number(
    ((baseSubtotal * multipliedTaxPercent) / 100).toFixed(2),
  );

  const shippingAmount = calculationData?.shipping?.price?.amount
    ? Number(calculationData.shipping.price.amount)
    : 0;

  const totalAmount = Number((subtotal + shippingAmount).toFixed(2));

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
      const guestCartId = safeStorage.getItem("guestCartId");

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
        safeStorage.setItem("customerShopifyId", shopifyId);

        const merge = data.user?.merge;
        const finalCartId =
          data.cartId || (merge?.merged ? merge.mergedCartId : guestCartId);

        if (finalCartId) {
          safeStorage.setItem("cartId", finalCartId);
        }

        try {
          const resCart = await fetch("/api/cart/get", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerShopifyId: shopifyId,
              cartId: safeStorage.getItem("cartId") || null,
            }),
          });
          const cartData = await resCart.json();
          if (cartData?.cart?.id) {
            safeStorage.setItem("cartId", cartData.cart.id);
            setCart(cartData.cart);
          }
        } catch (e) {
          console.error("Error fetching cart:", e);
        }

        if (merge?.merged) {
          safeStorage.removeItem("guestCartId");
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

  // Internal update quantity handler
  const handleUpdateQuantity = async (lineId, quantity) => {
    try {
      const cartId = cart?.id || safeStorage.getItem("cartId");
      if (!cartId) return alert("Cart ID missing");
      const res = await fetch("/api/cart/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId, lineId, quantity }),
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.cart);
        safeStorage.setItem("cartId", data.cart.id);
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
      const cartId =
        cart?.id ||
        safeStorage.getItem("cartId") ||
        safeStorage.getItem("guestCartId");
      if (!cartId) {
        return alert("Cart ID missing");
      }
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
          safeStorage.setItem("cartId", data.cart.id);
          if (!customerShopifyId) {
            safeStorage.setItem("guestCartId", data.cart.id);
          }
        }

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
    if (
      !address.firstName ||
      !address.lastName ||
      !address.address1 ||
      !address.city ||
      !address.province ||
      !address.zip ||
      !address.phone
    ) {
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
            ...(email && validateEmail(email) ? { email } : {}),
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
            data?.order?.data?.draftOrderComplete?.draftOrder?.order?.name?.replace(
              "#",
              "",
            );

          await fetch("/api/cart/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerShopifyId }),
          });

          try {
            safeStorage.removeItem("cartId");
            safeStorage.removeItem("guestCartId");
          } catch (e) {
            // ignore
          }

          setCart(null);
          window.dispatchEvent(new Event("cart-updated"));

          safeStorage.setItem("recentOrderId", orderId);
          setIsOpen(false);
          setCheckoutStep(0);
          setAddress(defaultAddress);
          setAddressFetched(false);
          console.log(data);
          window.location.replace(`${data.redirectUrl}`);

          return;
        }

        alert("Order failed. Try again.");
        return;
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
    setPhone("");
    setOtp("");
    setOrderPlaced(false);
    setCalculationData(null);
    setCalculationError(null);
    setAddress(defaultAddress);
    setAddressFetched(false);
  };

  // ✅ UPDATED: handleProceedToCheckout
  const handleProceedToCheckout = () => {
    // 🔥 Generate session ID for tracking
    const sessionId = `chk_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    if (typeof window !== "undefined") {
      safeStorage.setItem("abandoned_checkout_session_id", sessionId);
    }

    // TRACKING CODE START
    if (typeof window.fbq !== "undefined") {
      window.fbq("track", "InitiateCheckout", {
        value: subtotal || 0,
        currency: "INR",
        num_items: cart?.lines?.edges?.length || 0,
      });
    }
    if (typeof window.gtag !== "undefined") {
      window.gtag("event", "begin_checkout", {
        value: subtotal || 0,
        currency: "INR",
        items: cart?.lines?.edges?.map((edge) => ({
          item_id: edge.node.merchandise.id,
          item_name: edge.node.merchandise.product.title,
          price: edge.node.merchandise.price.amount,
          quantity: edge.node.quantity,
        })),
      });
    }
    // TRACKING CODE END

    const shopurl =
      process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
      "hit-megascale.myshopify.com";

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
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        referrer: typeof document !== "undefined" ? document.referrer : "",
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
    Online: CreditCard,
    upi: Wallet,
  };
  const PaymentIcon = paymentIcons[paymentMethod];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ${isAnimating ? "opacity-50" : "opacity-0"
          }`}
        style={{ backdropFilter: isAnimating ? "blur(4px)" : "none" }}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full shadow-2xl z-[999] transition-transform duration-300 ease-out ${isAnimating ? "translate-x-0" : "translate-x-full"
          }`}
        onClick={handleClose}
      >
        {/* Desktop split layout */}
        <div
          className="flex h-full max-w-[700px] ml-auto bg-white "
          onClick={(e) => e.stopPropagation()}
        >
          <div className="hidden lg:block w-[40%] border-r border-gray-200 overflow-y-auto">
            <YouMayAlsoLike currentCartItems={currentCartItems} />
          </div>
          <div className="w-full lg:w-[60%] flex flex-col bg-white ">
            {/* Header - Dynamic based on step */}
            <div className="bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white p-6 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
              <div className="relative z-10">
                <h2 className="text-xl font-bold">
                  {checkoutStep === 0 && "Your Cart"}
                  {checkoutStep === 1 && "Login to Continue"}
                  {checkoutStep === 2 && "Enter OTP"}
                  {checkoutStep === 3 && "Checkout"}
                </h2>
                <p className="text-sm text-white/90 mt-1">
                  {checkoutStep === 0 &&
                    `${cart?.lines?.edges?.length || 0} items`}
                  {checkoutStep === 1 && "Enter your mobile number"}
                  {checkoutStep === 2 && "We've sent a code to your WhatsApp"}
                  {checkoutStep === 3 &&
                    (isLoggedIn
                      ? "Review and confirm your order"
                      : "Complete your order details")}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="relative z-10 bg-white/20 hover:bg-white/30 transition-colors rounded-full p-2 cursor-pointer"
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
                    <p className="text-[#7d4b0e] font-semibold">
                      Loading your cart...
                    </p>
                  </div>
                ) : !cart || !cart.lines || cart.lines.edges.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                      <ShoppingCart size={40} className="text-[#8b4513]" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium">
                      Your cart is empty
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Add some delicious khakhra!
                    </p>
                    <a
                      href="/collection"
                      className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#7d4b0e] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-yellow-600"
                    >
                      Start Shopping
                    </a>
                  </div>
                ) : (
                  <>
                    <div className="relative overflow-hidden">
                      <div
                        className={`absolute inset-0 ${isFreeDelivery
                            ? "bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10"
                            : "bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5"
                          }`}
                      />

                      {isFreeDelivery && (
                        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                          <div className="absolute bottom-0 left-0">
                            {[...Array(40)].map((_, i) => (
                              <div
                                key={`left-${i}`}
                                className="absolute bottom-0 left-0 w-2.5 h-4 rounded-sm confetti-left-diagonal"
                                style={{
                                  backgroundColor: [
                                    "#ef4444",
                                    "#f59e0b",
                                    "#10b981",
                                    "#3b82f6",
                                    "#8b5cf6",
                                    "#ec4899",
                                    "#fbbf24",
                                    "#34d399",
                                    "#fb923c",
                                    "#a78bfa",
                                  ][i % 10],
                                  animationDelay: `${Math.random() * 0.6}s`,
                                  "--shoot-x": `${100 + Math.random() * 400}px`,
                                  "--shoot-y": `${-80 - Math.random() * 120}px`,
                                  "--final-x": `${150 + Math.random() * 600}px`,
                                  "--final-y": `${100 + Math.random() * 300}px`,
                                  "--rot-start": `${Math.random() * 360}deg`,
                                  "--rot-end": `${360 + Math.random() * 1080
                                    }deg`,
                                }}
                              />
                            ))}
                          </div>

                          <div className="absolute bottom-0 right-0">
                            {[...Array(40)].map((_, i) => (
                              <div
                                key={`right-${i}`}
                                className="absolute bottom-0 right-0 w-2.5 h-4 rounded-sm confetti-right-diagonal"
                                style={{
                                  backgroundColor: [
                                    "#ef4444",
                                    "#f59e0b",
                                    "#10b981",
                                    "#3b82f6",
                                    "#8b5cf6",
                                    "#ec4899",
                                    "#fbbf24",
                                    "#34d399",
                                    "#fb923c",
                                    "#a78bfa",
                                  ][i % 10],
                                  animationDelay: `${Math.random() * 0.6}s`,
                                  "--shoot-x": `${-100 - Math.random() * 400
                                    }px`,
                                  "--shoot-y": `${-80 - Math.random() * 120}px`,
                                  "--final-x": `${-150 - Math.random() * 600
                                    }px`,
                                  "--final-y": `${100 + Math.random() * 300}px`,
                                  "--rot-start": `${Math.random() * 360}deg`,
                                  "--rot-end": `${360 + Math.random() * 1080
                                    }deg`,
                                }}
                              />
                            ))}
                          </div>

                          <div className="absolute bottom-0 left-[10%]">
                            {[...Array(25)].map((_, i) => (
                              <div
                                key={`left-extra-${i}`}
                                className="absolute bottom-0 left-0 w-2 h-3 rounded-sm confetti-left-wide"
                                style={{
                                  backgroundColor: [
                                    "#fbbf24",
                                    "#34d399",
                                    "#60a5fa",
                                    "#f472b6",
                                    "#fb923c",
                                  ][i % 5],
                                  animationDelay: `${0.2 + Math.random() * 0.5
                                    }s`,
                                  "--shoot-x": `${50 + Math.random() * 250}px`,
                                  "--shoot-y": `${-60 - Math.random() * 80}px`,
                                  "--final-x": `${100 + Math.random() * 450}px`,
                                  "--final-y": `${120 + Math.random() * 250}px`,
                                  "--rot-start": `${Math.random() * 360}deg`,
                                  "--rot-end": `${360 + Math.random() * 720
                                    }deg`,
                                }}
                              />
                            ))}
                          </div>

                          <div className="absolute bottom-0 right-[10%]">
                            {[...Array(25)].map((_, i) => (
                              <div
                                key={`right-extra-${i}`}
                                className="absolute bottom-0 right-0 w-2 h-3 rounded-sm confetti-right-wide"
                                style={{
                                  backgroundColor: [
                                    "#fbbf24",
                                    "#34d399",
                                    "#60a5fa",
                                    "#f472b6",
                                    "#fb923c",
                                  ][i % 5],
                                  animationDelay: `${0.2 + Math.random() * 0.5
                                    }s`,
                                  "--shoot-x": `${-50 - Math.random() * 250}px`,
                                  "--shoot-y": `${-60 - Math.random() * 80}px`,
                                  "--final-x": `${-100 - Math.random() * 450
                                    }px`,
                                  "--final-y": `${120 + Math.random() * 250}px`,
                                  "--rot-start": `${Math.random() * 360}deg`,
                                  "--rot-end": `${360 + Math.random() * 720
                                    }deg`,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="relative px-4 py-2.5 border-b border-gray-200">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`relative p-1.5 rounded-lg ${isFreeDelivery
                                    ? "bg-gradient-to-br from-green-400 to-green-600"
                                    : "bg-gradient-to-br from-amber-800 to-yellow-700"
                                  } shadow-lg`}
                              >
                                <Truck size={14} className="text-white" />
                                {isFreeDelivery && (
                                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <span className="text-[7px] font-bold">
                                      ✓
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-800 leading-tight">
                                  {isFreeDelivery
                                    ? "Free Shipping!"
                                    : "Free Shipping Available"}
                                </p>
                                <p className="text-[10px] text-gray-500 leading-tight">
                                  {isFreeDelivery
                                    ? "You saved delivery charges"
                                    : "On orders above ₹499"}
                                </p>
                              </div>
                            </div>

                            {!isFreeDelivery && (
                              <div className="text-right">
                                <div className="px-2.5 py-0.5 bg-gradient-to-r from-amber-800 to-yellow-800 text-white text-xs font-bold rounded-full shadow-md">
                                  ₹{(499 - subtotal).toFixed(0)}
                                </div>
                                <p className="text-[9px] text-gray-500 mt-0.5">
                                  more needed
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 relative">
                            <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                              <div
                                className={`relative h-full transition-all duration-700 ease-out ${isFreeDelivery
                                    ? "bg-gradient-to-r from-green-400 via-green-500 to-emerald-500"
                                    : "bg-gradient-to-r from-amber-700 via-yellow-800 to-brown-900"
                                  }`}
                                style={{
                                  width: `${Math.min(
                                    (subtotal / 500) * 100,
                                    100,
                                  )}%`,
                                }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine" />
                              </div>
                            </div>

                            <div className="flex justify-between items-center px-0.5">
                              <span className="text-[9px] text-gray-500 font-medium">
                                ₹{subtotal.toFixed(0)}
                              </span>
                              <span className="text-[9px] text-gray-600 font-bold flex items-center gap-1">
                                ₹499{" "}
                                {isFreeDelivery && (
                                  <span className="text-green-600">✓</span>
                                )}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`flex items-center justify-center gap-1 py-1 px-2 rounded-lg relative ${isFreeDelivery
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                                : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
                              }`}
                          >
                            <span className="text-sm relative z-10">
                              {isFreeDelivery ? "🏆" : "📦"}
                            </span>
                            <p
                              className={`text-[10px] font-semibold relative z-10 ${isFreeDelivery
                                  ? "text-green-700"
                                  : "text-[#7d4b0e]"
                                }`}
                            >
                              {isFreeDelivery ? (
                                <span className="animate-pulse">
                                  🎉 Free delivery unlocked! 🎉
                                </span>
                              ) : (
                                <>
                                  Add{" "}
                                  <span className="font-bold text-[#7d4b0e]">
                                    ₹{(499 - subtotal).toFixed(0)}
                                  </span>{" "}
                                  more for free delivery!
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

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
                          transform: translate(0, 0) rotate(var(--rot-start))
                            scale(0);
                          opacity: 0;
                        }
                        8% {
                          opacity: 1;
                          transform: translate(20px, -20px)
                            rotate(var(--rot-start)) scale(1);
                        }
                        30% {
                          transform: translate(var(--shoot-x), var(--shoot-y))
                            rotate(calc(var(--rot-start) + 180deg)) scale(1);
                          opacity: 1;
                        }
                        100% {
                          transform: translate(var(--final-x), var(--final-y))
                            rotate(var(--rot-end)) scale(0.85);
                          opacity: 0;
                        }
                      }

                      @keyframes confetti-right-diagonal {
                        0% {
                          transform: translate(0, 0) rotate(var(--rot-start))
                            scale(0);
                          opacity: 0;
                        }
                        8% {
                          opacity: 1;
                          transform: translate(-20px, -20px)
                            rotate(var(--rot-start)) scale(1);
                        }
                        30% {
                          transform: translate(var(--shoot-x), var(--shoot-y))
                            rotate(calc(var(--rot-start) + 180deg)) scale(1);
                          opacity: 1;
                        }
                        100% {
                          transform: translate(var(--final-x), var(--final-y))
                            rotate(var(--rot-end)) scale(0.85);
                          opacity: 0;
                        }
                      }

                      @keyframes confetti-left-wide {
                        0% {
                          transform: translate(0, 0) rotate(var(--rot-start))
                            scale(0);
                          opacity: 0;
                        }
                        10% {
                          opacity: 1;
                          transform: translate(15px, -15px)
                            rotate(var(--rot-start)) scale(1);
                        }
                        35% {
                          transform: translate(var(--shoot-x), var(--shoot-y))
                            rotate(calc(var(--rot-start) + 120deg)) scale(1);
                          opacity: 1;
                        }
                        100% {
                          transform: translate(var(--final-x), var(--final-y))
                            rotate(var(--rot-end)) scale(0.8);
                          opacity: 0;
                        }
                      }

                      @keyframes confetti-right-wide {
                        0% {
                          transform: translate(0, 0) rotate(var(--rot-start))
                            scale(0);
                          opacity: 0;
                        }
                        10% {
                          opacity: 1;
                          transform: translate(-15px, -15px)
                            rotate(var(--rot-start)) scale(1);
                        }
                        35% {
                          transform: translate(var(--shoot-x), var(--shoot-y))
                            rotate(calc(var(--rot-start) + 120deg)) scale(1);
                          opacity: 1;
                        }
                        100% {
                          transform: translate(var(--final-x), var(--final-y))
                            rotate(var(--rot-end)) scale(0.8);
                          opacity: 0;
                        }
                      }

                      .confetti-left-diagonal {
                        animation: confetti-left-diagonal 4.5s
                          cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                      }

                      .confetti-right-diagonal {
                        animation: confetti-right-diagonal 4.5s
                          cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                      }

                      .confetti-left-wide {
                        animation: confetti-left-wide 4.2s
                          cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                      }

                      .confetti-right-wide {
                        animation: confetti-right-wide 4.2s
                          cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                      }
                    `}</style>

                    <div className="flex-1 overflow-y-auto px-4 py-2">
                      {cart?.lines?.edges?.map(({ node }) => {
                        const product = node.merchandise.product;
                        const image =
                          product.featuredImage?.url ||
                          product.images?.edges?.[0]?.node?.url;
                        return (
                          <div
                            key={node.id}
                            className="flex gap-4 py-4 border-b border-gray-200 last:border-b-0"
                          >
                            <img
                              src={image}
                              className="w-20 h-20 rounded-lg object-cover shadow-sm"
                              alt={product.title}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {product.title}
                              </h4>
                              <p className="text-sm text-gray-500 truncate">
                                {node.merchandise.title}
                              </p>
                              <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                  <button
                                    onClick={() =>
                                      handleUpdateQuantity(
                                        node.id,
                                        node.quantity - 1,
                                      )
                                    }
                                    disabled={node.quantity <= 1}
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="w-8 text-center font-medium">
                                    {node.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleUpdateQuantity(
                                        node.id,
                                        node.quantity + 1,
                                      )
                                    }
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 transition-colors cursor-pointer"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                                <span className="font-bold text-[#8b4513]">
                                  ₹
                                  {(
                                    Number(node.merchandise.price.amount) *
                                    node.quantity
                                  ).toFixed(0)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(node.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2 transition-colors self-start cursor-pointer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="lg:hidden">
                      <YouMayAlsoLike currentCartItems={currentCartItems} />
                    </div>
                    <div className="border-t border-gray-200 p-4 space-y-3 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-lg font-bold text-gray-900">
                          ₹{subtotal.toFixed(0)}
                        </span>
                      </div>
                      <button
                        onClick={handleProceedToCheckout}
                        className="w-full bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer"
                      >
                        Proceed to Checkout
                      </button>
                      <button
                        onClick={() => (window.location.href = "/cart")}
                        className="text-sm text-black hover:underline ml-2 flex items-center gap-2 cursor-pointer"
                      >
                        View Cart →
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ✅ LOGIN STEP 1: Enter Phone Number */}
            {/* {checkoutStep === 1 && (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Smartphone size={20} className="text-[#7d4b0e]" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Mobile Number
                      </h4>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[6-9][0-9]{9}"
                      maxLength={10}
                      placeholder="Enter your 10-digit mobile number"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#7d4b0e] focus:outline-none transition-colors text-lg"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      We'll send a secure OTP to verify your number
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCheckoutStep(0)}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSendLoginOtp}
                      disabled={loading || phone.length !== 10}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                </div>
              </div>
            )} */}

            {/* ✅ LOGIN STEP 2: Enter OTP */}
            {/* {checkoutStep === 2 && (
              <div className="flex-1 overflow-y-auto p-6">
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
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <ShieldCheck size={20} className="text-[#7d4b0e]" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Enter OTP
                      </h4>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6-digit OTP"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#7d4b0e] focus:outline-none transition-colors text-center text-2xl tracking-widest font-bold"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setCheckoutStep(1);
                        setOtp("");
                      }}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerifyLoginOtp}
                      disabled={loading || otp.length !== 6}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8f4a12] to-[#5a3102] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
            )} */}

            {/* CHECKOUT STEP */}
            {checkoutStep === 3 && (
              <div className="flex-1 overflow-y-auto p-6">
                {isConfirmingPayment && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4 w-[90%] max-w-sm text-center">
                      <Loader2 className="w-10 h-10 text-[#7d4b0e] animate-spin" />
                      <p className="text-sm font-medium text-gray-800">
                        Confirming your payment…
                      </p>
                      <p className="text-xs text-gray-500">
                        Please don’t refresh or close this page
                      </p>
                    </div>
                  </div>
                )}

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
                          <h4 className="text-lg font-semibold text-gray-900">
                            Delivery Address
                          </h4>
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

                      {isCalculating && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm">
                          <p className="text-amber-800 font-medium flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            Calculating shipping automatically...
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
                                setAddress({
                                  ...address,
                                  firstName: e.target.value,
                                });
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
                                setAddress({
                                  ...address,
                                  lastName: e.target.value,
                                });
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
                              setAddress({
                                ...address,
                                address1: e.target.value,
                              });
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
                                setAddress({
                                  ...address,
                                  city: e.target.value,
                                });
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
                                  provinceCode: val,
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
                                setAddress({
                                  ...address,
                                  country: e.target.value,
                                });
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
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Email Address (Optional)
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
                            className={`w-full px-4 py-3 rounded-lg text-sm focus:outline-none transition-colors ${emailError && emailTouched
                                ? "border border-red-500 bg-white focus:border-red-500"
                                : "border border-gray-300 focus:border-[#7d4b0e]"
                              }`}
                            placeholder="your.email@example.com"
                          />

                          {emailError && emailTouched && (
                            <p className="mt-1 text-xs text-red-600">
                              Please enter a valid email address
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle size={18} className="text-green-600" />
                        Order Summary
                      </h4>
                      {isCalculating && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Loader2 size={16} className="animate-spin" />
                          Calculating shipping & tax...
                        </div>
                      )}
                      {calculationError && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                          {calculationError}
                        </div>
                      )}
                      {!isCalculating && calculationData && (
                        <div className="space-y-2 text-sm mt-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">
                              ₹{subtotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between opacity-50">
                            <span className="text-gray-600">
                              Tax (included)
                            </span>
                            <span className="font-medium">
                              ₹{taxAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Shipping ({calculationData.shipping?.title || "—"}
                              ) {isFreeDelivery ? "(Free)" : ""}
                            </span>
                            <span className="font-medium">
                              {isFreeDelivery
                                ? "₹0"
                                : `₹${shippingAmount.toFixed(2)}`}
                            </span>
                          </div>
                          <div className="pt-2 border-t-2 border-amber-300 flex justify-between">
                            <span className="font-bold text-gray-900">
                              Total
                            </span>
                            <span className="font-bold text-[#7d4b0e] text-lg">
                              ₹{totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}

                      {!isCalculating &&
                        !calculationData &&
                        !calculationError && (
                          <div className="text-sm text-gray-600 italic">
                            Fill in all fields to see shipping cost
                          </div>
                        )}
                    </div>
                    {/* Payment Method Section */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <PaymentIcon size={20} className="text-[#7d4b0e]" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Payment Method
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {[
                          {
                            value: "cod",
                            label: "Partial Cash on Delivery (COD)",
                            description:
                              "Pay booking amount via UPI to confirm your order, rest at delivery.",
                            icon: Truck,
                            color: "#16a34a",
                          },
                          {
                            value: "Online",
                            label: "Online Payment",
                            description:
                              "Pay booking amount via UPI to confirm your order, rest at delivery.",
                            icon: CreditCard,
                            color: "#16a34a",
                          },
                        ].map((option) => {
                          const Icon = option.icon;
                          const isSelected = paymentMethod === option.value;

                          return (
                            <div key={option.value} className="space-y-3">
                              <label
                                className={`relative flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 
            ${isSelected
                                    ? "border-[#7d4b0e] bg-amber-50 shadow-md ring-2 ring-[#7d4b0e]/20"
                                    : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                                  }`}
                              >
                                <input
                                  type="radio"
                                  name="payment"
                                  value={option.value}
                                  checked={isSelected}
                                  onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                  }
                                  className="w-5 h-5 text-[#7d4b0e] border-gray-300 focus:ring-[#7d4b0e] cursor-pointer accent-[#7d4b0e]"
                                />

                                <div className="flex items-center gap-4 flex-1">
                                  <div
                                    className={`p-3 rounded-lg ${isSelected
                                        ? "bg-white shadow-sm"
                                        : "bg-gray-100"
                                      }`}
                                  >
                                    <Icon
                                      size={24}
                                      style={{ color: option.color }}
                                    />
                                  </div>

                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-900 text-lg">
                                        {option.label}
                                      </span>
                                      {option.badge && (
                                        <span className="px-2 py-1 text-xs font-medium text-white bg-gradient-to-r from-[#7d4b0e] to-[#a0522d] rounded-full">
                                          {option.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {option.description}
                                    </p>
                                  </div>
                                </div>

                                {isSelected && (
                                  <div className="absolute top-2 right-2">
                                    <CheckCircle
                                      size={20}
                                      className="text-[#7d4b0e]"
                                    />
                                  </div>
                                )}
                              </label>

                              {/* Show QR Code for Partial COD */}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleClose}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={!calculationData || isPlacingOrder}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8f4a12] to-[#5a3102]  text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
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
                        ) : paymentMethod === "cod" ? (
                          "Place Order"
                        ) : (
                          "Proceed to Payment"
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
    </>
  );
}
