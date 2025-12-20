
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  const { phone, storeName, enteredOtp } = body;

  // Clean phone number
  let cleanPhone = phone.trim().replace(/[^0-9]/g, "");
  if (cleanPhone.length === 10) cleanPhone = cleanPhone.slice(-10);
  const fullPhone = `+91${cleanPhone}`;

  let existingCustomerId = null;

  // Step 1: Pehle Shopify mein check karo – is phone se customer hai kya?
  try {
    const searchRes = await fetch(
      `https://${storeName}/admin/api/2024-10/customers/search.json?query=phone:${fullPhone}`,
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    if (searchRes.ok) {
      const result = await searchRes.json();
      if (result.customers && result.customers.length > 0) {
        existingCustomerId = result.customers[0].id.toString();
        console.log("Existing customer found:", existingCustomerId);
      }
    }
  } catch (err) {
    console.log("Shopify search failed, continuing...");
  }

  // Step 2: Ab megascale ki original API ko call karo
  const https = require("https");
  const agent = new https.Agent({ rejectUnauthorized: false });

  const megascaleRes = await fetch(`${process.env.NEXT_PUBLIC_OTP_API_BASE_URL}/annapurnakhakhra/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: phone,
      storeName: "hit-megascale.myshopify.com",
      enteredOtp: enteredOtp.trim(),
    }),
    agent,
  });

  const megascaleData = await megascaleRes.json();

  // Step 3: Agar OTP sahi hai → hum apna smart response banayenge
  if (megascaleData.success) {
    const finalCustomerId = existingCustomerId || megascaleData.user?.storeEntry?.shopifyCustomerId;

    return NextResponse.json({
      success: true,
      user: {
        phone: fullPhone,
        storeEntry: {
          shopifyCustomerId: finalCustomerId,
          
        },
      },
      message: existingCustomerId ? "Welcome back!" : "New account created",
    });
  }


  return NextResponse.json(megascaleData);
}