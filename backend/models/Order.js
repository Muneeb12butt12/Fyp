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
      ref: "Buyer",
      required: true,
    },
    sellerOrders: [
      {
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
        subtotal: {
          type: Number,
          required: true,
          min: [0, "Subtotal cannot be negative"],
        },
        shippingCost: {
          type: Number,
          default: 0,
          min: [0, "Shipping cost cannot be negative"],
        },
        tax: {
          type: Number,
          default: 0,
          min: [0, "Tax cannot be negative"],
        },
        totalAmount: {
          type: Number,
          required: true,
          min: [0, "Total amount cannot be negative"],
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
        shippingInfo: {
          method: {
            type: String,
            enum: ["standard", "express", "overnight"],
            default: "standard",
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
        paymentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Payment",
        },
        payoutId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Payout",
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

// Update buyer and seller orders arrays when order is created
orderSchema.post("save", async function (doc) {
  try {
    const Buyer = mongoose.model("Buyer");
    const Seller = mongoose.model("Seller");
    const Admin = mongoose.model("Admin");

    // Add order to buyer's orders array if not already present
    await Buyer.findByIdAndUpdate(doc.buyer, {
      $addToSet: { orders: doc._id },
    });

    // Add order to each seller's orders array
    for (const sellerOrder of doc.sellerOrders) {
      const admin = await Admin.findById(sellerOrder.seller);
      if (admin) {
        // Add order to admin's orders array if not already present
        await Admin.findByIdAndUpdate(sellerOrder.seller, {
          $addToSet: { orders: doc._id },
        });
      } else {
        // Add order to seller's orders array if not already present
        await Seller.findByIdAndUpdate(sellerOrder.seller, {
          $addToSet: { orders: doc._id },
        });
      }
    }
  } catch (error) {
    console.error("Error updating buyer/seller orders arrays:", error);
  }
});

// Remove order from buyer and seller orders arrays when order is deleted
orderSchema.post("remove", async function (doc) {
  try {
    const Buyer = mongoose.model("Buyer");
    const Seller = mongoose.model("Seller");
    const Admin = mongoose.model("Admin");

    // Remove order from buyer's orders array
    await Buyer.findByIdAndUpdate(doc.buyer, { $pull: { orders: doc._id } });

    // Remove order from each seller's orders array
    for (const sellerOrder of doc.sellerOrders) {
      const admin = await Admin.findById(sellerOrder.seller);
      if (admin) {
        await Admin.findByIdAndUpdate(sellerOrder.seller, {
          $pull: { orders: doc._id },
        });
      } else {
        await Seller.findByIdAndUpdate(sellerOrder.seller, {
          $pull: { orders: doc._id },
        });
      }
    }
  } catch (error) {
    console.error("Error removing order from buyer/seller arrays:", error);
  }
});

// Method to calculate total amount
orderSchema.methods.calculateTotal = function () {
  // Calculate subtotal from all seller orders
  const subtotal = this.sellerOrders.reduce(
    (sum, sellerOrder) => sum + sellerOrder.subtotal,
    0
  );
  this.subtotal = subtotal;
  this.totalAmount = subtotal + this.tax - this.discount;
  return this.totalAmount;
};

// Method to calculate seller order totals
orderSchema.methods.calculateSellerOrderTotals = function () {
  this.sellerOrders.forEach((sellerOrder) => {
    const itemSubtotal = sellerOrder.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    sellerOrder.subtotal = itemSubtotal;
    sellerOrder.totalAmount =
      itemSubtotal + sellerOrder.shippingCost + sellerOrder.tax;
  });
  return this.sellerOrders;
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

// Method to update seller order status
orderSchema.methods.updateSellerOrderStatus = async function (
  sellerOrderIndex,
  newStatus,
  note = "",
  updatedBy = null
) {
  if (this.sellerOrders[sellerOrderIndex]) {
    this.sellerOrders[sellerOrderIndex].status = newStatus;
    this.sellerOrders[sellerOrderIndex].timeline.push({
      status: newStatus,
      date: new Date(),
      note,
      updatedBy,
    });
    return this.save();
  }
  throw new Error("Seller order not found");
};

// Method to update item status within a seller order
orderSchema.methods.updateItemStatus = async function (
  sellerOrderIndex,
  itemIndex,
  newStatus
) {
  if (
    this.sellerOrders[sellerOrderIndex] &&
    this.sellerOrders[sellerOrderIndex].items[itemIndex]
  ) {
    this.sellerOrders[sellerOrderIndex].items[itemIndex].status = newStatus;
    return this.save();
  }
  throw new Error("Item not found in seller order");
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

// Method to update shipping status for a specific seller order
orderSchema.methods.updateSellerOrderShippingStatus = async function (
  sellerOrderIndex,
  newStatus,
  trackingNumber = null,
  carrier = null
) {
  if (this.sellerOrders[sellerOrderIndex]) {
    this.sellerOrders[sellerOrderIndex].shippingInfo.status = newStatus;
    if (trackingNumber) {
      this.sellerOrders[sellerOrderIndex].shippingInfo.trackingNumber =
        trackingNumber;
    }
    if (carrier) {
      this.sellerOrders[sellerOrderIndex].shippingInfo.carrier = carrier;
    }
    if (newStatus === "delivered") {
      this.sellerOrders[sellerOrderIndex].shippingInfo.actualDelivery =
        new Date();
    }
    return this.save();
  }
  throw new Error("Seller order not found");
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
orderSchema.methods.requestItemReturn = async function (
  sellerOrderIndex,
  itemIndex,
  reason
) {
  if (
    this.sellerOrders[sellerOrderIndex] &&
    this.sellerOrders[sellerOrderIndex].items[itemIndex]
  ) {
    this.sellerOrders[sellerOrderIndex].items[itemIndex].returnRequest = {
      requested: true,
      reason,
      status: "pending",
      date: new Date(),
    };
    return this.save();
  }
  throw new Error("Item not found in order");
};

// Method to get seller-specific order data
orderSchema.methods.getSellerOrderData = function (sellerId) {
  return this.sellerOrders.find(
    (sellerOrder) => sellerOrder.seller.toString() === sellerId.toString()
  );
};

// Method to check if all seller orders are delivered
orderSchema.methods.areAllSellerOrdersDelivered = function () {
  return this.sellerOrders.every(
    (sellerOrder) => sellerOrder.status === "delivered"
  );
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
  return this.find({ "sellerOrders.seller": sellerId });
};

const Order = mongoose.model("Order", orderSchema);

export default Order;
