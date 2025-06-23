import express from "express";
import rateLimit from "express-rate-limit";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  register,
  login,
  checkAdminExists,
  getAdminDetailsForCheckout,
  getLoginHistory,
  logout,
  getProfile,
  getUnverifiedSellers,
  verifySeller,
  suspendSeller,
  getAllBuyers,
  getAllSellers,
  getUserStats,
  toggleBuyerStatus,
  getUserDetails,
  activateSeller,
  getSellerDetails,
  addBankAccount,
  addWallet,
  setDefaultBankAccount,
  setDefaultWallet,
  removeBankAccount,
  removeWallet,
  updateAdminProfile,
  getAdminOrders,
} from "../controllers/adminController.js";
import { getDashboardStats } from "../controllers/dashboardController.js";
import sessionMiddleware from "../middleware/sessionMiddleware.js";

const router = express.Router();

// Rate limiting configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes",
  },
});

// Public routes
router.post("/register", register);
router.post("/login", loginLimiter, login);
router.get("/check", checkAdminExists);
router.get("/checkout-details", getAdminDetailsForCheckout);

// Protected routes - apply protect and admin middleware to all routes below
router.use(protect);
router.use(admin);

// Dashboard and profile routes
router.get("/dashboard/stats", getDashboardStats);
router.get("/profile", getProfile);
router.put("/profile", updateAdminProfile);

// Admin orders route
router.get("/orders", getAdminOrders);

// Bank account management routes
router.post("/bank-accounts", addBankAccount);
router.put("/bank-accounts/:accountId/default", setDefaultBankAccount);
router.delete("/bank-accounts/:accountId", removeBankAccount);

// Wallet management routes
router.post("/wallets", addWallet);
router.put("/wallets/:walletId/default", setDefaultWallet);
router.delete("/wallets/:walletId", removeWallet);

// Seller management routes (no session tracking needed)
router.get("/sellers/unverified", getUnverifiedSellers);
router.get("/sellers/:sellerId", getSellerDetails);
router.post("/sellers/:sellerId/verify", verifySeller);
router.post("/sellers/:sellerId/suspend", suspendSeller);

// User management routes (no session tracking needed)
router.get("/buyers", getAllBuyers);
router.get("/sellers", getAllSellers);
router.get("/users/:userId/stats", getUserStats);
router.post("/users/:userId/toggle-status", toggleBuyerStatus);
router.get("/users/:userId/details", getUserDetails);
router.post("/sellers/:sellerId/activate", activateSeller);

// Session routes (only for login history and logout)
router.use(sessionMiddleware);
router.get("/login-history", getLoginHistory);
router.post("/logout", logout);

export default router;
