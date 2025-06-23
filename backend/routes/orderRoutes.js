import express from "express";
import { protect, buyer, seller } from "../middleware/authMiddleware.js";
import {
  createOrder,
  createOrderFromCart,
  getBuyerOrders,
  getSellerOrders,
  getOrderById,
  getSellerOrderDetails,
  updateOrderStatus,
  getOrderStats,
} from "../controllers/orderController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Test route to check if order routes are working
router.get("/test", (req, res) => {
  res.json({ message: "Order routes are working!" });
});

// Create order from cart (buyer only)
router.post(
  "/create-from-cart",
  protect,
  buyer,
  upload.single("paymentScreenshot"),
  createOrderFromCart
);

// Create order (buyer only) - legacy route
router.post(
  "/create",
  protect,
  buyer,
  upload.single("paymentScreenshot"),
  createOrder
);

// Get buyer orders (buyer only)
router.get("/buyer", protect, buyer, getBuyerOrders);

// Get seller orders (seller only)
router.get("/seller", protect, seller, getSellerOrders);

// Get order by ID (buyer or seller who owns the order)
router.get("/:orderId", protect, getOrderById);

// Get seller-specific order details (seller only)
router.get("/seller/:orderId", protect, seller, getSellerOrderDetails);

// Update order status (seller only)
router.patch("/:orderId/status", protect, seller, updateOrderStatus);

// Get order statistics for dashboard
router.get("/stats/dashboard", protect, getOrderStats);

export default router;
