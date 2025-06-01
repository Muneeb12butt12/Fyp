import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [100, 'Product title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be positive']
  },
  discountPrice: {
    type: Number,
    validate: {
      validator: function(value) {
        return value < this.price;
      },
      message: 'Discount price must be less than regular price'
    }
  },
  images: [{
    type: String,
    required: [true, 'At least one product image is required']
  }],
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: {
      values: ['Electronics', 'Clothing', 'Home', 'Beauty', 'Sports', 'Other'],
      message: 'Invalid product category'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: [0, 'Stock cannot be negative']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Product seller is required']
  },
  ratings: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true
    },
    comment: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  specifications: [{
    key: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ seller: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
productSchema.index({ createdAt: -1 });

// Virtual for discounted price calculation
productSchema.virtual('finalPrice').get(function() {
  return this.discountPrice || this.price;
});

// Virtual for review count
productSchema.virtual('reviewCount').get(function() {
  return this.reviews.length;
});

// Middleware to update seller's productIds when a product is created
productSchema.post('save', async function(doc) {
  try {
    await mongoose.model('User').findByIdAndUpdate(
      doc.seller,
      { $addToSet: { productIds: doc._id } },
      { new: true }
    );
  } catch (error) {
    console.error('Error updating seller productIds:', error);
  }
});

// Middleware to remove product from seller's productIds when deleted
productSchema.post('remove', async function(doc) {
  try {
    await mongoose.model('User').findByIdAndUpdate(
      doc.seller,
      { $pull: { productIds: doc._id } },
      { new: true }
    );
  } catch (error) {
    console.error('Error removing product from seller:', error);
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;