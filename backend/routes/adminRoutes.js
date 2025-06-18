import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getDashboardAnalytics
} from '../controllers/adminController.js';

const router = express.Router();

// User routes
router.route('/users')
  .get(protect, admin, getUsers);

router.route('/users/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

router.route('/users/:id/status')
  .patch(protect, admin, toggleUserStatus);

// Order routes
router.route('/orders')
  .get(protect, admin, getOrders);

router.route('/orders/:id')
  .get(protect, admin, getOrderById)
  .delete(protect, admin, deleteOrder);

router.route('/orders/:id/status')
  .patch(protect, admin, updateOrderStatus);

// Dashboard route
router.route('/dashboard')
  .get(protect, admin, getDashboardAnalytics);

export default router;