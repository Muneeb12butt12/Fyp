import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    zipCode: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    shippingMethod: 'standard',
    agreeToTerms: false,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create order data
      const orderData = {
        customer: formData,
        items: cart,
        total: formData.shippingMethod === 'express' ? cartTotal + 9.99 : cartTotal,
        date: new Date().toISOString()
      };

      console.log('Order submitted:', orderData);
      setOrderSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 min-h-screen flex flex-col items-center justify-center text-center">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <svg className="h-12 w-12 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-lg mb-6">Thank you for your purchase.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <button
          onClick={() => navigate('/')}
          className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Information */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact and Shipping forms remain the same as before */}
            {/* ... */}
            
            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit-card"
                      checked={formData.paymentMethod === 'credit-card'}
                      onChange={handleChange}
                      className="h-4 w-4 text-black focus:ring-black"
                    />
                    <span className="font-medium">Credit Card</span>
                  </label>
                  {/* Credit card fields */}
                </div>
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleChange}
                      className="h-4 w-4 text-black focus:ring-black"
                    />
                    <span className="font-medium">PayPal</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-black text-white py-3 px-6 rounded hover:bg-gray-800 transition-colors disabled:opacity-70"
            >
              {isProcessing ? 'Processing...' : `Pay $${(
                formData.shippingMethod === 'express' ? 
                cartTotal + 9.99 : 
                cartTotal
              ).toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="divide-y">
              {cart.map((item) => (
                <div key={item.id} className="py-4 flex justify-between">
                  <div className="flex items-center">
                    <div className="w-16 h-16 flex-shrink-0 mr-4 relative">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover rounded"
                        style={{ backgroundColor: item.selectedColor }}
                      />
                      {item.customization?.logo && (
                        <img
                          src={item.customization.logo.image}
                          alt="Custom logo"
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                          style={{ width: '40px' }}
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-500">
                        {item.selectedColor} / {item.selectedSize}
                      </p>
                      {item.customization?.text && (
                        <p className="text-sm">Text: {item.customization.text}</p>
                      )}
                    </div>
                  </div>
                  <p className="font-medium">${item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formData.shippingMethod === 'standard' ? 'Free' : '$9.99'}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  ${(formData.shippingMethod === 'standard' ? cartTotal : cartTotal + 9.99).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;