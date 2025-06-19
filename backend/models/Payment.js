import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    paymentScreenshot: {
      type: String, // Path to uploaded image in /uploads
      required: true,
    },
    paidToBankAccount: {
      type: String, // Could be account number or empty string
      default: "",
    },
    paidToWallet: {
      type: String, // Could be wallet ID or empty string
      default: "",
    },
    confirmed: {
      type: Boolean,
      default: false, // Set to true when seller approves payment
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
