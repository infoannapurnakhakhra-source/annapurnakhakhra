// app/api/brochure-download/route.js

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

 
    const backendRes = await fetch(
      "https://adminrocket.megascale.co.in/api/brochure-download",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const backendData = await backendRes.json();

    return new Response(JSON.stringify(backendData), {
      status: backendRes.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("❌ Proxy error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Proxy server error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
}
  