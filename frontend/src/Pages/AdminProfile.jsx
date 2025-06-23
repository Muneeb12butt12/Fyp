import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaHistory, FaSignOutAlt, FaArrowLeft, FaEnvelope, FaPhone, FaCalendarAlt, FaClock, FaCreditCard, FaWallet, FaDollarSign, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const AdminProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch admin profile
        const profileResponse = await fetch('http://localhost:5000/api/admin/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!profileResponse.ok) {
          throw new Error('Failed to fetch admin profile');
        }

        const profileData = await profileResponse.json();
        console.log('Profile data:', profileData); // Debug log
        if (profileData.success) {
          setAdminData(profileData.data);
        }

        // Fetch login history
        const historyResponse = await fetch('http://localhost:5000/api/admin/login-history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!historyResponse.ok) {
          throw new Error('Failed to fetch login history');
        }

        const historyData = await historyResponse.json();
        setLoginHistory(historyData.history);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/admin/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      logout();
      navigate('/signin');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="h-32 w-32 rounded-full bg-white p-1 shadow-lg">
                <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center">
                  <FaUser className="text-4xl text-blue-500" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{adminData?.fullName}</h1>
                <p className="text-blue-100 text-lg mb-1">{adminData?.email}</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500 bg-opacity-20 text-blue-100 text-sm">
                  <FaUser className="mr-2" />
                  Administrator
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                  <FaUser className="mr-3 text-blue-500" />
                  Personal Information
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaEnvelope className="text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Email Address</p>
                      <p className="text-base text-gray-900">{adminData?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaPhone className="text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="text-base text-gray-900">{adminData?.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaCalendarAlt className="text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Joined Date</p>
                      <p className="text-base text-gray-900">
                        {new Date(adminData?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Login History */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                  <FaHistory className="mr-3 text-blue-500" />
                  Login History
                </h2>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {loginHistory.map((login, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaClock className="text-blue-500" />
                          </div>
                          <div className="ml-4">
                            <p className="text-base font-medium text-gray-900">
                              {new Date(login.loginAt).toLocaleString()}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100">
                                IP: {login.ipAddress}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100">
                                {login.deviceType}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100">
                                {login.browser}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100">
                                {login.os}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${
                                login.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {login.isActive ? 'Active' : 'Logged out'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods Section */}
            <div className="mt-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                  <FaCreditCard className="mr-3 text-blue-500" />
                  Payment Methods
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bank Accounts */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <FaCreditCard className="mr-2 text-blue-500" />
                      Bank Accounts ({adminData?.bankAccounts?.length || 0})
                    </h3>
                    {adminData?.bankAccounts && adminData.bankAccounts.length > 0 ? (
                      <div className="space-y-3">
                        {adminData.bankAccounts.map((account, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {account.type === 'other' ? account.otherBankName : account.type}
                                </p>
                                <p className="text-sm text-gray-600">Account: {account.accountNumber}</p>
                                <p className="text-sm text-gray-600">Title: {account.accountTitle}</p>
                                {account.branchCode && (
                                  <p className="text-sm text-gray-600">Branch: {account.branchCode}</p>
                                )}
                              </div>
                              {account.isDefault && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-500 text-center">No bank accounts added</p>
                      </div>
                    )}
                  </div>

                  {/* Wallets */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <FaWallet className="mr-2 text-blue-500" />
                      Wallets ({adminData?.wallets?.length || 0})
                    </h3>
                    {adminData?.wallets && adminData.wallets.length > 0 ? (
                      <div className="space-y-3">
                        {adminData.wallets.map((wallet, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {wallet.type === 'other' ? wallet.otherWalletName : wallet.type}
                                </p>
                                <p className="text-sm text-gray-600">Account: {wallet.accountNumber}</p>
                                <p className="text-sm text-gray-600">Title: {wallet.accountTitle}</p>
                              </div>
                              {wallet.isDefault && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-500 text-center">No wallets added</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Information Section */}
            <div className="mt-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                  <FaDollarSign className="mr-3 text-blue-500" />
                  Financial Overview
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Commission Balance */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Commission Balance</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${adminData?.commissionBalance?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <FaDollarSign className="text-green-500" />
                      </div>
                    </div>
                  </div>

                  {/* Total Commissions */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Commissions</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${adminData?.totalCommissions?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaChartLine className="text-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* Total Payouts */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Payouts</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${adminData?.totalPayouts?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <FaWallet className="text-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Commission History */}
                {adminData?.commissionHistory && adminData.commissionHistory.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <FaHistory className="mr-2 text-blue-500" />
                      Recent Commission History
                    </h3>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Payout ID
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order ID
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {adminData.commissionHistory.slice(0, 5).map((commission, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(commission.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {commission.payoutId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {commission.orderId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                  ${commission.amount?.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <FaSignOutAlt className="mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile; 