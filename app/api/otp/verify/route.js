export async function POST(req) {
  try {
    const body = await req.json();
    const ADMIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ;

    const res = await fetch(`${ADMIN_API_BASE_URL.replace(/\/$/, "")}/api/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return Response.json(data);

  } catch (err) {
    console.error("Verify OTP error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
