import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaUser, FaShoppingCart, FaExclamationTriangle, FaCheckCircle, FaUsers, FaCog, FaChartPie, FaTimes, FaHistory, FaExclamationCircle, FaBox, FaStore, FaCheck, FaSpinner, FaSignOutAlt } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dashboardService from '../services/dashboardService';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Check if user is admin
  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth to load
    }
    
    if (!user) {
      toast.error('Please login to access admin dashboard');
      navigate('/signin');
      return;
    }
    
    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
    
    setIsCheckingAuth(false);
  }, [user, navigate, authLoading]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeUserType, setActiveUserType] = useState('buyers');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [salesData, setSalesData] = useState([
    { name: 'Completed', value: 65 },
    { name: 'Pending', value: 35 }
  ]);
  const [userStats, setUserStats] = useState({
    totalBuyers: 0,
    suspendedBuyers: 0,
    totalSellers: 0,
    unverifiedSellers: 0,
    activeUsers: 0
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionDuration, setSuspensionDuration] = useState('7'); // Default 7 days
  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBuyers: 0,
    totalSellers: 0,
    unverifiedSellers: 0
  });
  const [error, setError] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [unverifiedSellers, setUnverifiedSellers] = useState([]);
  const [showSuspensionForm, setShowSuspensionForm] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [suspensionData, setSuspensionData] = useState({
    reason: '',
    suspendedUntil: '',
    notes: ''
  });

  // Mock data for buyers and sellers
  const [buyers, setBuyers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      joinedDate: '2024-01-15',
      status: 'active',
      avatar: null
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      joinedDate: '2024-02-01',
      status: 'suspended',
      avatar: null
    }
  ]);

  const [sellers, setSellers] = useState([
    {
      id: 1,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      storeName: 'Mike\'s Store',
      joinedDate: '2024-01-10',
      status: 'active',
      avatar: null
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      storeName: 'Sarah\'s Shop',
      joinedDate: '2024-02-05',
      status: 'active',
      avatar: null
    }
  ]);

  // Mock data for user details
  const [userDetails, setUserDetails] = useState({
    orders: [
      { id: 1, date: '2024-03-01', amount: 150.00, status: 'Delivered' },
      { id: 2, date: '2024-03-15', amount: 75.50, status: 'Processing' }
    ],
    complaints: [
      { id: 1, date: '2024-03-10', subject: 'Product Quality Issue', status: 'Resolved' },
      { id: 2, date: '2024-03-20', subject: 'Delivery Delay', status: 'Pending' }
    ],
    loginHistory: [
      { date: '2024-03-25 14:30', ip: '192.168.1.1', device: 'Chrome on Windows' },
      { date: '2024-03-24 09:15', ip: '192.168.1.1', device: 'Mobile Safari' }
    ]
  });

  const handleViewDetails = (userId) => {
    // Implement view details functionality
    console.log('View details for user:', userId);
  };

  const handleToggleStatus = (userId) => {
    // Implement status toggle functionality
    console.log('Toggle status for user:', userId);
  };

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleSuspension = () => {
    setShowSuspensionModal(true);
  };

  const handleConfirmSuspension = () => {
    // Implement suspension logic here
    console.log('Suspending user:', selectedUser.id);
    console.log('Reason:', suspensionReason);
    console.log('Duration:', suspensionDuration, 'days');
    
    // Update user status in the list
    if (activeUserType === 'buyers') {
      setBuyers(buyers.map(buyer => 
        buyer.id === selectedUser.id 
          ? { ...buyer, status: 'suspended' }
          : buyer
      ));
    } else {
      setSellers(sellers.map(seller => 
        seller.id === selectedUser.id 
          ? { ...seller, status: 'suspended' }
          : seller
      ));
    }

    setShowSuspensionModal(false);
    setShowUserModal(false);
    setSuspensionReason('');
    setSuspensionDuration('7');
  };

  const COLORS = ['#0088FE', '#FFBB28'];

  useEffect(() => {
    // Mock notifications
    setNotifications([
      { id: 1, type: 'order', message: 'New order #1234 received', time: '5 min ago' },
      { id: 2, type: 'complaint', message: 'New complaint from user #5678', time: '10 min ago' },
      { id: 3, type: 'approval', message: 'New seller approval request', time: '15 min ago' }
    ]);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Fetch pending approvals
  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const [productsData, sellersData] = await Promise.all([
        dashboardService.getPendingProducts(),
        dashboardService.getPendingSellers()
      ]);
      setPendingProducts(productsData);
      setPendingSellers(sellersData);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      toast.error('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'approvals') {
      fetchPendingApprovals();
    }
  }, [activeTab]);

  // Handle product approval
  const handleProductApproval = async (productId, action) => {
    try {
      await dashboardService.approveProduct(productId, action);
      toast.success('Product approval processed successfully');
      fetchPendingApprovals(); // Refresh the list
    } catch (error) {
      console.error('Error approving product:', error);
      toast.error(error.message || 'Failed to process product approval');
    }
  };

  // Handle seller approval
  const handleSellerApproval = async (sellerId, action) => {
    try {
      await dashboardService.approveSeller(sellerId, action);
      toast.success('Seller approval processed successfully');
      fetchPendingApprovals(); // Refresh the list
    } catch (error) {
      console.error('Error approving seller:', error);
      toast.error(error.message || 'Failed to process seller approval');
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const statsData = await dashboardService.getDashboardStats();
      console.log('Dashboard stats received:', statsData);
      
      setStats(statsData);
      setUserStats({
        totalBuyers: statsData?.totalBuyers || 0,
        totalSellers: statsData?.totalSellers || 0,
        unverifiedSellers: statsData?.unverifiedSellers || 0,
        activeUsers: (statsData?.activeBuyers || 0) + (statsData?.activeSellers || 0)
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.message || 'Failed to fetch dashboard statistics');
      toast.error(error.message || 'Failed to fetch dashboard statistics');
      
      // Set default values on error
      setStats({
        totalBuyers: 0,
        totalSellers: 0,
        unverifiedSellers: 0
      });
      setUserStats({
        totalBuyers: 0,
        totalSellers: 0,
        unverifiedSellers: 0,
        activeUsers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch unverified sellers - only call after authentication is confirmed
  useEffect(() => {
    if (!authLoading && !isCheckingAuth && user && user.role === 'admin') {
      fetchUnverifiedSellers();
    }
  }, [authLoading, isCheckingAuth, user]);

  const fetchUnverifiedSellers = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching unverified sellers with token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        console.error('No token found');
        toast.error('Please login to access admin dashboard');
        return;
      }

      console.log('Using API URL:', API_URL);
      console.log('Fetching unverified sellers from:', `${API_URL}/api/admin/sellers/unverified`);
      
      const response = await axios.get(`${API_URL}/api/admin/sellers/unverified`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Unverified sellers response:', response.data);
      setUnverifiedSellers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching unverified sellers:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        navigate('/signin');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error('Failed to fetch unverified sellers');
      }
      setLoading(false);
    }
  };

  const handleVerify = async (sellerId) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/admin/sellers/${sellerId}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Seller verified successfully');
      fetchUnverifiedSellers();
    } catch (error) {
      console.error('Error verifying seller:', error);
      toast.error('Failed to verify seller');
    }
  };

  const handleSuspend = async (sellerId) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/admin/sellers/${sellerId}/suspend`, suspensionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Seller suspended successfully');
      setShowSuspensionForm(false);
      setSelectedSeller(null);
      setSuspensionData({
        reason: '',
        suspendedUntil: '',
        notes: ''
      });
      fetchUnverifiedSellers();
    } catch (error) {
      console.error('Error suspending seller:', error);
      toast.error('Failed to suspend seller');
    }
  };

  const openSuspensionForm = (seller) => {
    setSelectedSeller(seller);
    setShowSuspensionForm(true);
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin h-8 w-8 text-primary" />
                <span className="ml-2 text-gray-600">Loading dashboard statistics...</span>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <FaExclamationCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-500">{error}</p>
                  <button
                    onClick={fetchDashboardStats}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Buyers Card */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Buyers</h3>
                    {loading ? (
                      <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
                    ) : (
                      <p className="text-3xl font-bold text-blue-600">{stats.totalBuyers}</p>
                    )}
                  </div>

                  {/* Total Sellers Card */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Sellers</h3>
                    {loading ? (
                      <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
                    ) : (
                      <p className="text-3xl font-bold text-green-600">{stats.totalSellers}</p>
                    )}
                  </div>

                  {/* Unverified Sellers Card */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Unverified Sellers</h3>
                    {loading ? (
                      <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
                    ) : (
                      <p className="text-3xl font-bold text-yellow-600">{stats.unverifiedSellers}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={salesData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {salesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
                    <div className="space-y-4">
                      {notifications.slice(0, 5).map((notification) => (
                        <div key={notification.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <FaBell className="text-primary" />
                          <div>
                            <p className="text-sm font-medium">{notification.message}</p>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'users':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              
              {/* User Type Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveUserType('buyers')}
                    className={`${
                      activeUserType === 'buyers'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Buyers
                  </button>
                  <button
                    onClick={() => setActiveUserType('sellers')}
                    className={`${
                      activeUserType === 'sellers'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Sellers
                  </button>
                </nav>
              </div>

              {/* Search and Filter */}
              <div className="mb-4 flex justify-between items-center">
                <div className="flex-1 max-w-sm">
                  <input
                    type="text"
                    placeholder={`Search ${activeUserType}...`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeUserType === 'buyers' ? (
                      // Buyers List
                      buyers.map((buyer) => (
                        <tr 
                          key={buyer.id} 
                          onClick={() => handleRowClick(buyer)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={buyer.avatar || 'https://via.placeholder.com/40'}
                                  alt=""
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{buyer.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{buyer.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{buyer.joinedDate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              buyer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {buyer.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewDetails(buyer.id)}
                              className="text-primary hover:text-primary-dark mr-4"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleToggleStatus(buyer.id)}
                              className={`${
                                buyer.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {buyer.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      // Sellers List
                      sellers.map((seller) => (
                        <tr 
                          key={seller.id} 
                          onClick={() => handleRowClick(seller)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={seller.avatar || 'https://via.placeholder.com/40'}
                                  alt=""
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{seller.name}</div>
                                <div className="text-sm text-gray-500">{seller.storeName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{seller.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{seller.joinedDate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              seller.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {seller.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewDetails(seller.id)}
                              className="text-primary hover:text-primary-dark mr-4"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleToggleStatus(seller.id)}
                              className={`${
                                seller.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {seller.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                  <span className="font-medium">{activeUserType === 'buyers' ? buyers.length : sellers.length}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'approvals':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
              
              {/* Product Approvals */}
              <div className="mb-8">
                <h3 className="text-md font-medium mb-3 flex items-center">
                  <FaBox className="mr-2" /> Product Approvals
                </h3>
                {loading ? (
                  <div className="flex justify-center">
                    <FaSpinner className="animate-spin h-6 w-6 text-blue-500" />
                  </div>
                ) : pendingProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingProducts.map((product) => (
                          <tr key={product._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img src={product.images[0]} alt={product.name} className="h-10 w-10 rounded object-cover" />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                  <div className="text-sm text-gray-500">{product.category}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{product.sellerName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">${product.price}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProductApproval(product._id, 'approve');
                                }}
                                className="text-green-600 hover:text-green-900 mr-3"
                              >
                                <FaCheck className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProductApproval(product._id, 'reject');
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FaTimes className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No pending product approvals</p>
                )}
              </div>

              {/* Seller Approvals */}
              <div>
                <h3 className="text-md font-medium mb-3 flex items-center">
                  <FaStore className="mr-2" /> Seller Approvals
                </h3>
                {loading ? (
                  <div className="flex justify-center">
                    <FaSpinner className="animate-spin h-6 w-6 text-blue-500" />
                  </div>
                ) : pendingSellers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingSellers.map((seller) => (
                          <tr key={seller._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img src={seller.profilePhoto || 'https://via.placeholder.com/40'} alt={seller.fullName} className="h-10 w-10 rounded-full" />
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{seller.fullName}</div>
                                  <div className="text-sm text-gray-500">{seller.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{seller.businessInfo.businessName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{seller.businessInfo.businessType}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSellerApproval(seller._id, 'approve');
                                }}
                                className="text-green-600 hover:text-green-900 mr-3"
                              >
                                <FaCheck className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSellerApproval(seller._id, 'reject');
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FaTimes className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No pending seller approvals</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
            <p>This feature is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Show loading screen while checking authentication */}
      {authLoading || isCheckingAuth ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Top Navbar */}
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
              <div className="h-6 w-px bg-gray-200"></div>
              <p className="text-sm text-gray-500">Welcome back, {user?.fullName}</p>
            </div>
            <div className="flex items-center gap-6">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 hover:text-primary relative transition-colors duration-200"
                >
                  <FaBell className="text-xl" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 transition-colors duration-200">
                          <p className="text-sm text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-all duration-200"
                >
                  <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden ring-2 ring-primary ring-offset-2">
                    {user?.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt="Admin"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FaUser className="text-lg" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.fullName || 'Admin'}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        navigate('/admin/profile');
                      }}
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 w-full text-left transition-colors duration-200"
                    >
                      <FaUser className="mr-3 text-gray-400" />
                      <div>
                        <p className="font-medium">View Profile</p>
                        <p className="text-xs text-gray-500">View your account details</p>
                      </div>
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left transition-colors duration-200"
                    >
                      <FaSignOutAlt className="mr-3" />
                      <div>
                        <p className="font-medium">Sign Out</p>
                        <p className="text-xs text-red-500">Log out of your account</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white shadow-md h-[calc(100vh-4rem)] sticky top-16">
          <nav className="mt-6 px-3">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`group flex items-center px-4 py-3 text-base font-medium rounded-lg w-full mb-2 transition-all duration-200 ${
                activeTab === 'dashboard' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaChartPie className={`mr-3 ${activeTab === 'dashboard' ? 'text-white' : 'text-gray-400'}`} />
              Dashboard
            </button>
            <button
              onClick={() => handleTabChange('orders')}
              className={`group flex items-center px-4 py-3 text-base font-medium rounded-lg w-full mb-2 transition-all duration-200 ${
                activeTab === 'orders' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaShoppingCart className={`mr-3 ${activeTab === 'orders' ? 'text-white' : 'text-gray-400'}`} />
              Orders
            </button>
            <button
              onClick={() => handleTabChange('complaints')}
              className={`group flex items-center px-4 py-3 text-base font-medium rounded-lg w-full mb-2 transition-all duration-200 ${
                activeTab === 'complaints' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaExclamationTriangle className={`mr-3 ${activeTab === 'complaints' ? 'text-white' : 'text-gray-400'}`} />
              Complaints
            </button>
            <button
              onClick={() => handleTabChange('approvals')}
              className={`group flex items-center px-4 py-3 text-base font-medium rounded-lg w-full mb-2 transition-all duration-200 ${
                activeTab === 'approvals' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaCheckCircle className={`mr-3 ${activeTab === 'approvals' ? 'text-white' : 'text-gray-400'}`} />
              Approvals
            </button>
            <button
              onClick={() => handleTabChange('users')}
              className={`group flex items-center px-4 py-3 text-base font-medium rounded-lg w-full mb-2 transition-all duration-200 ${
                activeTab === 'users' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaUsers className={`mr-3 ${activeTab === 'users' ? 'text-white' : 'text-gray-400'}`} />
              User Management
            </button>
            <button
              onClick={() => handleTabChange('settings')}
              className={`group flex items-center px-4 py-3 text-base font-medium rounded-lg w-full mb-2 transition-all duration-200 ${
                activeTab === 'settings' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaCog className={`mr-3 ${activeTab === 'settings' ? 'text-white' : 'text-gray-400'}`} />
              Settings
            </button>
          </nav>
        </div>

        {/* Main Content */}
            <div className="flex-1">
          {renderContent()}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard; 