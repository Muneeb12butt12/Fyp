import React from "react";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AiOutlineClose, AiOutlineHeart, AiOutlineShopping } from 'react-icons/ai';
import { FiPackage, FiClock, FiTrash2, FiArrowRight } from 'react-icons/fi';
import AOS from "aos";
import "aos/dist/aos.css";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
const SmartCart = () => {
      const [orderPopup, setOrderPopup] = React.useState(false);
    
      const handleOrderPopup = () => {
        setOrderPopup(!orderPopup);
      };
      React.useEffect(() => {
        AOS.init({
          offset: 100,
          duration: 800,
          easing: "ease-in-sine",
          delay: 100,
        });
        AOS.refresh();
      }, []);
  const [cartItems, setCartItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState('2-3 business days');

  // Simulate AI recommendations
  useEffect(() => {
    fetchRecommendations();
  }, [cartItems]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setRecommendations([
        { id: 101, name: 'Wireless Earbuds', price: 59.99, image: 'earbuds.jpg' },
        { id: 102, name: 'Fitness Tracker', price: 89.99, image: 'tracker.jpg' },
      ]);
      setIsLoading(false);
    }, 1000);
  };

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, qty: newQty } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const saveForLater = (id) => {
    // Move to "Saved Items" list
    console.log('Saved for later:', id);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discount = subtotal > 100 ? subtotal * 0.1 : 0; // 10% off if > $100
  const total = subtotal - discount;

  return (
    <div className="    bg-white dark:bg-gray-900 dark:text-white duration-200">
        <Navbar/>
      <h1 className="text-3xl font-bold mb-6">Your Cart ({cartItems.length})</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Cart Items */}
        <div className="flex-1 bg-white rounded-xl shadow-sm p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <AiOutlineShopping className="mx-auto text-5xl text-gray-300 mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="py-4 flex gap-4"
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.name}</h3>
                        <button onClick={() => removeItem(item.id)}>
                          <AiOutlineClose className="text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                      <p className="text-gray-600">${item.price.toFixed(2)}</p>
                      <div className="flex items-center mt-2 gap-4">
                        <div className="flex items-center border rounded-lg">
                          <button 
                            onClick={() => updateQuantity(item.id, item.qty - 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            −
                          </button>
                          <span className="px-3">{item.qty}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.qty + 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => saveForLater(item.id)}
                          className="flex items-center gap-1 text-sm text-blue-600"
                        >
                          <AiOutlineHeart /> Save
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:w-96 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mb-6 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
            <FiPackage className="text-blue-500 mt-1" />
            <div>
              <p className="font-medium">Free shipping on orders over $50</p>
              <p className="text-sm text-gray-600">You qualify for free shipping!</p>
            </div>
          </div>

          <div className="mb-6 p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
            <FiClock className="text-yellow-500 mt-1" />
            <div>
              <p className="font-medium">Delivery Estimate</p>
              <p className="text-sm text-gray-600">{deliveryEstimate}</p>
            </div>
          </div>

          <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2">
            Proceed to Checkout <FiArrowRight />
          </button>
        </div>
      </div>

      {/* AI Recommendations */}
      {cartItems.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">You Might Also Like</h2>
          {isLoading ? (
            <div className="flex gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="w-48 h-64 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.map((item) => (
                <motion.div 
                  key={item.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
                >
                  <div className="h-40 bg-gray-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-600">${item.price.toFixed(2)}</p>
                    <button className="mt-2 text-sm text-blue-600 hover:underline">
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default SmartCart;