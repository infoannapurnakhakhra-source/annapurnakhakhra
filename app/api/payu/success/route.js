export async function POST(req) {
  const body = await req.formData();

  const status = body.get("status");
  const txnid = body.get("txnid");

  if (status === "success") {
    // ✅ Verify hash again (important)
    // ✅ Mark order as PAID
    // ✅ Create final order
  }

  return Response.redirect(`${process.env.APP_URL}/order-success`);
}
