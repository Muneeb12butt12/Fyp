const { body, validationResult } = require('express-validator');

const validateOrder = [
  // Customer validation
  body('customer.firstName').notEmpty().withMessage('First name is required'),
  body('customer.lastName').notEmpty().withMessage('Last name is required'),
  body('customer.email').isEmail().withMessage('Valid email is required'),
  body('customer.phone').notEmpty().withMessage('Phone number is required'),

  // Shipping address validation
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('ZIP code is required'),

  // Order items validation
  body('orderItems').isArray({ min: 1 }).withMessage('At least one order item is required'),
  body('orderItems.*.productId').notEmpty().withMessage('Product ID is required'),
  body('orderItems.*.name').notEmpty().withMessage('Product name is required'),
  body('orderItems.*.price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  body('orderItems.*.quantity').isInt({ gt: 0 }).withMessage('Quantity must be at least 1'),

  // Payment validation
  body('paymentMethod').isIn(['credit-card', 'paypal']).withMessage('Invalid payment method'),
  body('shippingMethod').isIn(['standard', 'express']).withMessage('Invalid shipping method'),
  body('shippingPrice').isFloat({ min: 0 }).withMessage('Shipping price must be 0 or greater'),
  body('taxPrice').isFloat({ min: 0 }).withMessage('Tax price must be 0 or greater'),
  body('totalPrice').isFloat({ gt: 0 }).withMessage('Total price must be greater than 0'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateOrder };