import { NextResponse } from "next/server";
import { register } from "@/lib/shopify";

export async function POST(request) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const customer = await register({ firstName, lastName, email, password });

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please login.",
      customer
    });
  } catch (error) {
    console.error("Register API error:", error.message);
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 400 });
  }
}
