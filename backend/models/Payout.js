import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    // Basic payout information
    payoutId: {
      type: String,
      required: true,
      unique: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    sellerOrderIndex: {
      type: Number,
      required: true,
    },

    // Financial details (calculated from order)
    orderAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    commissionRate: {
      type: Number,
      required: true,
      default: 0.02, // 2% commission
    },
    sellerPayoutAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    adminEarnings: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Payout status and tracking
    status: {
      type: String,
      enum: [
        "pending", // Order placed, waiting for admin approval
        "approved", // Admin approved payment
        "processing", // Payment processing
        "completed", // Payout completed to seller's virtual balance
        "failed", // Payout failed
        "cancelled", // Payout cancelled
        "refunded", // Payout refunded
      ],
      default: "pending",
    },

    // Payment reference (fetched from order's sellerOrder)
    paymentInfo: {
      paymentMethod: String,
      paidToBankAccount: String,
      paidToWallet: String,
      paymentScreenshot: String,
      confirmed: Boolean,
      confirmedAt: Date,
    },

    // Timeline and tracking
    timeline: [
      {
        status: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        note: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "timeline.updatedByModel",
        },
        updatedByModel: {
          type: String,
          enum: ["Admin", "Seller", "Buyer"],
        },
      },
    ],

    // Processing details
    processingDate: Date,
    completedDate: Date,
    failureReason: String,
    retryCount: {
      type: Number,
      default: 0,
    },

    // Fee breakdown
    fees: {
      platformFee: {
        type: Number,
        default: 0,
      },
      processingFee: {
        type: Number,
        default: 0,
      },
      taxAmount: {
        type: Number,
        default: 0,
      },
    },

    // Metadata
    metadata: {
      source: {
        type: String,
        enum: ["web", "mobile", "api"],
        default: "web",
      },
      device: String,
      browser: String,
      ipAddress: String,
    },

    // Notifications
    notifications: [
      {
        type: {
          type: String,
          enum: ["email", "sms", "push"],
          required: false,
        },
        status: {
          type: String,
          enum: ["pending", "sent", "failed"],
          default: "pending",
        },
        date: {
          type: Date,
          default: Date.now,
        },
        content: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Generate unique payout ID
payoutSchema.pre("save", async function (next) {
  if (!this.payoutId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.payoutId = `PAY-${year}${month}${day}-${random}`;
  }
  next();
});

// Calculate commission and payout amounts
payoutSchema.pre("save", function (next) {
  if (this.orderAmount && this.commissionRate) {
    this.commissionAmount = this.orderAmount * this.commissionRate;
    this.sellerPayoutAmount = this.orderAmount - this.commissionAmount;
    this.adminEarnings = this.commissionAmount;
  }
  next();
});

// Update timeline when status changes
payoutSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.timeline.push({
      status: this.status,
      date: new Date(),
      note: `Payout status changed to ${this.status}`,
    });
  }
  next();
});

// Virtual balance updates when payout is completed
payoutSchema.post("save", async function (doc) {
  try {
    const Seller = mongoose.model("Seller");
    const Admin = mongoose.model("Admin");

    if (doc.status === "completed") {
      // Update seller's virtual balance (not bank account)
      await Seller.findByIdAndUpdate(doc.sellerId, {
        $inc: {
          balance: doc.sellerPayoutAmount,
          totalEarnings: doc.sellerPayoutAmount,
        },
        $push: {
          payoutHistory: {
            payoutId: doc.payoutId,
            amount: doc.sellerPayoutAmount,
            date: new Date(),
            orderId: doc.orderId,
            status: "credited_to_balance",
          },
        },
      });

      // Update admin's commission balance
      await Admin.findByIdAndUpdate(doc.adminId, {
        $inc: {
          commissionBalance: doc.adminEarnings,
          totalCommissions: doc.adminEarnings,
        },
        $push: {
          commissionHistory: {
            payoutId: doc.payoutId,
            amount: doc.adminEarnings,
            date: new Date(),
            orderId: doc.orderId,
            sellerId: doc.sellerId,
          },
        },
      });
    }
  } catch (error) {
    console.error("Error updating virtual balances:", error);
  }
});

// Instance methods
payoutSchema.methods.updateStatus = async function (
  newStatus,
  note = "",
  updatedBy = null,
  updatedByModel = "Admin"
) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    date: new Date(),
    note,
    updatedBy,
    updatedByModel,
  });

  if (newStatus === "processing") {
    this.processingDate = new Date();
  } else if (newStatus === "completed") {
    this.completedDate = new Date();
  }

  return this.save();
};

payoutSchema.methods.addNotification = async function (type, content) {
  this.notifications.push({
    type,
    content,
    date: new Date(),
  });
  return this.save();
};

// Method to fetch and update payment information from order
payoutSchema.methods.updatePaymentInfoFromOrder = async function () {
  try {
    const Order = mongoose.model("Order");
    const Payment = mongoose.model("Payment");

    const order = await Order.findById(this.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const sellerOrder = order.sellerOrders[this.sellerOrderIndex];
    if (!sellerOrder) {
      throw new Error("Seller order not found");
    }

    // Get payment information from the order's payment
    if (sellerOrder.paymentId) {
      const payment = await Payment.findById(sellerOrder.paymentId);
      if (payment) {
        const sellerPayment = payment.getSellerPaymentData(this.sellerId);
        if (sellerPayment) {
          this.paymentInfo = {
            paymentMethod: payment.paymentMethod,
            paidToBankAccount: sellerPayment.paidToBankAccount,
            paidToWallet: sellerPayment.paidToWallet,
            paymentScreenshot: sellerPayment.paymentScreenshot,
            confirmed: sellerPayment.confirmed,
            confirmedAt: sellerPayment.confirmedAt,
          };
        }
      }
    }

    return this.save();
  } catch (error) {
    console.error("Error updating payment info from order:", error);
    throw error;
  }
};

// Static methods
payoutSchema.statics.findByStatus = function (status) {
  return this.find({ status });
};

payoutSchema.statics.findBySeller = function (sellerId) {
  return this.find({ sellerId });
};

payoutSchema.statics.findByBuyer = function (buyerId) {
  return this.find({ buyerId });
};

payoutSchema.statics.findByDateRange = function (startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  });
};

payoutSchema.statics.getPayoutStats = async function (sellerId = null) {
  const matchStage = sellerId ? { sellerId } : {};

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$sellerPayoutAmount" },
        totalCommission: { $sum: "$commissionAmount" },
      },
    },
  ]);
};

const Payout = mongoose.model("Payout", payoutSchema);

export default Payout;
