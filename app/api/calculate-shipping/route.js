


export async function POST(req) {
  try {
    const body = await req.json();
    const { email, shippingAddress, lineItems } = body;

    const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
    const SHOPIFY_STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

    if (!SHOPIFY_ACCESS_TOKEN || !SHOPIFY_STORE) {
      return Response.json(
        { success: false, error: "Shopify credentials not set" },
        { status: 500 }
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
                  subtotalPriceSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                  totalPriceSet {
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
              email,
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
      }
    );

    const calcData = await calculateRes.json();
    console.log("CALCULATION DATA:", JSON.stringify(calcData, null, 2));

    // Check for errors
    if (calcData.errors) {
      console.error("GraphQL errors:", calcData.errors);
      return Response.json(
        { success: false, error: "Failed to calculate shipping" },
        { status: 400 }
      );
    }

    const calcResult =
      calcData.data?.draftOrderCalculate?.calculatedDraftOrder;

    if (calcData.data?.draftOrderCalculate?.userErrors?.length > 0) {
      console.error("User errors:", calcData.data.draftOrderCalculate.userErrors);
      return Response.json(
        { 
          success: false, 
          error: calcData.data.draftOrderCalculate.userErrors[0].message 
        },
        { status: 400 }
      );
    }

    if (!calcResult?.availableShippingRates?.length) {
      return Response.json(
        { success: false, error: "No shipping rates available for this address" },
        { status: 400 }
      );
    }

    const selectedRate = calcResult.availableShippingRates[0];

    return Response.json(
      {
        success: true,
        shipping: selectedRate,
        tax: calcResult.totalTaxSet,
        subtotal: calcResult.subtotalPriceSet,
        total: calcResult.totalPriceSet,
        allShippingRates: calcResult.availableShippingRates,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("CALCULATION ERROR:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}