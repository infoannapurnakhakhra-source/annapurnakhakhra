// app/api/auth/send-otp/route.js
export async function POST(request) {
  const body = await request.json();
  console.log("Received OTP request:", { ...body , storename: "hit-megascale.myshopify.com" });
  const res = await fetch(`${process.env.NEXT_PUBLIC_OTP_API_BASE_URL}/annapurnakhakhra/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body , storeName: "hit-megascale.myshopify.com" }),
  });
  
  const data = await res.json();
  return Response.json(data);
}