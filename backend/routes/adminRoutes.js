import express from "express";
import rateLimit from "express-rate-limit";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  register,
  login,
  checkAdminExists,
  getLoginHistory,
  logout,
  getProfile,
  getUnverifiedSellers,
  verifySeller,
  suspendSeller,
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

// Protected routes - apply protect and admin middleware to all routes below
router.use(protect);
router.use(admin);

// Dashboard and profile routes
router.get("/dashboard/stats", getDashboardStats);
router.get("/profile", getProfile);

// Seller management routes (no session tracking needed)
router.get("/sellers/unverified", getUnverifiedSellers);
router.post("/sellers/:sellerId/verify", verifySeller);
router.post("/sellers/:sellerId/suspend", suspendSeller);

// Session routes (only for login history and logout)
router.use(sessionMiddleware);
router.get("/login-history", getLoginHistory);
router.post("/logout", logout);

export default router;
