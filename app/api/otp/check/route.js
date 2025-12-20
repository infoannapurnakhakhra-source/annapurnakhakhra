import connectDB from "@/lib/mongodb";
import { isEmailVerified } from "@/lib/otp";
import { NextResponse } from "next/server";

export async function POST(request) {
  await connectDB();
  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
  const verified = await isEmailVerified(email);
  return NextResponse.json({ verified });
}
