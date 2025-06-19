import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

// Get user's cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "title images price")
      .lean();

    if (!cart) {
      return res.status(200).json({ items: [], totalAmount: 0 });
    }

    res.status(200).json(cart);
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
    });

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
          quantity,
          color,
          size,
          price: product.price,
        });
      }
    }

    await cart.save();
    await cart.populate("items.product", "title images price");

    res.status(200).json(cart);
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
    await cart.populate("items.product", "title images price");

    res.status(200).json(cart);
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
    await cart.populate("items.product", "title images price");

    res.status(200).json(cart);
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
    const { items, sellerId } = req.body;
    const buyerId = req.user._id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    if (!sellerId) {
      return res.status(400).json({ message: "Seller ID is required" });
    }

    // Validate each item in cart
    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      if (!item.product || !item.quantity || !item.price) {
        return res
          .status(400)
          .json({
            message: "Each item must have product, quantity, and price",
          });
      }

      // Check if product exists and belongs to the seller
      const product = await Product.findOne({
        _id: item.product,
        seller: sellerId,
        isActive: true,
      });

      if (!product) {
        return res
          .status(400)
          .json({
            message: `Product ${item.name || item.product} is not available`,
          });
      }

      // Validate quantity
      if (item.quantity < 1) {
        return res
          .status(400)
          .json({ message: "Item quantity must be at least 1" });
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}` });
      }

      // Validate price
      if (Math.abs(product.price - item.price) > 0.01) {
        return res
          .status(400)
          .json({ message: `Price mismatch for ${product.name}` });
      }

      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        images: product.images,
        variant: item.variant || {},
      });

      subtotal += product.price * item.quantity;
    }

    const shippingCost = 10;
    const totalAmount = subtotal + shippingCost;

    return res.status(200).json({
      success: true,
      message: "Cart validated successfully",
      data: {
        validatedItems,
        subtotal,
        shippingCost,
        totalAmount,
        itemCount: items.length,
      },
    });
  } catch (error) {
    console.error("Error validating cart:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get cart summary
const getCartSummary = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Items array is required" });
    }

    let subtotal = 0;
    let itemCount = 0;

    for (const item of items) {
      if (item.price && item.quantity) {
        subtotal += item.price * item.quantity;
        itemCount += item.quantity;
      }
    }

    const shippingCost = 10;
    const totalAmount = subtotal + shippingCost;

    return res.status(200).json({
      success: true,
      message: "Cart summary calculated successfully",
      data: {
        subtotal,
        shippingCost,
        totalAmount,
        itemCount,
      },
    });
  } catch (error) {
    console.error("Error calculating cart summary:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
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
