import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log("Razorpay initialized with Key ID:", process.env.RAZORPAY_KEY_ID);
console.log("Razorpay initialized with Key Secret:", process.env.RAZORPAY_KEY_SECRET );
export async function createRazorpayOrder({ amount, receipt }) {
  try {
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt,
      payment_capture: 1,
    });

    return order;
  } catch (error) {
    console.error("RAZORPAY ORDER ERROR:", error);
    throw new Error("Failed to create Razorpay order");
  }
}



