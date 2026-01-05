export async function POST(req) {
  try {
    const body = await req.json();
    const { email, shippingAddress, lineItems, paymentMethod } = body;

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
    console.log("CALCULATION DATA:", calcData);

    const calcResult =
      calcData.data?.draftOrderCalculate?.calculatedDraftOrder;

    if (!calcResult?.availableShippingRates?.length) {
      return Response.json(
        { success: false, error: "No shipping rates available" },
        { status: 400 }
      );
    }

    // ------------------------------------------------
    // STEP 2: SELECT SHIPPING (AUTO OR FRONTEND)
    // ------------------------------------------------
    const selectedRate = calcResult.availableShippingRates[0];

    // ------------------------------------------------
    // STEP 3: CREATE DRAFT ORDER (REST)
    // ------------------------------------------------
    const draftOrderRes = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2024-10/draft_orders.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draft_order: {
            email,
            line_items: lineItems.map((item) => ({
              variant_id: Number(
                item.variant_id.replace("gid://shopify/ProductVariant/", "")
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
        }),
      }
    );

    const draftOrderData = await draftOrderRes.json();

    if (!draftOrderRes.ok) {
      return Response.json(
        { success: false, error: draftOrderData },
        { status: 400 }
      );
    }

    const draftOrderId = draftOrderData.draft_order.id;

    // ------------------------------------------------
    // STEP 4: COMPLETE DRAFT ORDER
    // ------------------------------------------------
    const completeRes = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2025-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: `
        mutation draftOrderComplete($id: ID!) {
          draftOrderComplete(id: $id, paymentPending: true) {
            draftOrder {
              id
              order {
                id
                name
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
            id: `gid://shopify/DraftOrder/${draftOrderId}`,
          },
        }),
      }
    );

    const orderData = await completeRes.json();

    // Optional safety check
    if (orderData.errors || orderData.data?.draftOrderComplete?.userErrors?.length) {
      console.error("Draft order completion failed:", orderData);
      throw new Error("Draft order completion failed");
    }


    return Response.json(
      {
        success: true,
        order: orderData,
        shipping: selectedRate,
        tax: calcResult.totalTaxPriceSet,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("CHECKOUT ERROR:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


