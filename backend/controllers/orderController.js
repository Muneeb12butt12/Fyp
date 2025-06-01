import Order from '../models/Order.js';

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      status: 'Processing'
    });
    
    await order.save();
    
    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};