import express from "express";
import multer from "multer";
import path from "path";
import {
  createPaymentAndOrder,
  getSellerPaymentDetails,
  getPendingPayments,
  approvePayment,
  getBuyerOrders,
  getSellerOrders,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/payments/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "payment-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Routes
router.post(
  "/create-payment-order",
  protect,
  upload.single("paymentScreenshot"),
  createPaymentAndOrder
);

router.get(
  "/seller-payment-details/:sellerId",
  protect,
  getSellerPaymentDetails
);

router.get("/pending-payments", protect, getPendingPayments);

router.patch("/approve-payment/:paymentId", protect, approvePayment);

router.get("/buyer-orders", protect, getBuyerOrders);

router.get("/seller-orders", protect, getSellerOrders);

export default router;
