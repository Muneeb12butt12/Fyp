import React from 'react';
import shirt1 from '../assets/shirt/shirt.png'; // Import product images
import shirt2 from '../assets/shirt/shirt2.png';

const CheckoutPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-5 font-sans">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">CHECKOUT</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Left Column - Information Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">INFORMATION</h2>

          {/* Shipping Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">SHIPPING</h3>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="First Name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Country"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="State / Region"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Address"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="City"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Postal Code"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">PAYMENT</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Card Number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Expiry Date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">YOUR ORDER</h2>

          {/* Order Items */}
          <div className="space-y-4">
            {/* Item 1 */}
            <div className="flex items-center space-x-4">
              <img src={shirt1} alt="Basic Heavy T-Shirt" className="w-16 h-16 object-cover rounded-lg" />
              <div>
                <p className="text-gray-800 font-semibold">Basic Heavy T-Shirt</p>
                <p className="text-gray-600">Black/L</p>
                <p className="text-gray-600">(1)</p>
              </div>
              <p className="text-gray-800 font-semibold ml-auto">$99</p>
            </div>

            {/* Item 2 */}
            <div className="flex items-center space-x-4">
              <img src={shirt2} alt="Basic Fit T-Shirt" className="w-16 h-16 object-cover rounded-lg" />
              <div>
                <p className="text-gray-800 font-semibold">Basic Fit T-Shirt</p>
                <p className="text-gray-600">Black/L</p>
                <p className="text-gray-600">(1)</p>
              </div>
              <p className="text-gray-800 font-semibold ml-auto">$99</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300 my-6"></div>

          {/* Subtotal and Shipping */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <p className="text-gray-600">Subtotal</p>
              <p className="text-gray-800 font-semibold">$180.00</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Shipping</p>
              <p className="text-gray-800 font-semibold">$0.00</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300 my-6"></div>

          {/* Total */}
          <div className="flex justify-between">
            <p className="text-gray-800 font-semibold">Total</p>
            <p className="text-gray-800 font-semibold">$180.00</p>
          </div>

          {/* Proceed to Payment Button */}
          <button className="w-full bg-blue-500 text-white p-3 rounded-lg mt-6 hover:bg-blue-600 transition duration-300">
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;