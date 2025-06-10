import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getOrders,
  getOrderById,
  updateOrderToDelivered,
  deleteOrder
} from '../controllers/adminController.js';

const router = express.Router();

// User routes
router.route('/users')
  .get(protect, admin, getUsers);

router.route('/users/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

// Order routes
router.route('/orders')
  .get(protect, admin, getOrders);

router.route('/orders/:id')
  .get(protect, admin, getOrderById)
  .put(protect, admin, updateOrderToDelivered)
  .delete(protect, admin, deleteOrder);

export default router;