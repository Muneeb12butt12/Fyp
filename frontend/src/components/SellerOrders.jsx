import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get API URL with fallback
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      console.log('API URL:', apiUrl);
      
      const [ordersResponse, paymentsResponse] = await Promise.all([
        axios.get(`${apiUrl}/api/v1/payment/seller-orders`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get(`${apiUrl}/api/v1/payment/pending-payments`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      console.log('Orders response:', ordersResponse.data);
      console.log('Payments response:', paymentsResponse.data);

      // Handle different response structures
      const ordersData = ordersResponse.data?.data?.orders || ordersResponse.data?.orders || [];
      const paymentsData = paymentsResponse.data?.data?.payments || paymentsResponse.data?.payments || [];

      setOrders(ordersData);
      setPendingPayments(paymentsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error response:", error.response?.data);
      Swal.fire("Error", "Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.patch(`${apiUrl}/api/v1/payment/approve-payment/${paymentId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      Swal.fire("Success", "Payment approved successfully", "success");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error approving payment:", error);
      console.error("Error response:", error.response?.data);
      Swal.fire("Error", error.response?.data?.message || "Failed to approve payment", "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "placed":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders Management</h2>
      
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "orders"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "pending"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Pending Payments ({pendingPayments.length})
        </button>
      </div>

      {/* Pending Payments Tab */}
      {activeTab === "pending" && (
        <div>
          {pendingPayments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No pending payments</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingPayments.map((payment) => (
                <div key={payment._id} className="border rounded-lg p-6 bg-yellow-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Payment from {payment.buyerId.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Order #{payment.orderId.orderNumber} • {formatDate(payment.createdAt)}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      Pending Approval
                    </span>
                  </div>

                  {/* Payment Screenshot */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Payment Screenshot:</h4>
                    <img
                      src={payment.paymentScreenshot}
                      alt="Payment Screenshot"
                      className="max-w-md rounded-lg border"
                    />
                  </div>

                  {/* Payment Details */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Payment Details:</h4>
                    <div className="bg-white rounded-lg p-3">
                      {payment.paidToBankAccount && (
                        <p className="text-sm text-gray-600">
                          Paid to Bank Account: {payment.paidToBankAccount}
                        </p>
                      )}
                      {payment.paidToWallet && (
                        <p className="text-sm text-gray-600">
                          Paid to Wallet: {payment.paidToWallet}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Amount: ${payment.orderId.totalAmount}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Order Items:</h4>
                    <div className="space-y-2">
                      {payment.orderId.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            {item.product.images && item.product.images.length > 0 && (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{item.product.name}</p>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity} × ${item.price}
                              </p>
                            </div>
                          </div>
                          <span className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprovePayment(payment._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve Payment
                    </button>
                    <button
                      onClick={() => {
                        Swal.fire({
                          title: "Reject Payment",
                          text: "Are you sure you want to reject this payment?",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonText: "Yes, reject it",
                          cancelButtonText: "Cancel",
                        });
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject Payment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Orders Tab */}
      {activeTab === "orders" && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Buyer: {order.buyer.fullName} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            {item.product.images && item.product.images.length > 0 && (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{item.product.name}</p>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity} × ${item.price}
                                {item.variant && (
                                  <span className="ml-2">
                                    ({item.variant.color}, {item.variant.size})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <span className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Shipping:</span>
                      <span>${order.shippingInfo?.cost || 0}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Information */}
                  {order.paymentId && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Payment Status:</h4>
                      <div className={`rounded-lg p-3 ${
                        order.paymentId.confirmed ? "bg-green-50" : "bg-yellow-50"
                      }`}>
                        <p className={`text-sm font-medium ${
                          order.paymentId.confirmed ? "text-green-600" : "text-yellow-600"
                        }`}>
                          {order.paymentId.confirmed ? "✓ Payment Confirmed" : "⏳ Payment Pending"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Shipping Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Shipping Address:</h4>
                    <div className="text-sm text-gray-600">
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                      <p>Phone: {order.shippingAddress.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SellerOrders; 