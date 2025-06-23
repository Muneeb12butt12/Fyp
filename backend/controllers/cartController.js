import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

// Get user's cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate([
        { path: "items.product", select: "title images price" },
        {
          path: "items.seller",
          select: "fullName email businessInfo.businessName",
        },
      ])
      .lean();

    if (!cart) {
      return res.status(200).json({
        items: [],
        totalAmount: 0,
        validation: { isValid: false, sellerCount: 0, sellerGroups: [] },
      });
    }

    // Add validation info
    const tempCart = new Cart(cart);
    const validation = tempCart.validateMultiSellerCart();

    res.status(200).json({
      ...cart,
      validation,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity, color, size } = req.body;

    const product = await Product.findOne({
      _id: productId,
      status: "approved",
      isActive: true,
    }).populate("seller", "fullName email businessInfo.businessName");

    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found or not available" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [
          {
            product: productId,
            seller: product.seller._id,
            quantity,
            color,
            size,
            price: product.price,
          },
        ],
      });
    } else {
      const existingItemIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.color === color &&
          item.size === size
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({
          product: productId,
          seller: product.seller._id,
          quantity,
          color,
          size,
          price: product.price,
        });
      }
    }

    await cart.save();
    await cart.populate([
      { path: "items.product", select: "title images price" },
      {
        path: "items.seller",
        select: "fullName email businessInfo.businessName",
      },
    ]);

    // Get cart validation info
    const validation = cart.validateMultiSellerCart();

    res.status(200).json({
      ...cart.toObject(),
      validation,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding to cart", error: error.message });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate([
      { path: "items.product", select: "title images price" },
      {
        path: "items.seller",
        select: "fullName email businessInfo.businessName",
      },
    ]);

    // Get cart validation info
    const validation = cart.validateMultiSellerCart();

    res.status(200).json({
      ...cart.toObject(),
      validation,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cart", error: error.message });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();
    await cart.populate([
      { path: "items.product", select: "title images price" },
      {
        path: "items.seller",
        select: "fullName email businessInfo.businessName",
      },
    ]);

    // Get cart validation info
    const validation = cart.validateMultiSellerCart();

    res.status(200).json({
      ...cart.toObject(),
      validation,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing from cart", error: error.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
};

// Validate cart for checkout
const validateCartForCheckout = async (req, res) => {
  try {
    const buyerId = req.user._id;

    const cart = await Cart.findOne({ user: buyerId }).populate([
      { path: "items.product", select: "title images price seller" },
      {
        path: "items.seller",
        select: "fullName email businessInfo.businessName",
      },
    ]);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Get cart validation info
    const validation = cart.validateMultiSellerCart();

    if (!validation.isValid) {
      return res.status(400).json({ message: "Cart is invalid" });
    }

    // Validate each item in cart
    const validatedItems = [];
    let totalSubtotal = 0;

    for (const item of cart.items) {
      if (!item.product || !item.quantity || !item.price) {
        return res.status(400).json({
          message: "Each item must have product, quantity, and price",
        });
      }

      // Check if product exists and is active
      const product = await Product.findOne({
        _id: item.product._id,
        status: "approved",
        isActive: true,
      });

      if (!product) {
        return res.status(400).json({
          message: `Product ${item.product.title} is not available`,
        });
      }

      // Check if product belongs to the seller
      if (product.seller.toString() !== item.seller._id.toString()) {
        return res.status(400).json({
          message: `Product ${item.product.title} seller mismatch`,
        });
      }

      validatedItems.push({
        product: item.product._id,
        seller: item.seller._id,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        price: item.price,
      });

      totalSubtotal += item.price * item.quantity;
    }

    // Group items by seller for order creation
    const itemsBySeller = {};
    validatedItems.forEach((item) => {
      const sellerId = item.seller.toString();
      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = [];
      }
      itemsBySeller[sellerId].push(item);
    });

    // Convert to array format for order creation
    const cartItems = Object.keys(itemsBySeller).map((sellerId) => ({
      sellerId,
      items: itemsBySeller[sellerId],
    }));

    // Calculate totals for each seller
    const sellerTotals = cartItems.map((sellerGroup) => {
      const subtotal = sellerGroup.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const shippingCost = 10; // Fixed shipping cost per seller
      const tax = subtotal * 0.05; // 5% tax
      const total = subtotal + shippingCost + tax;

      return {
        ...sellerGroup,
        subtotal,
        shippingCost,
        tax,
        total,
      };
    });

    const totalShipping = sellerTotals.reduce(
      (sum, seller) => sum + seller.shippingCost,
      0
    );
    const totalTax = sellerTotals.reduce((sum, seller) => sum + seller.tax, 0);
    const grandTotal = totalSubtotal + totalShipping + totalTax;

    res.status(200).json({
      success: true,
      message: "Cart validated successfully",
      data: {
        cartItems: sellerTotals,
        totalSubtotal,
        totalShipping,
        totalTax,
        grandTotal,
        sellerCount: validation.sellerCount,
        sellerGroups: validation.sellerGroups,
        canProceed: true, // Always true now since we support multiple sellers
      },
    });
  } catch (error) {
    console.error("Error validating cart:", error);
    res
      .status(500)
      .json({ message: "Error validating cart", error: error.message });
  }
};

// Get cart summary
const getCartSummary = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate([
        { path: "items.product", select: "title images price" },
        {
          path: "items.seller",
          select: "fullName email businessInfo.businessName",
        },
      ])
      .lean();

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        itemCount: 0,
        totalAmount: 0,
        sellerCount: 0,
        sellerGroups: [],
      });
    }

    // Create temporary cart instance for validation
    const tempCart = new Cart(cart);
    const validation = tempCart.validateMultiSellerCart();

    // Group items by seller
    const sellerGroups = tempCart.getItemsBySeller();
    const sellerSummaries = Object.keys(sellerGroups).map((sellerId) => {
      const items = sellerGroups[sellerId];
      const seller = items[0].seller; // All items have same seller
      return {
        sellerId,
        sellerName: seller.businessInfo?.businessName || seller.fullName,
        itemCount: items.length,
        subtotal: items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };
    });

    res.status(200).json({
      itemCount: cart.items.length,
      totalAmount: cart.totalAmount,
      sellerCount: validation.sellerCount,
      sellerGroups: sellerSummaries,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cart summary", error: error.message });
  }
};

// Check product availability
const checkProductAvailability = async (req, res) => {
  try {
    const { productId, quantity } = req.params;

    const product = await Product.findById(productId).select(
      "stock price isActive"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.isActive) {
      return res.status(400).json({ message: "Product is not available" });
    }

    const isAvailable = product.stock >= parseInt(quantity);

    return res.status(200).json({
      success: true,
      message: "Product availability checked successfully",
      data: {
        isAvailable,
        availableStock: product.stock,
        requestedQuantity: parseInt(quantity),
        price: product.price,
      },
    });
  } catch (error) {
    console.error("Error checking product availability:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCartForCheckout,
  getCartSummary,
  checkProductAvailability,
};
