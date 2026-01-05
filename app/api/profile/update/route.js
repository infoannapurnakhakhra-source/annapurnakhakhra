import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const body = await request.json();
    const { phone, firstName, lastName, email } = body;

    if (!phone) {
      return NextResponse.json({ success: false, message: "Phone number required" }, { status: 400 });
    }

    // Clean phone number
    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length === 12 && cleanPhone.startsWith("91")) cleanPhone = cleanPhone.slice(2);
    if (cleanPhone.length === 13 && cleanPhone.startsWith("+91")) cleanPhone = cleanPhone.slice(3);
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ success: false, message: "Invalid phone number" }, { status: 400 });
    }

    const STORE_NAME = process.env.SHOPIFY_STORE_DOMAIN;
    const url = `${process.env.NEXT_PUBLIC_OTP_API_BASE_URL}/annapurnakhakhra/userProfile/${STORE_NAME}/${cleanPhone}`;

    console.log("Final URL →", url); 

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: firstName?.trim() || "",
        lastName: lastName?.trim() || "",
        email: email?.trim() || "",
      }),
    });

    const data = await response.json();
    console.log("Megascale response:", data); 

    if (response.ok || data.success || (data.message && /success|updated/i.test(data.message))) {
      return NextResponse.json({
        success: true,
        message: "Profile updated successfully!",
        user: data.user || { phone: cleanPhone, firstName, lastName, email }
      });
    }

    return NextResponse.json({
      success: false,
      message: data.message || "Update failed on megascale server"
    }, { status: 400 });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}