import { NextResponse } from "next/server";

const SHOPIFY_STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "hit-megascale.myshopify.com";
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN || "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";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let orderId = searchParams.get('id');
  if (!orderId) {
    const pathname = new URL(request.url).pathname;
    orderId = pathname.split("/").pop();
  }

  console.log("🔍 Fetching order ID:", orderId);

  const cleanId = orderId?.trim();
  if (!cleanId || !/^\d+$/.test(cleanId) || cleanId.length < 10) {
    return NextResponse.json(
      { success: false, error: "Invalid order ID" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2024-10/orders/${cleanId}.json`,
      {
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("❌ Shopify error:", res.status, errorBody);
      return NextResponse.json(
        { success: false, error: `Shopify API failed: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const order = data.order;
    
    console.log("🔍 DEBUG - Checking ALL data fields:");
    console.log("1. total_price:", order.total_price);
    console.log("2. subtotal_price:", order.subtotal_price);
    console.log("3. current_total_price:", order.current_total_price);
    console.log("4. current_subtotal_price:", order.current_subtotal_price);
    console.log("5. current_total_price_set:", order.current_total_price_set);
    console.log("6. current_subtotal_price_set:", order.current_subtotal_price_set);
    console.log("7. current_total_tax:", order.current_total_tax);
    console.log("8. current_total_tax_set:", order.current_total_tax_set);
    console.log("9. total_line_items_price:", order.total_line_items_price);
    console.log("10. total_shipping_price_set:", order.total_shipping_price_set);
    
    // Get all tax lines
    const allTaxLines = order.tax_lines || [];
    
    // Filter product tax lines (exclude shipping-related)
    const productTaxLines = allTaxLines.filter((taxLine) => {
      const titleLower = (taxLine.title || '').toLowerCase();
      return !titleLower.includes('shipping') && 
             !titleLower.includes('postage') && 
             !titleLower.includes('delivery') && 
             !titleLower.includes('freight') &&
             !titleLower.includes('transport');
    });
    
    // Calculate product tax (only on subtotal/products)
    const productTax = productTaxLines.reduce((sum, taxLine) => sum + parseFloat(taxLine.price || 0), 0);
    
    // Calculate shipping tax (all other taxes)
    const totalTaxAmount = parseFloat(order.current_total_tax || order.total_tax || 0);
    const shippingTax = totalTaxAmount - productTax;
    
    console.log("💰 Tax Breakdown:");
    console.log(`   Product Tax: ${productTax.toFixed(2)}`);
    console.log(`   Shipping Tax: ${shippingTax.toFixed(2)}`);
    console.log(`   Total Tax: ${totalTaxAmount.toFixed(2)}`);
    
    // CALCULATE SHIPPING PROPERLY (pre-tax first)
    let preTaxShippingPrice = "0.00";
    
    // Method 1: Calculate from current values (this gives pre-tax shipping)
    const currentTotal = parseFloat(order.current_total_price || order.total_price || 0);
    const currentSubtotal = parseFloat(order.current_subtotal_price || order.subtotal_price || 0);
    const currentTax = totalTaxAmount;
    
    // Shipping pre-tax = Total - (Subtotal + Total Tax)
    const calculatedPreTaxShipping = (currentTotal - (currentSubtotal + currentTax)).toFixed(2);
    
    console.log("💰 Calculation (pre-tax shipping):");
    console.log(`   Total: ${currentTotal}`);
    console.log(`   - Subtotal: ${currentSubtotal}`);
    console.log(`   - Tax: ${currentTax}`);
    console.log(`   = Pre-tax Shipping: ${calculatedPreTaxShipping}`);
    
    preTaxShippingPrice = calculatedPreTaxShipping;
    
    // Override with shipping lines if available
    if (order.total_shipping_price_set) {
      const shippingFromSet = parseFloat(order.total_shipping_price_set.shop_money?.amount || 0);
      if (shippingFromSet >= 0) {
        preTaxShippingPrice = shippingFromSet.toFixed(2);
        console.log("💰 Using total_shipping_price_set:", preTaxShippingPrice);
      }
    }
    
    // Full shipping price (pre-tax + shipping tax)
    const fullShippingPrice = (parseFloat(preTaxShippingPrice) + shippingTax).toFixed(2);
    
    console.log("💰 Final Shipping (full):", fullShippingPrice);
    
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        name: order.name,
        createdAt: order.created_at,
        processedAt: order.processed_at || order.created_at,
        totalPrice: order.current_total_price || order.total_price,
        subtotalPrice: order.current_subtotal_price || order.subtotal_price,
        totalTax: productTax.toFixed(2),  // Only product tax
        shippingPrice: fullShippingPrice,  // Full shipping including its tax
        totalShipping: fullShippingPrice,
        taxLines: productTaxLines,  // Only product tax lines
        shippingLines: order.shipping_lines || [],
        currency: order.currency,
        financialStatus: (order.financial_status || "pending").toUpperCase(),
        fulfillmentStatus: order.fulfillment_status
          ? order.fulfillment_status.replace(/_/g, " ").toUpperCase()
          : "UNFULFILLED",

        lineItems: (order.line_items || []).map(item => ({
          id: item.id,
          title: item.title,
          variantTitle: item.variant_title || "Default",
          sku: item.sku || "N/A",
          quantity: item.quantity,
          price: item.price,
          total: (parseFloat(item.price || 0) * item.quantity).toFixed(2),
        })),

        shippingAddress: order.shipping_address || null,
        customer: order.customer
          ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim() || "Guest"
          : "Guest",
          
        // Add debug info
        _debug: {
          currentTotal: order.current_total_price,
          currentSubtotal: order.current_subtotal_price,
          currentTax: order.current_total_tax,
          total: order.total_price,
          subtotal: order.subtotal_price,
          tax: order.total_tax,
          calculatedPreTaxShipping: preTaxShippingPrice,
          productTax: productTax.toFixed(2),
          shippingTax: shippingTax.toFixed(2),
          fullShipping: fullShippingPrice
        }
      },
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    return NextResponse.json(
      { success: false, error: "Server error: " + err.message },
      { status: 500 }
    );
  }
}