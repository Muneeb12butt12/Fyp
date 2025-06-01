import express from 'express';
import Order from '../models/Order.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Create new order (no auth required for checkout)
router.post('/', async (req, res, next) => {
  try {
    // Generate a unique order ID
    const orderId = `ORD-${Math.floor(Math.random() * 1000000)}`;
    
    // Calculate estimated delivery date (3-7 days from now)
    const deliveryDays = req.body.shippingMethod === 'express' ? 3 : 7;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays);

    // Create new order
    const order = new Order({
      orderId,
      customer: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        country: req.body.country,
        zipCode: req.body.zipCode,
        paymentMethod: req.body.paymentMethod,
        shippingMethod: req.body.shippingMethod
      },
      items: req.body.items.map(item => ({
        productId: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity || 1,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        img: item.img,
        customization: item.customization
      })),
      subtotal: req.body.cartTotal,
      shippingCost: req.body.shippingMethod === 'express' ? 9.99 : 0,
      total: req.body.shippingMethod === 'express' ? req.body.cartTotal + 9.99 : req.body.cartTotal,
      estimatedDelivery
    });

    await order.save();

    res.status(201).json({
      success: true,
      order: {
        orderId: order.orderId,
        customer: `${order.customer.firstName} ${order.customer.lastName}`,
        items: order.items,
        total: order.total,
        date: order.date,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all orders (protected, admin/seller only)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    // Check if user is admin/seller
    if (!req.user.isAdmin && !req.user.isSeller) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access',
        code: 'UNAUTHORIZED'
      });
    }

    const orders = await Order.find().sort({ date: -1 });
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
});

// Get order details (protected - user can see their own orders, admin/seller can see all)
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        code: 'ORDER_NOT_FOUND'
      });
    }

    // Check if user is admin/seller or the order belongs to them
    const isCustomer = order.customer.email === req.user.email;
    if (!req.user.isAdmin && !req.user.isSeller && !isCustomer) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access',
        code: 'UNAUTHORIZED'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
});

// Update order status (admin/seller only)
router.patch('/:id/status', authMiddleware, async (req, res, next) => {
  try {
    // Check if user is admin/seller
    if (!req.user.isAdmin && !req.user.isSeller) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access',
        code: 'UNAUTHORIZED'
      });
    }

    const { status } = req.body;
    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value',
        code: 'INVALID_STATUS',
        validStatuses
      });
    }

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.id },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        code: 'ORDER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
});

// Get sales statistics (admin/seller only)
router.get('/stats/sales', authMiddleware, async (req, res, next) => {
  try {
    // Check if user is admin/seller
    if (!req.user.isAdmin && !req.user.isSeller) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access',
        code: 'UNAUTHORIZED'
      });
    }

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const recentOrders = await Order.find()
      .sort({ date: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;