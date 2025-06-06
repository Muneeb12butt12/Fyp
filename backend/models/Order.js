
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    shippingMethod: { type: String, required: true }
  },
  items: [{
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    selectedColor: { type: String },
    selectedSize: { type: String },
    img: { type: String },
    customization: {
      text: { type: String },
      logo: {
        image: { type: String },
        position: { type: String }
      }
    }
  }],
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, default: 'Processing' },
  date: { type: Date, default: Date.now },
  estimatedDelivery: { type: Date }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
