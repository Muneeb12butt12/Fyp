import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String,
    required: true
  }],
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  colors: [{
    type: String
  }],
  sizes: [{
    type: String
  }],
  countInStock: {
    type: Number,
    required: true,
    default: 0
  },
  isCustomizable: {
    type: Boolean,
    default: false
  },
  customizationOptions: {
    text: {
      enabled: Boolean,
      maxLength: Number
    },
    logo: {
      enabled: Boolean,
      maxSize: Number,
      allowedFormats: [String]
    }
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;