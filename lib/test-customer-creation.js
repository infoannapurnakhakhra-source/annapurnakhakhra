// Debug script to test customer creation
// Run this in your API route or Node environment

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = "2024-10";
const ADMIN_ENDPOINT = `${process.env.SHOPIFY_ADMIN_API_BASE_URL}/${API_VERSION}/graphql.json`;

async function testCustomerCreation() {
  console.log("🧪 TESTING CUSTOMER CREATION");
  console.log("================================");
  console.log("SHOPIFY_DOMAIN:", SHOPIFY_DOMAIN);
  console.log("ADMIN_ENDPOINT:", ADMIN_ENDPOINT);
  console.log("ADMIN_TOKEN exists:", !!ADMIN_TOKEN);
  console.log("================================\n");

  const mutation = `
    mutation customerCreate($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
          phone
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      firstName: "Test",
      lastName: "User",
      email: "testuser" + Date.now() + "@gmail.com",
      phone: "+91 9876543210",
      acceptsMarketing: false,
    },
  };

  console.log("📧 Creating customer with:");
  console.log(JSON.stringify(variables, null, 2));
  console.log("\n");

  try {
    const res = await fetch(ADMIN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_TOKEN,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const json = await res.json();

    console.log("📥 Response Status:", res.status);
    console.log("📥 Response Body:");
    console.log(JSON.stringify(json, null, 2));

    if (json.errors) {
      console.error("\n❌ GraphQL Errors:");
      console.error(json.errors);
    }

    if (json.data?.customerCreate?.userErrors?.length > 0) {
      console.error("\n❌ User Errors:");
      console.error(json.data.customerCreate.userErrors);
    }

    if (json.data?.customerCreate?.customer?.id) {
      console.log("\n✅ SUCCESS! Customer created:");
      console.log(json.data.customerCreate.customer);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
}

testCustomerCreation();
