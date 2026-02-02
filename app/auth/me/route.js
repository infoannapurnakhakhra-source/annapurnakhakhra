// app/api/auth/me/route.js
import connectDB from "@/lib/mongodb";
import User from "@/lib/userModel";

export async function GET(request) {
  await connectDB();
  // Replace this with your actual auth method (session, JWT, etc.)
  const email = request.headers.get("x-user-email") || "test@example.com"; // ← change this
  const user = await User.findOne({ email });
  if (!user) return Response.json({});

  return Response.json({
    shopifyCustomerId: user.shopifyCustomerId || null
  });
}