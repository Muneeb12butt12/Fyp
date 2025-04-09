import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ProductPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productData } = location.state || {};
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  if (!productData) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-5 font-sans">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-500 hover:underline flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Products
        </button>

        <div className="bg-white p-8 rounded-lg shadow-md flex flex-col md:flex-row gap-8">
          {/* Product Image */}
          <div className="md:w-1/2 flex justify-center">
            <img 
              src={productData.img} 
              alt={productData.title} 
              className="max-w-full h-96 object-contain"
            />
          </div>

          {/* Product Details */}
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{productData.title}</h1>
            <p className="text-2xl text-gray-700 mb-4">${productData.price}</p>
            <p className="text-gray-500 mb-6">MRP incl. of all taxes</p>

            <p className="text-gray-600 mb-8">{productData.description}</p>

            {/* Color Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Color</h2>
              <div className="flex space-x-4">
                {productData.colors.map((color) => (
                  <div 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full cursor-pointer ${selectedColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Size</h2>
              <div className="flex flex-wrap gap-2">
                {productData.sizes.map((size) => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-10 rounded-lg flex items-center justify-center ${
                      selectedSize === size 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Guide */}
            <div className="mb-8">
              <a href="#" className="text-blue-500 hover:underline text-sm">
                FIND YOUR SIZE | MEASUREMENT GUIDE
              </a>
            </div>

            {/* Add to Cart Button */}
            <button 
              className="w-full bg-primary text-white p-3 rounded-lg hover:bg-primary-dark transition duration-300 disabled:opacity-50"
              disabled={!selectedColor || !selectedSize}
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;