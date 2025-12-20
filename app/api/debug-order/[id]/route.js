import { NextResponse } from "next/server";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE_DOMAIN;
const ACCESS_TOKEN =process.env.SHOPIFY_ADMIN_TOKEN;

export async function GET(request, { params }) {
  const { id } = params;
  
  try {
    const res = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2024-10/orders/${id}.json`,
      {
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
    
    const data = await res.json();
    
    // Just return raw data for debugging
    return NextResponse.json({
      success: true,
      rawOrder: data.order,
      shippingData: {
        shipping_lines: data.order.shipping_lines,
        total_shipping_price_set: data.order.total_shipping_price_set,
        shipping_lines_count: data.order.shipping_lines?.length || 0
      },
      taxData: {
        tax_lines: data.order.tax_lines,
        total_tax: data.order.total_tax,
        tax_lines_count: data.order.tax_lines?.length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}