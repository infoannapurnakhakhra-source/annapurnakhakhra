import {
  createCustomerFromOrder,
  getCustomerByEmail,
  getCustomerByPhone,
} from "@/lib/shopify";

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone } = body;

    console.log("👤 API CALL: Manual Customer Creation Request", {
      email,
      phone,
    });

    if (!email && !phone) {
      return Response.json(
        { success: false, message: "Email or Phone is required" },
        { status: 400 },
      );
    }

    // 1. Check if customer already exists by email
    let existingCustomer = null;
    if (email) {
      existingCustomer = await getCustomerByEmail(email);
    }

    // 2. Check if customer already exists by phone REGARDLESS of email match
    // This prevents "phone number already exists" error from Shopify
    if (!existingCustomer && phone) {
      existingCustomer = await getCustomerByPhone(phone);
    }

    // 3. If found, return the existing customer
    if (existingCustomer) {
      console.log("✅ Customer already exists:", existingCustomer.id);
      return Response.json({
        success: true,
        message: "Customer already exists",
        customer: existingCustomer,
        isNew: false,
      });
    }

    // 3. Create new customer
    console.log("📧 Creating new customer in Shopify...");
    const newCustomer = await createCustomerFromOrder({
      firstName: firstName || "",
      lastName: lastName || "",
      email: email || "",
      phoneNumber: phone || "",
    });

    if (newCustomer) {
      console.log("✅ New customer created:", newCustomer.id);
      return Response.json({
        success: true,
        message: "Customer created successfully",
        customer: newCustomer,
        isNew: true,
      });
    } else {
      throw new Error("Failed to create customer in Shopify");
    }
  } catch (error) {
    console.error("❌ Manual Customer Creation Route Error:", error.message);
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}
