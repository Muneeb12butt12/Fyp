import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShoppingCart, FaPalette, FaStar, FaComments } from 'react-icons/fa';
import Navbar from '../components/Navbar/Navbar';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

const ProductPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { productData } = location.state || {};
  const [selectedColor, setSelectedColor] = useState(productData?.variants?.colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(productData?.variants?.sizes?.[0] || null);
  const [activeImage, setActiveImage] = useState(0);

  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
            <button 
              onClick={() => navigate(-1)}
              className="text-primary hover:text-primary/80 flex items-center gap-2 mx-auto"
            >
              <FaArrowLeft />
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Validate product variants
    if (productData.variants?.colors?.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (productData.variants?.sizes?.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    // Prepare product data for cart
    const productToAdd = {
      ...productData,
      selectedColor: selectedColor || productData.variants?.colors?.[0] || null,
      selectedSize: selectedSize || productData.variants?.sizes?.[0] || null,
      quantity: 1,
      sellerId: productData.seller?._id || productData.seller, // Handle both populated and unpopulated seller
      sellerName: productData.seller?.businessInfo?.businessName || productData.seller?.fullName || null
    };

    // Add to cart
    addToCart(productToAdd);
  };

  const handleCustomize = () => {
    navigate(`/product/${productData._id}?customize=true`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 text-primary hover:text-primary/80 flex items-center gap-2"
        >
          <FaArrowLeft />
          Back to Products
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img 
                  src={productData.images?.[activeImage] || "/placeholder-image.jpg"} 
                  alt={productData.name} 
                  className="w-full h-full object-contain"
                />
              </div>
              {productData.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {productData.images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 ${
                        activeImage === index ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${productData.name} - ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {productData.name}
                </h1>
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(4)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-2xl font-bold text-primary mb-2">
                  ${productData.price}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {productData.description}
                </p>

                {/* Seller Information */}
                {productData.seller && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sold by</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {productData.seller.businessInfo?.businessName || productData.seller.fullName || 'Unknown Seller'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          toast.success('Chat feature coming soon!');
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                      >
                        <FaComments />
                        Chat with Seller
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Color Selection */}
              {productData.variants?.colors?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Color</h3>
                  <div className="flex gap-2">
                    {productData.variants.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 ${
                          selectedColor === color
                            ? 'border-primary'
                            : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {productData.variants?.sizes?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {productData.variants.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border-2 ${
                          selectedSize === size
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{productData.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium">{productData.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Material</p>
                    <p className="font-medium">{productData.material}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sport Type</p>
                    <p className="font-medium">{productData.sportType}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                >
                  <FaShoppingCart />
                  Add to Cart
                </button>
                <button
                  onClick={handleCustomize}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"
                >
                  <FaPalette />
                  Customize
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;