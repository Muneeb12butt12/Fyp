import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';

const router = express.Router();

// Debug middleware to check requests
router.use((req, res, next) => {
  console.log('Incoming order data:', req.body);
  next();
});

// Create new order
router.post('/', async (req, res, next) => {
  try {
    // Basic validation
    if (!req.body.items || !req.body.items.length) {
      return res.status(400).json({ error: 'At least one item is required' });
    }

    // Create order
    const order = new Order({
      orderId: `ORD-${Date.now()}`,
      customer: {
        firstName: req.body.firstName || 'Unknown',
        lastName: req.body.lastName || 'Customer',
        email: req.body.email || 'no-email@example.com',
        phone: req.body.phone || '0000000000',
        address: req.body.address || 'Not specified',
        city: req.body.city || 'Not specified',
        country: req.body.country || 'Not specified',
        zipCode: req.body.zipCode || '00000',
        paymentMethod: req.body.paymentMethod || 'cash',
        shippingMethod: req.body.shippingMethod || 'standard'
      },
      items: req.body.items.map(item => ({
        productId: item.id || '000',
        title: item.title || 'Untitled',
        price: item.price || 0,
        quantity: item.quantity || 1
      })),
      subtotal: req.body.cartTotal || 0,
      shippingCost: req.body.shippingMethod === 'express' ? 9.99 : 0,
      total: (req.body.cartTotal || 0) + (req.body.shippingMethod === 'express' ? 9.99 : 0)
    });

    // Save with debug
    console.log('Attempting to save order:', order);
    const savedOrder = await order.save();
    console.log('Order saved successfully:', savedOrder._id);

    res.status(201).json({
      success: true,
      orderId: savedOrder.orderId
    });

  } catch (error) {
    console.error('Order save error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    next(error);
  }
});

export default router;