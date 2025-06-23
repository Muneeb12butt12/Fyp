import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  color: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total amount before saving
cartSchema.pre("save", function (next) {
  this.totalAmount = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  next();
});

// Method to get items grouped by seller
cartSchema.methods.getItemsBySeller = function () {
  const sellerGroups = {};

  this.items.forEach((item) => {
    const sellerId = item.seller.toString();
    if (!sellerGroups[sellerId]) {
      sellerGroups[sellerId] = [];
    }
    sellerGroups[sellerId].push(item);
  });

  return sellerGroups;
};

// Method to validate multi-seller cart
cartSchema.methods.validateMultiSellerCart = function () {
  const sellerGroups = this.getItemsBySeller();
  const sellerIds = Object.keys(sellerGroups);

  return {
    isValid: sellerIds.length > 0,
    sellerCount: sellerIds.length,
    sellerGroups: sellerIds.map((sellerId) => ({
      sellerId,
      itemCount: sellerGroups[sellerId].length,
      subtotal: sellerGroups[sellerId].reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    })),
  };
};

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
