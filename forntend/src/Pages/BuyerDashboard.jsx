import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiTruck, FiCheckCircle, FiClock, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { FaStar, FaRegStar, FaRegHeart, FaHeart } from 'react-icons/fa';
import { fadeIn, staggerContainer } from '../utils/motion';

const BuyerDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Simulate fetching orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // In a real app, you would fetch from your backend API
        const mockOrders = [
          {
            id: 'ORD-123456',
            date: new Date('2023-05-15').toISOString(),
            status: 'Delivered',
            items: [
              {
                id: 1,
                title: 'Custom Sport T-Shirt',
                price: 29.99,
                quantity: 2,
                img: '/path/to/image1.jpg',
                selectedColor: 'Black',
                selectedSize: 'L',
                customization: {
                  text: 'Team Awesome',
                  logo: {
                    image: '/path/to/logo1.png',
                    position: { x: 50, y: 50 }
                  }
                }
              }
            ],
            total: 59.98,
            shippingAddress: {
              name: 'John Doe',
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zip: '10001',
              country: 'USA'
            },
            paymentMethod: 'Credit Card',
            trackingNumber: 'UPS123456789',
            estimatedDelivery: new Date('2023-05-20').toISOString(),
            deliveredDate: new Date('2023-05-19').toISOString()
          },
          {
            id: 'ORD-789012',
            date: new Date('2023-06-01').toISOString(),
            status: 'Shipped',
            items: [
              {
                id: 2,
                title: 'Premium Polo Shirt',
                price: 39.99,
                quantity: 1,
                img: '/path/to/image2.jpg',
                selectedColor: 'Navy Blue',
                selectedSize: 'M',
                customization: {
                  text: 'My Company',
                  logo: {
                    image: '/path/to/logo2.png',
                    position: { x: 30, y: 40 }
                  }
                }
              },
              {
                id: 3,
                title: 'Athletic Shorts',
                price: 24.99,
                quantity: 1,
                img: '/path/to/image3.jpg',
                selectedColor: 'Gray',
                selectedSize: 'M'
              }
            ],
            total: 64.98,
            shippingAddress: {
              name: 'John Doe',
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zip: '10001',
              country: 'USA'
            },
            paymentMethod: 'PayPal',
            trackingNumber: 'FEDEX987654321',
            estimatedDelivery: new Date('2023-06-10').toISOString()
          }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setOrders(mockOrders);
        setUserData({
          name: 'John Doe',
          email: 'john.doe@example.com',
          joinDate: 'January 2022',
          ordersCount: mockOrders.length,
          favoriteItems: []
        });
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <FiCheckCircle className="text-green-500" />;
      case 'Shipped':
        return <FiTruck className="text-blue-500" />;
      case 'Processing':
        return <FiClock className="text-yellow-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const toggleFavorite = (itemId) => {
    setUserData(prev => {
      const isFavorite = prev.favoriteItems.includes(itemId);
      return {
        ...prev,
        favoriteItems: isFavorite
          ? prev.favoriteItems.filter(id => id !== itemId)
          : [...prev.favoriteItems, itemId]
      };
    });
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'orders':
        return (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {orders.length === 0 ? (
              <motion.div 
                variants={fadeIn('up', 'tween', 0.2, 1)}
                className="text-center py-12"
              >
                <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No orders yet</h3>
                <p className="mt-1 text-gray-500">Your orders will appear here once you make a purchase.</p>
                <button
                  onClick={() => navigate('/shop')}
                  className="mt-6 bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Start Shopping
                </button>
              </motion.div>
            ) : (
              orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  variants={fadeIn('up', 'tween', index * 0.1, 1)}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="p-6 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          {getStatusIcon(order.status)}
                          <span className="ml-2 font-medium">{order.status}</span>
                        </div>
                        <span className="text-sm text-gray-500">Order #{order.id}</span>
                      </div>
                      <div className="mt-2 sm:mt-0 text-sm text-gray-500">
                        Ordered on {formatDate(order.date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <h4 className="font-medium mb-4">Items</h4>
                        <div className="space-y-4">
                          {order.items.map((item) => (
                            <div key={`${order.id}-${item.id}`} className="flex">
                              <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden relative">
                                <img
                                  src={item.img}
                                  alt={item.title}
                                  className="h-full w-full object-cover"
                                  style={{ backgroundColor: item.selectedColor }}
                                />
                                {item.customization?.logo && (
                                  <img
                                    src={item.customization.logo.image}
                                    alt="Custom logo"
                                    className="absolute"
                                    style={{
                                      width: '30px',
                                      top: `${item.customization.logo.position.y}%`,
                                      left: `${item.customization.logo.position.x}%`,
                                      transform: 'translate(-50%, -50%)'
                                    }}
                                  />
                                )}
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="flex justify-between">
                                  <h5 className="font-medium">{item.title}</h5>
                                  <button 
                                    onClick={() => toggleFavorite(item.id)}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    {userData?.favoriteItems.includes(item.id) ? (
                                      <FaHeart className="text-red-500" />
                                    ) : (
                                      <FaRegHeart />
                                    )}
                                  </button>
                                </div>
                                <p className="text-sm text-gray-500">
                                  {item.selectedColor} / {item.selectedSize}
                                </p>
                                {item.customization?.text && (
                                  <p className="text-sm mt-1">Custom Text: "{item.customization.text}"</p>
                                )}
                                <p className="text-sm mt-1">Qty: {item.quantity}</p>
                              </div>
                              <div className="ml-4 text-right">
                                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                        <h4 className="font-medium mb-4">Order Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>Free</span>
                          </div>
                          <div className="flex justify-between font-medium pt-2 border-t">
                            <span>Total</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        {order.status === 'Shipped' && (
                          <div className="mt-6">
                            <h4 className="font-medium mb-2">Tracking Information</h4>
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm">
                                <span className="font-medium">Carrier:</span> {order.trackingNumber.includes('UPS') ? 'UPS' : 'FedEx'}
                              </p>
                              <p className="text-sm mt-1">
                                <span className="font-medium">Tracking #:</span> {order.trackingNumber}
                              </p>
                              <p className="text-sm mt-1">
                                <span className="font-medium">Estimated Delivery:</span> {formatDate(order.estimatedDelivery)}
                              </p>
                              <button
                                onClick={() => window.open(`https://www.ups.com/track?tracknum=${order.trackingNumber}`, '_blank')}
                                className="mt-2 text-sm text-blue-600 hover:underline"
                              >
                                Track Package
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {order.status === 'Delivered' && (
                          <div className="mt-6">
                            <h4 className="font-medium mb-2">Delivery Information</h4>
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm">
                                <span className="font-medium">Delivered on:</span> {formatDate(order.deliveredDate)}
                              </p>
                              <button
                                onClick={() => alert('Rate product functionality would go here')}
                                className="mt-3 flex items-center text-sm text-yellow-600 hover:underline"
                              >
                                <FaStar className="mr-1" />
                                Rate this order
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
                      <button
                        onClick={() => navigate(`/reorder/${order.id}`)}
                        className="px-4 py-2 border border-black rounded-md hover:bg-gray-100 transition-colors"
                      >
                        Reorder
                      </button>
                      <button
                        onClick={() => navigate(`/returns/${order.id}`)}
                        className="px-4 py-2 border border-black rounded-md hover:bg-gray-100 transition-colors"
                      >
                        Return Items
                      </button>
                      <button
                        onClick={() => alert('Contact support functionality would go here')}
                        className="px-4 py-2 border border-black rounded-md hover:bg-gray-100 transition-colors"
                      >
                        Get Help
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        );
      
      case 'profile':
        return (
          <motion.div
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-xl font-semibold mb-6">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-4">Personal Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                    <p className="font-medium">{userData?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Email Address</label>
                    <p className="font-medium">{userData?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Member Since</label>
                    <p className="font-medium">{userData?.joinDate}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Shipping Address</h4>
                {orders.length > 0 ? (
                  <div>
                    <p>{orders[0].shippingAddress.name}</p>
                    <p>{orders[0].shippingAddress.street}</p>
                    <p>{orders[0].shippingAddress.city}, {orders[0].shippingAddress.state} {orders[0].shippingAddress.zip}</p>
                    <p>{orders[0].shippingAddress.country}</p>
                    <button
                      onClick={() => alert('Address editing functionality would go here')}
                      className="mt-4 text-sm text-blue-600 hover:underline"
                    >
                      Edit Address
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">No shipping address saved yet</p>
                )}
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t">
              <h4 className="font-medium mb-4">Account Actions</h4>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => alert('Password change functionality would go here')}
                  className="px-4 py-2 border border-black rounded-md hover:bg-gray-100 transition-colors"
                >
                  Change Password
                </button>
                <button
                  onClick={() => alert('Notification preferences would go here')}
                  className="px-4 py-2 border border-black rounded-md hover:bg-gray-100 transition-colors"
                >
                  Notification Preferences
                </button>
                <button
                  onClick={() => alert('Account deletion would go here')}
                  className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </motion.div>
        );
      
      case 'wishlist':
        return (
          <motion.div
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h3 className="text-xl font-semibold mb-6">Your Wishlist</h3>
            {userData?.favoriteItems.length === 0 ? (
              <div className="text-center py-12">
                <FaRegHeart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">Your wishlist is empty</h3>
                <p className="mt-1 text-gray-500">Save items you love by clicking the heart icon.</p>
                <button
                  onClick={() => navigate('/shop')}
                  className="mt-6 bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.flatMap(order => 
                  order.items.filter(item => userData?.favoriteItems.includes(item.id))
                  .map(item => (
                    <div key={item.id} className="border rounded-md overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative h-48 bg-gray-100">
                        <img
                          src={item.img}
                          alt={item.title}
                          className="h-full w-full object-cover"
                          style={{ backgroundColor: item.selectedColor }}
                        />
                        {item.customization?.logo && (
                          <img
                            src={item.customization.logo.image}
                            alt="Custom logo"
                            className="absolute"
                            style={{
                              width: '40px',
                              top: `${item.customization.logo.position.y}%`,
                              left: `${item.customization.logo.position.x}%`,
                              transform: 'translate(-50%, -50%)'
                            }}
                          />
                        )}
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                        >
                          <FaHeart className="text-red-500" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.selectedColor} / {item.selectedSize}
                        </p>
                        {item.customization?.text && (
                          <p className="text-sm mt-1">Custom Text: "{item.customization.text}"</p>
                        )}
                        <p className="font-medium mt-2">${item.price.toFixed(2)}</p>
                        <button
                          onClick={() => navigate(`/product/${item.id}`)}
                          className="mt-4 w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
                        >
                          View Product
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row gap-8"
        >
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <FiUser className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <h2 className="font-semibold">{userData?.name || 'Loading...'}</h2>
                  <p className="text-sm text-gray-500">{userData?.email || 'Loading...'}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md ${activeTab === 'orders' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
                >
                  <FiShoppingBag className="h-5 w-5" />
                  <span>My Orders</span>
                  {userData && (
                    <span className="ml-auto bg-gray-200 rounded-full px-2 py-0.5 text-xs">
                      {userData.ordersCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md ${activeTab === 'wishlist' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
                >
                  <FaRegHeart className="h-5 w-5" />
                  <span>Wishlist</span>
                  {userData && userData.favoriteItems.length > 0 && (
                    <span className="ml-auto bg-gray-200 rounded-full px-2 py-0.5 text-xs">
                      {userData.favoriteItems.length}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md ${activeTab === 'profile' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
                >
                  <FiUser className="h-5 w-5" />
                  <span>Profile</span>
                </button>
                
                <button
                  onClick={() => alert('Settings functionality would go here')}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50"
                >
                  <FiSettings className="h-5 w-5" />
                  <span>Settings</span>
                </button>
                
                <button
                  onClick={() => navigate('/logout')}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50 text-red-600"
                >
                  <FiLogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold">
                {activeTab === 'orders' && 'My Orders'}
                {activeTab === 'wishlist' && 'Wishlist'}
                {activeTab === 'profile' && 'My Profile'}
              </h1>
              <p className="text-gray-500 mt-1">
                {activeTab === 'orders' && 'View and manage your orders'}
                {activeTab === 'wishlist' && 'Your saved favorite items'}
                {activeTab === 'profile' && 'Manage your account details'}
              </p>
            </motion.div>
            
            {renderTabContent()}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BuyerDashboard;