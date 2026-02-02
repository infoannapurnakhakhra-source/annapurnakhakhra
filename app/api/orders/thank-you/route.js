import PaymentSession from "@/lib/models/PaymentSession";
// import dbConnect from "@/lib/db";


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    console.log("THANK YOU TOKEN:", token);

    if (!token) {
      return Response.json(
        { success: false, message: "Token missing" },
        { status: 400 }
      );
    }

    const session = await PaymentSession.findOne({ orderToken: token });

    if (!session) {
      return Response.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // ✅ Allow COD or PAID online orders only
    if (session.isCod !== true && session.status !== "PAID") {
      return Response.json(
        { success: false, message: "Payment not completed" },
        { status: 400 }
      );
    }


    // 🔐 Safe response
    return Response.json({
      success: true,
      order: {
        orderNumber: session.shopifyOrderName?.replace("#", "") || null,
        amount: session.amount,
        paymentMethod: session.isCod ? "COD" : "ONLINE",
        status: session.isCod ? "CONFIRMED" : "PAID",
      },
    });

  } catch (err) {
    console.error("THANK YOU FETCH ERROR:", err);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

