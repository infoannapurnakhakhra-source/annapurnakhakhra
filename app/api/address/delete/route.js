export async function DELETE(request) {
  const { customerId, addressId } = await request.json();

  if (!customerId || !addressId) {
    return Response.json(
      { success: false, message: "Missing customerId or addressId" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${process.env.SHOPIFY_ADMIN_API_BASE_URL}/2025-04/customers/${customerId}/addresses/${addressId}.json`,
      {
        method: "DELETE",
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.message || "Delete failed");
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}