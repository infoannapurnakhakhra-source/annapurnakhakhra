import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const payload = await req.json();

    // Enhanced logging for debugging
    console.log("Proxy Tracking Event Received:");
    console.log("- Event:", payload.event || "unknown");
    console.log("- Session ID:", payload.sessionId || "N/A");
    console.log("- Shop URL:", payload.shopurl || "N/A");
    console.log("Full payload:", JSON.stringify(payload, null, 2));

    // Basic validation
    if (!payload.event) {
      console.warn("Rejected: Missing 'event' field");
      return NextResponse.json(
        { success: false, error: "Missing required field: 'event'" },
        { status: 400 }
      );
    }

    if (!payload.shopurl) {
      console.warn("Rejected: Missing 'shopurl'");
      return NextResponse.json(
        { success: false, error: "Missing required field: 'shopurl'" },
        { status: 400 }
      );
    }

    // Supported events
    const supportedEvents = ["checkout_started", "checkout_calculated"];
    if (!supportedEvents.includes(payload.event)) {
      console.warn(`Unsupported event: ${payload.event}`);
      // Still forward it — your backend might handle new events later
    }

    // Forward to your actual tracking backend
    const upstreamUrl = "https://adminrocket.megascale.co.in/api/track/checkout";

    const res = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    console.log(`Upstream response (${payload.event}):`, text || "(empty body)");

    // Parse response safely
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse JSON from upstream:", text);
        return NextResponse.json(
          {
            success: false,
            error: "Invalid JSON response from tracking service",
            raw: text.substring(0, 200), // truncate for logs
          },
          { status: 502 }
        );
      }
    }

    console.log(`Forwarding response to client:`, JSON.stringify(data, null, 2));

    // Forward the exact status and body from upstream
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Critical proxy error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error in tracking proxy",
        message: err.message,
      },
      { status: 500 }
    );
  }
}