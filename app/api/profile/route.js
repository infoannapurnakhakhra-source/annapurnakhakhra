// app/api/profile/route.js
import { NextResponse } from "next/server";

const SHOPIFY_STORE =process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN; 

export async function POST(request) {
  const { customerId } = await request.json();

  if (!customerId) {
    return NextResponse.json({ success: false, message: "No customer ID" });
  }

  try {
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
      return NextResponse.json({ success: false, message: "Customer not found" });
    }

    const customer = data.customer;

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

    return NextResponse.json({
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
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        processedAt: o.processed_at,
        totalPrice: o.total_price,
        financialStatus: o.financial_status,
        fulfillmentStatus: o.fulfillment_status,
        lineItems: o.line_items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
        })),
      })),
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ success: false });
  }
}