import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price cannot be negative"],
        },
        variant: {
          color: String,
          size: String,
        },
        customization: {
          enabled: {
            type: Boolean,
            default: false,
          },
          options: [
            {
              name: String,
              type: String,
              value: String,
            },
          ],
        },
        status: {
          type: String,
          enum: [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "returned",
          ],
          default: "pending",
        },
        returnRequest: {
          requested: {
            type: Boolean,
            default: false,
          },
          reason: String,
          status: {
            type: String,
            enum: ["pending", "approved", "rejected", "completed"],
            default: "pending",
          },
          date: Date,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
    shippingAddress: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      additionalInfo: String,
      isDefault: {
        type: Boolean,
        default: false,
      },
    },
    billingAddress: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      additionalInfo: String,
    },
    paymentInfo: {
      method: {
        type: String,
        enum: [
          "credit_card",
          "debit_card",
          "paypal",
          "stripe",
          "cash_on_delivery",
        ],
        required: true,
      },
      status: {
        type: String,
        enum: [
          "pending",
          "completed",
          "failed",
          "refunded",
          "partially_refunded",
        ],
        default: "pending",
      },
      transactionId: String,
      paymentDate: Date,
      cardDetails: {
        last4: String,
        brand: String,
        expiryMonth: Number,
        expiryYear: Number,
      },
      refundHistory: [
        {
          amount: Number,
          reason: String,
          date: Date,
          status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
          },
        },
      ],
    },
    shippingInfo: {
      method: {
        type: String,
        enum: ["standard", "express", "overnight"],
        default: "standard",
      },
      cost: {
        type: Number,
        default: 0,
        min: [0, "Shipping cost cannot be negative"],
      },
      status: {
        type: String,
        enum: [
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "returned",
        ],
        default: "pending",
      },
      trackingNumber: String,
      carrier: String,
      estimatedDelivery: Date,
      actualDelivery: Date,
      deliveryAttempts: {
        type: Number,
        default: 0,
      },
      deliveryNotes: String,
      returnShipping: {
        trackingNumber: String,
        carrier: String,
        status: {
          type: String,
          enum: ["pending", "in_transit", "delivered"],
          default: "pending",
        },
        date: Date,
      },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "placed",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
        "partially_refunded",
        "returned",
      ],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    discountCode: {
      code: String,
      amount: Number,
      type: {
        type: String,
        enum: ["percentage", "fixed"],
        default: "fixed",
      },
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, "Tax cannot be negative"],
    },
    taxDetails: {
      rate: Number,
      type: String,
      jurisdiction: String,
    },
    refundInfo: {
      requested: {
        type: Boolean,
        default: false,
      },
      reason: String,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "completed"],
      },
      amount: Number,
      date: Date,
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      notes: String,
    },
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
          ref: "User",
        },
      },
    ],
    notifications: [
      {
        type: {
          type: String,
          enum: ["email", "sms", "push"],
          required: true,
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
    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      date: Date,
      images: [String],
    },
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
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique order number
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
  next();
});

// Add status to timeline when status changes
orderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.timeline.push({
      status: this.status,
      date: new Date(),
    });
  }
  next();
});

// Method to calculate total amount
orderSchema.methods.calculateTotal = function () {
  const subtotal = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  this.subtotal = subtotal;
  this.totalAmount =
    subtotal + this.shippingInfo.cost + this.tax - this.discount;
  return this.totalAmount;
};

// Method to update order status
orderSchema.methods.updateStatus = async function (
  newStatus,
  note = "",
  updatedBy = null
) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    date: new Date(),
    note,
    updatedBy,
  });
  return this.save();
};

// Method to process refund
orderSchema.methods.processRefund = async function (
  reason,
  amount,
  processedBy,
  notes = ""
) {
  this.refundInfo = {
    requested: true,
    reason,
    status: "pending",
    amount,
    date: new Date(),
    processedBy,
    notes,
  };
  return this.save();
};

// Method to update shipping status
orderSchema.methods.updateShippingStatus = async function (
  newStatus,
  trackingNumber = null,
  carrier = null
) {
  this.shippingInfo.status = newStatus;
  if (trackingNumber) {
    this.shippingInfo.trackingNumber = trackingNumber;
  }
  if (carrier) {
    this.shippingInfo.carrier = carrier;
  }
  if (newStatus === "delivered") {
    this.shippingInfo.actualDelivery = new Date();
  }
  return this.save();
};

// Method to add notification
orderSchema.methods.addNotification = async function (type, content) {
  this.notifications.push({
    type,
    content,
    date: new Date(),
  });
  return this.save();
};

// Method to add review
orderSchema.methods.addReview = async function (rating, comment, images = []) {
  this.review = {
    rating,
    comment,
    date: new Date(),
    images,
  };
  return this.save();
};

// Method to request return for an item
orderSchema.methods.requestItemReturn = async function (itemIndex, reason) {
  if (this.items[itemIndex]) {
    this.items[itemIndex].returnRequest = {
      requested: true,
      reason,
      status: "pending",
      date: new Date(),
    };
    return this.save();
  }
  throw new Error("Item not found in order");
};

// Static method to find orders by date range
orderSchema.statics.findByDateRange = function (startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  });
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function (status) {
  return this.find({ status });
};

// Static method to find orders by buyer
orderSchema.statics.findByBuyer = function (buyerId) {
  return this.find({ buyer: buyerId });
};

// Static method to find orders by seller
orderSchema.statics.findBySeller = function (sellerId) {
  return this.find({ seller: sellerId });
};

const Order = mongoose.model("Order", orderSchema);

export default Order;
