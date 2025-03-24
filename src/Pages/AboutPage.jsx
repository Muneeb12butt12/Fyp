import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white py-10 px-5 font-sans">
      {/* Sign In Button at the Top */}
      <div className="flex justify-end mb-8">
        <Link
          to="/signin" // Link to the SignIn.jsx component
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-300"
        >
          Sign In
        </Link>
      </div>

      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">ABOUT US</h1>
        <h2 className="text-2xl font-semibold text-gray-600">YOUR FASHION ALLY</h2>
        <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
          24/7 Assistance for Seamless Shopping and Unmatched Customer Satisfaction.
        </p>
      </div>

      {/* About Us Content */}
      <div className="max-w-4xl mx-auto mb-12">
        <p className="text-gray-600 text-lg leading-relaxed">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
        </p>
      </div>

      {/* Policies Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
        {/* Return Policy Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">RETURN POLICY</h2>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">EASY RETURNS AT SPORTWEARYPRESS</h3>
          <p className="text-gray-600 mb-4">
            Explore our hassle-free return policy designed to ensure your satisfaction with every purchase.
          </p>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Eligibility</h4>
          <p className="text-gray-600 mb-4">
            Items must be unused, with tags attached, and returned within 30 days of delivery.
          </p>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Process</h4>
          <p className="text-gray-600 mb-4">
            Initiate returns through our <strong>Return Center</strong> for a smooth and efficient process.
          </p>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Refund</h4>
          <p className="text-gray-600">
            Expect a refund to your original payment method within 7-10 business days.
          </p>
        </div>

        {/* Cancellation Policy Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">CANCELLATION POLICY</h2>
          <p className="text-gray-600 mb-4">
            Familiarize yourself with our cancellation policy to make changes to your order with ease.
          </p>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Cancellation Window</h4>
          <p className="text-gray-600 mb-4">
            Orders can be canceled within 24 hours of placement for a full refund.
          </p>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Cancellation Process</h4>
          <p className="text-gray-600 mb-4">
            Visit our Order Management section to cancel your order effortlessly.
          </p>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Refund Timeline</h4>
          <p className="text-gray-600">
            Refunds for cancelled orders are processed within 5-7 business days.
          </p>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">SPORTWEARXPRESS</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="email"
            placeholder="Enter Your Email"
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-300">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;