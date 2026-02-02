import mongoose from "mongoose";

const PaymentSessionSchema = new mongoose.Schema(
  {
    /* ---------------- SHOPIFY ---------------- */

    draftOrderId: {
      type: String, // ✅ FIXED
      required: true,
      index: true,
    },

    shopifyOrderId: {
      type: String,
      index: true,
    },

    shopifyOrderName: {
      type: String,
    },

    /* ---------------- RAZORPAY (OPTIONAL) ---------------- */

    razorpayOrderId: {
      type: String,
      index: true,
      sparse: true, // ✅ allows missing values
    },

    razorpayPaymentId: {
      type: String,
    },

    /* ---------------- PAYMENT ---------------- */

    amount: {
      type: Number,
      required: false, // ✅ FIXED for COD
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "COD"],
      default: "PENDING",
      index: true,
    },

    isCod: {
      type: Boolean,
      default: false,
    },

    /* ---------------- SECURITY ---------------- */

    orderToken: {
      type: String,
      unique: true,
      sparse: true, // ✅ CRITICAL FIX
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.PaymentSession ||
  mongoose.model("PaymentSession", PaymentSessionSchema);

// import mongoose from "mongoose";

// const PaymentSessionSchema = new mongoose.Schema(
//   {
//     draftOrderId: { type: String, required: true, index: true },

//     razorpayOrderId: { type: String, required: true, unique: true },

//     razorpayPaymentId: String,

//     amount: Number,

//     status: {
//       type: String,
//       enum: ["PENDING", "PAID", "FAILED"],
//       default: "PENDING",
//     },

//     shopifyOrderId: String,
//     shopifyOrderName: String,
//   },
//   { timestamps: true }
// );

// export default mongoose.models.PaymentSession ||
//   mongoose.model("PaymentSession", PaymentSessionSchema);


