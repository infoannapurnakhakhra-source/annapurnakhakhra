export async function POST(req) {
  try {
    const body = await req.json();
    const { shop, email, name, address, paymentMethod, lineItems } = body;
    const ADMIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ;

    console.log("Creating custom checkout with data:", body);

    // You can add validation here if needed
    if (!shop || !email || !lineItems || lineItems.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Call the custom checkout API
    const response = await fetch(`${ADMIN_API_BASE_URL.replace(/\/$/, "")}/api/custom-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shop,
        email,
        name,
        address,
        paymentMethod,
        lineItems,
      }),
    });

    const data = await response.json();
    console.log("Custom checkout API response:", data);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: data }),
        { status: response.status }
      );
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error in custom checkout route:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
