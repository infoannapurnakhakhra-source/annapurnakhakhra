import PaymentSession from "@/lib/models/PaymentSession";
import { createRazorpayOrder } from "@/lib/razorpay";
import { connectDB } from "@/lib/db";
import {
  createCustomerFromOrder,
  getCustomerByEmail,
  getCustomerByPhone,
} from "@/lib/shopify";
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const SHOPIFY_STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

const ALLOWED_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "proton.me",
];
import crypto from "crypto";

function generateOrderToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function getCustomer(customerId) {
  console.log("FETCHING CUSTOMER WITH ID:", customerId);
  const res = await fetch(
    `https://${SHOPIFY_STORE}/admin/api/2025-01/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: `
          query ($id: ID!) {
            customer(id: $id) {
              id
              email
            }
          }
        `,
        variables: { id: `gid://shopify/Customer/${customerId}` },
      }),
    },
  );
  const data = await res.json();
  console.log("GET CUSTOMER RESPONSE:", await data);
  return data.data.customer;
}

function isValidEmailDomain(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
}

async function updateCustomerEmail(customerId, email) {
  try {
    const res = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2025-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: `
          mutation customerUpdate($input: CustomerInput!) {
            customerUpdate(input: $input) {
              customer { id email }
              userErrors { message }
            }
          }
        `,
          variables: {
            input: { id: `gid://shopify/Customer/${customerId}`, email },
          },
        }),
      },
    );
    const data = await res.json();
    console.log("UPDATE CUSTOMER EMAIL RESPONSE:", data);

    if (!data || !data.data) {
      console.error("Invalid response from Shopify:", data);
      return { userErrors: [{ message: "Failed to update email" }] };
    }

    return (
      data.data.customerUpdate || {
        userErrors: [{ message: "No response from update" }],
      }
    );
  } catch (error) {
    console.error("Error updating customer email:", error);
    return { userErrors: [{ message: error.message }] };
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    await connectDB();
    const { email, shippingAddress, lineItems, customerId, totalAmount } = body;

    let customer = null;
    let finalCustomerId = customerId;

    if (customerId) {
      customer = await getCustomer(customerId);
      if (!customer) {
        return Response.json(
          { success: false, error: "Customer not found" },
          { status: 404 },
        );
      }
    } else if (email || shippingAddress?.phone) {
      // Auto-create customer if not logged in
      try {
        console.log("🔄 AUTO-CREATE CUSTOMER FLOW STARTED FOR ONLINE ORDER");
        const phoneNumber = shippingAddress?.phone;

        // Try to find by email first
        if (email) {
          console.log("📧 Checking if customer exists by email...");
          const existingCustomer = await getCustomerByEmail(email);
          if (existingCustomer) {
            console.log(
              "✅ EXISTING CUSTOMER FOUND BY EMAIL:",
              existingCustomer.id,
            );
            finalCustomerId = existingCustomer.id;
            customer = existingCustomer;
          }
        }

        // If not found by email, try by phone
        if (!finalCustomerId && phoneNumber) {
          console.log("📱 Checking if customer exists by phone...");
          const existingCustomer = await getCustomerByPhone(phoneNumber);
          if (existingCustomer) {
            console.log(
              "✅ EXISTING CUSTOMER FOUND BY PHONE:",
              existingCustomer.id,
            );
            finalCustomerId = existingCustomer.id;
            customer = existingCustomer;
          }
        }

        // If still not found, create new one
        if (!finalCustomerId) {
          console.log("📧 Customer doesn't exist, creating new one...");
          const newCustomer = await createCustomerFromOrder({
            firstName: shippingAddress?.firstName || "",
            lastName: shippingAddress?.lastName || "",
            email,
            phoneNumber: phoneNumber || "",
          });

          if (newCustomer) {
            console.log("✅ NEW CUSTOMER CREATED:", newCustomer.id);
            finalCustomerId = newCustomer.id;
            customer = newCustomer;
          }
        }
      } catch (error) {
        console.error("⚠️ Error during customer auto-creation:", error.message);
      }
    }

    if (email && !isValidEmailDomain(email)) {
      return Response.json(
        {
          success: false,
          code: "INVALID_CUSTOMER_EMAIL",
          message:
            "Please update your email to Gmail / Yahoo / Outlook / iCloud / Proton",
        },
        { status: 400 },
      );
    }

    if (customer && email && customer.email !== email) {
      const update = await updateCustomerEmail(customerId, email);
      if (update && update.userErrors && update.userErrors.length) {
        return Response.json(
          {
            success: false,
            code: "EMAIL_ALREADY_EXISTS",
            message:
              "This email is already used by another account. Please use another email.",
          },
          { status: 400 },
        );
      }
    }

    if (!SHOPIFY_ACCESS_TOKEN || !SHOPIFY_STORE) {
      return Response.json(
        { success: false, error: "Shopify credentials not set" },
        { status: 500 },
      );
    }

    const gqlLineItems = lineItems.map((item) => ({
      variantId: item.variant_id.startsWith("gid://")
        ? item.variant_id
        : `gid://shopify/ProductVariant/${item.variant_id}`,
      quantity: Number(item.quantity),
      requiresShipping: true,
    }));

    const calculateRes = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2025-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
        mutation CalculateShipping($input: DraftOrderInput!) {
          draftOrderCalculate(input: $input) {
            calculatedDraftOrder {
              availableShippingRates {
                title
                handle
                price {
                  amount
                  currencyCode
                }
              }
              totalShippingPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalTaxSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
          variables: {
            input: {
              ...(email ? { email } : {}),
              lineItems: gqlLineItems,
              shippingAddress: {
                firstName: shippingAddress.firstName,
                lastName: shippingAddress.lastName,
                address1: shippingAddress.address1,
                city: shippingAddress.city,
                provinceCode: shippingAddress.provinceCode,
                countryCode: "IN",
                zip: shippingAddress.zip,
              },
              taxExempt: false,
            },
          },
        }),
      },
    );

    const calcData = await calculateRes.json();
    console.log("CALCULATION DATA:", calcData);

    const calcResult = calcData.data?.draftOrderCalculate?.calculatedDraftOrder;

    if (!calcResult?.availableShippingRates?.length) {
      return Response.json(
        { success: false, error: "No shipping rates available" },
        { status: 400 },
      );
    }

    // ------------------------------------------------
    // STEP 2: SELECT SHIPPING (AUTO OR FRONTEND)
    // ------------------------------------------------
    const selectedRate = calcResult.availableShippingRates[0];

    // ------------------------------------------------
    // STEP 3: CREATE DRAFT ORDER (REST)
    // ------------------------------------------------
    const draftOrderPayload = {
      draft_order: {
        ...(!finalCustomerId && email ? { email } : {}),
        line_items: lineItems.map((item) => ({
          variant_id: Number(
            item.variant_id.replace("gid://shopify/ProductVariant/", ""),
          ),
          quantity: item.quantity,
        })),
        shipping_address: shippingAddress,
        shipping_line: {
          title: selectedRate.title,
          price: selectedRate.price.amount,
          handle: selectedRate.handle,
        },
      },
    };

    if (finalCustomerId) {
      // Extract numeric ID if it's a Shopify GID
      let numericCustomerId = finalCustomerId;
      if (
        typeof finalCustomerId === "string" &&
        finalCustomerId.includes("gid://")
      ) {
        numericCustomerId = finalCustomerId.split("/").pop();
      }
      draftOrderPayload.draft_order.customer = {
        id: Number(numericCustomerId),
      };
      console.log(
        "   Setting customer ID for online order:",
        draftOrderPayload.draft_order.customer,
      );
    }

    const draftOrderRes = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2024-10/draft_orders.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftOrderPayload),
      },
    );

    const draftOrderData = await draftOrderRes.json();

    if (!draftOrderRes.ok) {
      return Response.json(
        { success: false, error: draftOrderData },
        { status: 400 },
      );
    }

    const draftOrderId = draftOrderData.draft_order.id;

    const razorpayOrder = await createRazorpayOrder({
      amount: Math.round(totalAmount * 100),
      receipt: draftOrderId.toString(),
    });

    const orderToken = generateOrderToken();

    await PaymentSession.create({
      draftOrderId,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      status: "PENDING",
      isCod: false,
      orderToken, // 🔐 added
    });

    return Response.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      token: orderToken, // frontend keeps this
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
