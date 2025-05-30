import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  },
  customer: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        message: 'Invalid email format'
      }
    },
    phone: { 
      type: String, 
      required: true,
      validate: {
        validator: (phone) => /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(phone),
        message: 'Invalid phone number format'
      }
    },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    paymentMethod: { 
      type: String, 
      required: true,
      enum: ['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'],
      default: 'credit_card'
    },
    shippingMethod: {
      type: String,
      required: true,
      enum: ['standard', 'express'],
      default: 'standard'
    }
  },
  items: [{
    productId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    price: { 
      type: Number, 
      required: true,
      min: [0, 'Price must be positive']
    },
    quantity: { 
      type: Number, 
      default: 1,
      min: [1, 'Quantity must be at least 1']
    },
    selectedColor: { type: String, trim: true },
    selectedSize: { type: String, trim: true },
    img: { type: String, trim: true },
    customization: {
      text: { type: String, trim: true },
      logo: {
        image: { type: String, trim: true },
        position: { type: String, trim: true }
      }
    }
  }],
  subtotal: { 
    type: Number, 
    required: true,
    min: [0, 'Subtotal must be positive']
  },
  shippingCost: { 
    type: Number, 
    required: true,
    min: [0, 'Shipping cost must be positive']
  },
  total: { 
    type: Number, 
    required: true,
    min: [0, 'Total must be positive']
  },
  status: { 
    type: String, 
    default: 'Processing',
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded']
  },
  date: { type: Date, default: Date.now },
  estimatedDelivery: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strict: false // Allows saving fields not defined in schema
});

// Create collection explicitly if not exists
orderSchema.set('autoCreate', true);

// Add indexes
orderSchema.index({ orderId: 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ date: -1 });
orderSchema.index({ status: 1 });

// Pre-save hook with error handling
orderSchema.pre('save', function(next) {
  try {
    // Auto-calculate total
    if (this.isModified('subtotal') || this.isModified('shippingCost')) {
      this.total = this.subtotal + this.shippingCost;
    }
    
    console.log(`Attempting to save order ${this.orderId}`);
    next();
  } catch (error) {
    console.error('Pre-save error:', error);
    next(error);
  }
});

// Post-save hook for verification
orderSchema.post('save', function(doc, next) {
  console.log(`Order ${doc.orderId} saved successfully`);
  next();
});

const Order = mongoose.model('Order', orderSchema, 'orders'); // Explicit collection name

export default Order;