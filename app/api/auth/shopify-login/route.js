// app/api/auth/shopify-login/route.js
import connectDB from "@/lib/mongodb";
import User from "@/lib/userModel";
import { NextResponse } from "next/server";

const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

export async function POST(request) {
  await connectDB();
  const { email, password } = await request.json();

  // Step 1: Login to Shopify Storefront API
  const query = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          message
        }
      }
    }
  `;

  const variables = {
    input: { email, password }
  };

  const res = await fetch(`https://${SHOPIFY_DOMAIN }/api/2025-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();

  if (json.errors || json.data.customerAccessTokenCreate.customerUserErrors.length > 0) {
    return NextResponse.json({ error: "Invalid Shopify login" }, { status: 401 });
  }

  const accessToken = json.data.customerAccessTokenCreate.customerAccessToken.accessToken;

  // Step 2: Get customer details
  const customerQuery = `
    query {
      customer(customerAccessToken: "${accessToken}") {
        id
        email
        firstName
        lastName
      }
    }
  `;

  const customerRes = await fetch(`https://${SHOPIFY_DOMAIN}/api/2025-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query: customerQuery }),
  });

  const customerData = await customerRes.json();
  const customer = customerData.data.customer;
  const shopifyCustomerId = customer.id.split("/").pop();

  // Step 3: Create or update user in MongoDB
  const user = await User.findOneAndUpdate(
    { email: customer.email },
    {
      name: `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Customer",
      shopifyCustomerId,
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({
    success: true,
    user: {
      email: customer.email,
      name: user.name,
      shopifyCustomerId,
    },
  });
}