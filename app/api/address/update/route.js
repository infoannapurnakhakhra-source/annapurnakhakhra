// app/api/address/update/route.js
export async function PUT(request) {
  const { customerId, addressId, address } = await request.json();

  if (!customerId || !addressId || !address) {
    return Response.json(
      { success: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const shopifyResponse = await fetch(
      `${process.env.SHOPIFY_ADMIN_API_BASE_URL}/2025-04/customers/${customerId}/addresses/${addressId}.json`,
      {
        method: "PUT",
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: {
            id: addressId,
            address1: address.address1 || "",
            address2: address.address2 || null,
            city: address.city || "",
            province: address.province || "",
            zip: address.zip || "",
            country: address.country || "India",
            phone: address.phone || null,
            default: address.default || false,
          },
        }),
      }
    );

    const data = await shopifyResponse.json();

    if (!shopifyResponse.ok) {
      throw new Error(data.errors?.[0]?.message || "Update failed");
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}