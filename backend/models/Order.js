import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    ref: 'Product'
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  color: { type: String },
  size: { type: String },
  customization: {
    text: { type: String },
    logo: {
      image: { type: String },
      position: { type: String }
    }
  }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true,
    sparse: true ,
    default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit-card', 'paypal', 'stripe']
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true,
  autoIndex: false // Prevent automatic index creation
});

// Create index manually with sparse option
orderSchema.index({ orderId: 1 }, { unique: true, sparse: true });

const Order = mongoose.model('Order', orderSchema);

// Create indexes when application starts
Order.createIndexes().catch(err => {
  console.log('Index creation error:', err.message);
});

export default Order;