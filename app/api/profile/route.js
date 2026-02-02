// app/api/profile/route.js
import { NextResponse } from "next/server";
import PaymentSession from "@/lib/models/PaymentSession";   // ← Make sure this path is correct

const SHOPIFY_STORE = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

function getCorsHeaders(request) {
  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(request) {
  return new NextResponse(null, { headers: getCorsHeaders(request) });
}

export async function POST(request) {
  const corsHeaders = getCorsHeaders(request);
  const { customerId } = await request.json();

  if (!customerId) {
    return NextResponse.json(
      { success: false, message: "No customer ID" },
      { headers: corsHeaders }
    );
  }

  try {
    // Fetch customer
    const res = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2024-01/customers/${customerId}.json`,
      {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok || data.errors) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { headers: corsHeaders }
      );
    }

    const customer = data.customer;

    // Fetch orders
    const ordersRes = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2024-01/customers/${customerId}/orders.json?status=any&limit=50`,
      {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_TOKEN,
        },
      }
    );

    const ordersData = await ordersRes.json();
    const orders = ordersData.orders || [];

    // Enrich each order with payment information from PaymentSession
    const enrichedOrders = await Promise.all(
      orders.map(async (o) => {
        const shopifyOrderId = `gid://shopify/Order/${o.id}`;

        // Find matching PaymentSession document
        const paymentSession = await PaymentSession.findOne({
          shopifyOrderId: shopifyOrderId,
        }).lean(); // faster, returns plain object

        let payment = {
          method: o.financial_status === "paid" ? "Prepaid" : "COD",
          status: "Unknown",
          details: null,
        };

        if (paymentSession) {
          payment = {
            method: paymentSession.isCod ? "COD" : "Prepaid",
            status: paymentSession.status || "Unknown",
          };

          // Include details only for prepaid/online payments
          if (!paymentSession.isCod) {
            payment.details = {
              razorpayOrderId: paymentSession.razorpayOrderId || null,
              razorpayPaymentId: paymentSession.razorpayPaymentId || null,
              amount: paymentSession.amount || o.total_price,
              paidAt: paymentSession.updatedAt || o.processed_at,
              status: paymentSession.status || "Unknown",
            };
          }
        }

        return {
          id: o.id,
          orderNumber: o.order_number,
          processedAt: o.processed_at,
          totalPrice: o.total_price,
          financialStatus: o.financial_status,
          fulfillmentStatus: o.fulfillment_status,
          payment, // ← new enriched payment field
          lineItems: o.line_items.map((item) => ({
            title: item.title,
            quantity: item.quantity,
          })),
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        customer: {
          id: customer.id,
          firstName: customer.first_name,
          lastName: customer.last_name,
          email: customer.email,
          phone: customer.phone,
          defaultAddress: customer.default_address,
          addresses: customer.addresses || [],
        },
        orders: enrichedOrders,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { headers: corsHeaders }
    );
  }
}

// // app/api/profile/route.js
// import { NextResponse } from "next/server";


// const SHOPIFY_STORE =process.env.SHOPIFY_STORE_DOMAIN;
// const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

// function getCorsHeaders(request) {
//   const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
//   return {
//     "Access-Control-Allow-Origin": origin,
//     "Access-Control-Allow-Methods": "POST, OPTIONS",
//     "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
//     "Access-Control-Allow-Credentials": "true",
//     "Access-Control-Max-Age": "86400",
//   };
// }

// export async function OPTIONS(request) {
//   return new NextResponse(null, { headers: getCorsHeaders(request) });
// }

// export async function POST(request) {
//   const corsHeaders = getCorsHeaders(request);
//   const { customerId } = await request.json();

//   if (!customerId) {
//     return NextResponse.json({ success: false, message: "No customer ID" }, { headers: corsHeaders });
//   }

//   try {
//     const res = await fetch(
//       `https://${SHOPIFY_STORE}/admin/api/2024-01/customers/${customerId}.json`,
//       {
//         headers: {
//           "X-Shopify-Access-Token": SHOPIFY_TOKEN,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const data = await res.json();

//     if (!res.ok || data.errors) {
//       return NextResponse.json({ success: false, message: "Customer not found" }, { headers: corsHeaders });
//     }

//     const customer = data.customer;
//     console.log(`https://${SHOPIFY_STORE}/admin/api/2024-01/customers/${customerId}/orders.json?status=any&limit=50`)
//     console.log(SHOPIFY_TOKEN)
//     const ordersRes = await fetch(
//       `https://${SHOPIFY_STORE}/admin/api/2024-01/customers/${customerId}/orders.json?status=any&limit=50`,
//       {
//         headers: {
//           "X-Shopify-Access-Token": SHOPIFY_TOKEN,
//         },
//       }
//     );
//     const ordersData = await ordersRes.json();
//     const orders = ordersData.orders || [];

//     return NextResponse.json({
//       success: true,
//       customer: {
//         id: customer.id,
//         firstName: customer.first_name,
//         lastName: customer.last_name,
//         email: customer.email,
//         phone: customer.phone,
//         defaultAddress: customer.default_address,
//         addresses: customer.addresses || [],
//       },
//       orders: orders.map((o) => ({
//         id: o.id,
//         orderNumber: o.order_number,
//         processedAt: o.processed_at,
//         totalPrice: o.total_price,
//         financialStatus: o.financial_status,
//         fulfillmentStatus: o.fulfillment_status,
//         lineItems: o.line_items.map((item) => ({
//           title: item.title,
//           quantity: item.quantity,
//         })),
//       })),
//     }, { headers: corsHeaders });
//   } catch (error) {
//     console.error("Profile fetch error:", error);
//     return NextResponse.json({ success: false }, { headers: corsHeaders });
//   }
// }