import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    // Multiple seller payments for the same order
    sellerPayments: [
      {
        sellerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Seller",
          required: true,
        },
        sellerOrderIndex: {
          type: Number,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: [0, "Amount cannot be negative"],
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
        confirmedAt: Date,
        confirmedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Seller",
        },
        status: {
          type: String,
          enum: ["pending", "confirmed", "rejected", "refunded"],
          default: "pending",
        },
        notes: String,
      },
    ],
    // Overall payment status
    status: {
      type: String,
      enum: ["pending", "partial", "completed", "failed", "refunded"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, "Paid amount cannot be negative"],
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "wallet", "cash_on_delivery"],
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    notes: String,
  },
  { timestamps: true }
);

// Calculate total amount from seller payments
paymentSchema.pre("save", function (next) {
  this.totalAmount = this.sellerPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  this.paidAmount = this.sellerPayments.reduce(
    (sum, payment) => sum + (payment.confirmed ? payment.amount : 0),
    0
  );

  // Update overall status based on confirmed payments
  const totalPayments = this.sellerPayments.length;
  const confirmedPayments = this.sellerPayments.filter(
    (p) => p.confirmed
  ).length;

  if (confirmedPayments === 0) {
    this.status = "pending";
  } else if (confirmedPayments === totalPayments) {
    this.status = "completed";
  } else {
    this.status = "partial";
  }

  next();
});

// Method to confirm a seller payment
paymentSchema.methods.confirmSellerPayment = async function (
  sellerId,
  confirmedBy
) {
  const sellerPayment = this.sellerPayments.find(
    (payment) => payment.sellerId.toString() === sellerId.toString()
  );

  if (sellerPayment) {
    sellerPayment.confirmed = true;
    sellerPayment.confirmedAt = new Date();
    sellerPayment.confirmedBy = confirmedBy;
    sellerPayment.status = "confirmed";

    // Update paid amount and status
    this.paidAmount = this.sellerPayments.reduce(
      (sum, payment) => sum + (payment.confirmed ? payment.amount : 0),
      0
    );

    const totalPayments = this.sellerPayments.length;
    const confirmedPayments = this.sellerPayments.filter(
      (p) => p.confirmed
    ).length;

    if (confirmedPayments === totalPayments) {
      this.status = "completed";
    } else {
      this.status = "partial";
    }

    return this.save();
  }
  throw new Error("Seller payment not found");
};

// Method to reject a seller payment
paymentSchema.methods.rejectSellerPayment = async function (
  sellerId,
  notes = ""
) {
  const sellerPayment = this.sellerPayments.find(
    (payment) => payment.sellerId.toString() === sellerId.toString()
  );

  if (sellerPayment) {
    sellerPayment.confirmed = false;
    sellerPayment.status = "rejected";
    sellerPayment.notes = notes;

    // Update paid amount and status
    this.paidAmount = this.sellerPayments.reduce(
      (sum, payment) => sum + (payment.confirmed ? payment.amount : 0),
      0
    );

    const totalPayments = this.sellerPayments.length;
    const confirmedPayments = this.sellerPayments.filter(
      (p) => p.confirmed
    ).length;

    if (confirmedPayments === 0) {
      this.status = "pending";
    } else {
      this.status = "partial";
    }

    return this.save();
  }
  throw new Error("Seller payment not found");
};

// Method to get seller-specific payment data
paymentSchema.methods.getSellerPaymentData = function (sellerId) {
  return this.sellerPayments.find(
    (payment) => payment.sellerId.toString() === sellerId.toString()
  );
};

// Static method to find payments by seller
paymentSchema.statics.findBySeller = function (sellerId) {
  return this.find({ "sellerPayments.sellerId": sellerId });
};

// Static method to find payments by buyer
paymentSchema.statics.findByBuyer = function (buyerId) {
  return this.find({ buyerId });
};

// Static method to find payments by order
paymentSchema.statics.findByOrder = function (orderId) {
  return this.find({ orderId });
};

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
