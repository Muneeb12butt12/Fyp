import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { FaUsers, FaBoxOpen, FaChartLine, FaCog, FaSignOutAlt, FaSearch, FaTrash, FaEdit, FaBan, FaCheck } from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState({
    users: true,
    products: true,
    orders: true
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("adminAuthenticated") === "true";
      setIsAuthenticated(authStatus);
      if (!authStatus) {
        navigate("/admin/login");
      }
    };
    checkAuth();
  }, [navigate]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0
  });

  // Fetch data functions
  const fetchUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data);  // Changed from data.users to just data
      setAnalytics(prev => ({
        ...prev,
        totalUsers: data.length
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(prev => ({ ...prev, products: true }));
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.products);
      setAnalytics(prev => ({
        ...prev,
        totalProducts: data.products.length
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(prev => ({ ...prev, orders: true }));
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders(data);  // Changed from data.orders to just data
      setAnalytics(prev => ({
        ...prev,
        totalOrders: data.length,
        revenue: data.reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      await Promise.all([fetchUsers(), fetchProducts(), fetchOrders()]);
    };

    fetchData();
  }, [isAuthenticated]);

  // Handle user suspension/reactivation
  const toggleUserStatus = async (userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user status');
      }
      
      const updatedUser = await response.json();
      setUsers(users.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle product deletion
  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      setProducts(products.filter(product => product._id !== productId));
      setAnalytics(prev => ({
        ...prev,
        totalProducts: prev.totalProducts - 1
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle order status update
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      const updatedOrder = await response.json();
      setOrders(orders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  // Filter data based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (order.user && order.user.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Chart data
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales ($)',
        data: [1200, 1900, 3000, 2500, 2000, 3000],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  const orderStatusData = {
    labels: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
    datasets: [
      {
        data: [
          orders.filter(o => o.status === 'pending').length,
          orders.filter(o => o.status === 'shipped').length,
          orders.filter(o => o.status === 'delivered').length,
          orders.filter(o => o.status === 'cancelled').length
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white duration-200 min-h-screen">
      <Navbar />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white min-h-screen p-4">
          <div className="text-xl font-bold mb-8 p-2 border-b border-gray-700">Admin Panel</div>
          
          <nav>
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center w-full p-3 mb-2 rounded transition-colors ${activeTab === "dashboard" ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              <FaChartLine className="mr-3" /> Dashboard
            </button>
            
            <button 
              onClick={() => setActiveTab("users")}
              className={`flex items-center w-full p-3 mb-2 rounded transition-colors ${activeTab === "users" ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              <FaUsers className="mr-3" /> Users
            </button>
            
            <button 
              onClick={() => setActiveTab("products")}
              className={`flex items-center w-full p-3 mb-2 rounded transition-colors ${activeTab === "products" ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              <FaBoxOpen className="mr-3" /> Products
            </button>
            
            <button 
              onClick={() => setActiveTab("orders")}
              className={`flex items-center w-full p-3 mb-2 rounded transition-colors ${activeTab === "orders" ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              <FaBoxOpen className="mr-3" /> Orders
            </button>
            
            <button 
              onClick={() => setActiveTab("settings")}
              className={`flex items-center w-full p-3 mb-2 rounded transition-colors ${activeTab === "settings" ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              <FaCog className="mr-3" /> Settings
            </button>
            
            <button 
              onClick={() => navigate("/")}
              className="flex items-center w-full p-3 mb-2 rounded hover:bg-gray-700 transition-colors"
            >
              <FaSignOutAlt className="mr-3" /> Back to Site
            </button>

            <button 
              onClick={handleLogout}
              className="flex items-center w-full p-3 mb-2 rounded hover:bg-gray-700 transition-colors"
            >
              <FaSignOutAlt className="mr-3" /> Logout
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Search Bar */}
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold capitalize">{activeTab}</h1>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-2 text-red-700 hover:text-red-900"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Loading State */}
          {(loading.users || loading.products || loading.orders) && activeTab !== "settings" && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && !loading.users && !loading.products && !loading.orders && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 dark:bg-gray-800 p-6 rounded-lg shadow transition-transform hover:scale-105">
                  <h3 className="text-gray-500 dark:text-gray-400">Total Users</h3>
                  <p className="text-3xl font-bold">{analytics.totalUsers}</p>
                </div>
                <div className="bg-green-50 dark:bg-gray-800 p-6 rounded-lg shadow transition-transform hover:scale-105">
                  <h3 className="text-gray-500 dark:text-gray-400">Total Products</h3>
                  <p className="text-3xl font-bold">{analytics.totalProducts}</p>
                </div>
                <div className="bg-purple-50 dark:bg-gray-800 p-6 rounded-lg shadow transition-transform hover:scale-105">
                  <h3 className="text-gray-500 dark:text-gray-400">Total Orders</h3>
                  <p className="text-3xl font-bold">{analytics.totalOrders}</p>
                </div>
                <div className="bg-yellow-50 dark:bg-gray-800 p-6 rounded-lg shadow transition-transform hover:scale-105">
                  <h3 className="text-gray-500 dark:text-gray-400">Total Revenue</h3>
                  <p className="text-3xl font-bold">${analytics.revenue}</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
                  <Bar data={salesData} options={chartOptions} />
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Order Status</h3>
                  <Pie data={orderStatusData} options={chartOptions} />
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Order ID</th>
                        <th className="text-left py-3 px-4">Customer</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(order => (
                        <tr key={order._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4">{order._id.substring(0, 8)}...</td>
                          <td className="py-3 px-4">{order.user?.name || 'Guest'}</td>
                          <td className="py-3 px-4">${order.totalAmount.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && !loading.users && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4">{user.name}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4 capitalize">{user.role}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => toggleUserStatus(user._id)}
                            className={`p-2 rounded-full transition-colors ${
                              user.status === 'active' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                          >
                            {user.status === 'active' ? <FaBan /> : <FaCheck />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && !loading.products && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Product List</h3>
                <Link 
                  to="/admin/products/add"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Add Product
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Stock</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr key={product._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4">${product.price.toFixed(2)}</td>
                        <td className="py-3 px-4">{product.stock}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.stock <= 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {product.stock <= 0 ? 'Out of Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex space-x-2">
                          <Link
                            to={`/admin/products/edit/${product._id}`}
                            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                            title="Edit Product"
                          >
                            <FaEdit />
                          </Link>
                          <button 
                            onClick={() => deleteProduct(product._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                            title="Delete Product"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && !loading.orders && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Order ID</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4">{order._id.substring(0, 8)}...</td>
                        <td className="py-3 px-4">{order.user?.name || 'Guest'}</td>
                        <td className="py-3 px-4">${order.totalAmount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className={`px-2 py-1 rounded text-xs ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                            title="View Details"
                          >
                            <FaEdit />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-6">System Settings</h3>
              
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h4 className="font-medium mb-2">General Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Site Name</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue="SportswearXpress"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Maintenance Mode</label>
                      <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Disabled</option>
                        <option>Enabled</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h4 className="font-medium mb-2">Payment Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Stripe Public Key</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="pk_test_..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Stripe Secret Key</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="sk_test_..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;