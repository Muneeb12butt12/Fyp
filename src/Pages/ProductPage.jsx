import React from 'react';
import { Link } from 'react-router-dom';

const ProductPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-5 font-sans">
      {/* Product Details Section */}
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        {/* Product Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">ABSTRACT PRINT SHIRT</h1>
        {/* Product Price */}
        <p className="text-2xl text-gray-700 mb-6">$99</p>
        <p className="text-gray-500 mb-6">MRP incl. of all taxes</p>

        {/* Product Description */}
        <p className="text-gray-600 mb-8">
          Relaxed-fit shirt. Camp collar and short sleeves. Button-up front.
        </p>

        {/* Color Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Color</h2>
          <div className="flex space-x-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
            <div className="w-10 h-10 bg-red-500 rounded-full"></div>
            <div className="w-10 h-10 bg-green-500 rounded-full"></div>
          </div>
        </div>

        {/* Size Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Size</h2>
          <div className="flex space-x-4">
            <button className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300">
              XS
            </button>
            <button className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300">
              S
            </button>
            <button className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300">
              M
            </button>
            <button className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300">
              L
            </button>
            <button className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300">
              XL
            </button>
            <button className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300">
              2XL
            </button>
          </div>
        </div>

        {/* Size Guide Link */}
        <div className="mb-8">
          <a href="#" className="text-blue-500 hover:underline">
            FIND YOUR SIZE | MEASUREMENT GUIDE
          </a>
        </div>

        {/* Add to Cart Button */}
        <button className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-300">
          <Link
                      to="/SmartCart"
                      className=" hover:underline"
                    >
                    ADD TO CART
                    </Link>
          
        </button>
      </div>
    </div>
  );
};

export default ProductPage;