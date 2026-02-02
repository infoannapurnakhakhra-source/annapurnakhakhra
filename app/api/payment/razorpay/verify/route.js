import crypto from "crypto";
import PaymentSession from "@/lib/models/PaymentSession";
import { completeDraftOrder, markShopifyOrderPaid } from "@/lib/shopify";


function generateOrderToken() {
  return crypto.randomBytes(32).toString("hex");
}
export async function POST(req) {
  try {

    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    // 🔐 Safety check
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return Response.json(
        { success: false, message: "Missing Razorpay fields" },
        { status: 400 }
      );
    }

    // 🔐 Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return Response.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    // 1️⃣ Get payment session
    const session = await PaymentSession.findOne({
      razorpayOrderId: razorpay_order_id,
      status: "PENDING",
    });

    if (!session) {
      return Response.json(
        { success: false, message: "Payment session not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Complete Shopify Draft Order
    const order = await completeDraftOrder(session.draftOrderId);

    if (!order?.id) {
      throw new Error("Shopify order completion failed");
    }

   await markShopifyOrderPaid(order.id);

    const orderToken = session.orderToken || generateOrderToken();

    // update session
    session.status = "PAID";
    session.razorpayPaymentId = razorpay_payment_id;
    session.shopifyOrderId = order.id;
    session.shopifyOrderName = order.name;
    session.orderToken = orderToken;

    await session.save();

    return Response.json({
      success: true,
      token: orderToken,
    });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);

    return Response.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
// import dbConnect from "@/lib/db";

// export async function POST(req) {
//     await dbConnect();
//   const body = await req.json();

//   const {
//     razorpay_order_id,
//     razorpay_payment_id,
//     razorpay_signature,
//   } = body;

//   const generatedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//     .update(razorpay_order_id + "|" + razorpay_payment_id)
//     .digest("hex");

//   if (generatedSignature !== razorpay_signature) {
//     return Response.json({ success: false }, { status: 400 });
//   }

//   // 1️⃣ Get payment session
//   const session = await PaymentSession.findOne({
//     razorpayOrderId: razorpay_order_id,
//   });

//   if (!session) {
//     return Response.json({ success: false }, { status: 404 });
//   }

//   // 2️⃣ Complete Draft Order
//   const order = await completeDraftOrder(session.draftOrderId);

//   // 3️⃣ Update DB
//   session.status = "PAID";
//   session.razorpayPaymentId = razorpay_payment_id;
//   session.shopifyOrderId = order.id;
//   session.shopifyOrderName = order.name;
//   await session.save();

//   return Response.json({
//     success: true,
//     orderId: order.name.replace("#", ""),
//   });
// }




