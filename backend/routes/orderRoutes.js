import express from 'express';
import { 
  createOrder, 
  getOrderById, 
  getMyOrders,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getAllOrders); // Add this line

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/status')
  .patch(protect, admin, updateOrderStatus); // Add this route

export default router;