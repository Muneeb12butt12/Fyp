import express from "express";
import { protect, admin, seller } from "../middleware/authMiddleware.js";
import {
  createPayout,
  approvePayout,
  getAllPayouts,
  getSellerPayouts,
  getPayoutById,
  getPayoutStats,
  requestWithdrawal,
  approveWithdrawal,
  getSellerWithdrawals,
  getAllWithdrawals,
  getSellerBalance,
  getAdminCommissionBalance,
} from "../controllers/payoutController.js";

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Payout routes
router.post("/orders/:orderId/:sellerOrderIndex/create", admin, createPayout);
router.put("/:payoutId/approve", admin, approvePayout);
router.get("/", admin, getAllPayouts);
router.get("/seller", seller, getSellerPayouts);
router.get("/stats", getPayoutStats);
router.get("/:payoutId", getPayoutById);

// Withdrawal routes
router.post("/withdrawals/request", seller, requestWithdrawal);
router.put("/withdrawals/:withdrawalId/approve", admin, approveWithdrawal);
router.get("/withdrawals/seller", seller, getSellerWithdrawals);
router.get("/withdrawals", admin, getAllWithdrawals);

// Balance routes
router.get("/balance/seller", seller, getSellerBalance);
router.get("/balance/admin", admin, getAdminCommissionBalance);

export default router;
