import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart, getCartTotal } = useCart();
  
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      phone: "",
      additionalInfo: "",
    },
    billingAddress: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      phone: "",
      additionalInfo: "",
    },
    paidToBankAccount: "",
    paidToWallet: "",
    paymentScreenshot: null,
  });

  // Validate cart and admin
  useEffect(() => {
    if (!cart || cart.length === 0) {
      Swal.fire("Error", "Your cart is empty", "error");
      navigate("/cart");
      return;
    }

    // Group items by seller for multi-seller support
    const itemsBySeller = {};
    cart.forEach(item => {
      const itemSellerId = item.sellerId || item.seller?._id || item.seller;
      if (!itemsBySeller[itemSellerId]) {
        itemsBySeller[itemSellerId] = [];
      }
      itemsBySeller[itemSellerId].push(item);
    });

    console.log("Items grouped by seller:", itemsBySeller);

    // Validate cart data locally first
    validateCartData();
  }, [cart, navigate]);

  // Auto-update billing address when shipping address changes and checkbox is checked
  useEffect(() => {
    if (sameAsShipping) {
      setFormData(prev => ({
        ...prev,
        billingAddress: { ...prev.shippingAddress }
      }));
    }
  }, [formData.shippingAddress, sameAsShipping]);

  const validateCartData = async () => {
    try {
      console.log("Starting cart validation with cart data:", cart);
      
      // Basic local validation
      for (const item of cart) {
        console.log("Validating item:", item);
        
        if (!item._id || !item.quantity || !item.price) {
          console.error("Invalid item data:", item);
          Swal.fire("Error", "Invalid cart item data", "error");
          navigate("/cart");
          return;
        }
        
        if (item.quantity < 1) {
          console.error("Invalid quantity:", item.quantity);
          Swal.fire("Error", "Item quantity must be at least 1", "error");
          navigate("/cart");
          return;
        }
        
        if (item.price <= 0) {
          console.error("Invalid price:", item.price);
          Swal.fire("Error", "Item price must be greater than 0", "error");
          navigate("/cart");
          return;
        }
      }
      
      console.log("Cart validated locally successfully");
      fetchAdminDetails();
    } catch (error) {
      console.error("Local cart validation error:", error);
      Swal.fire("Error", "Cart validation failed", "error");
      navigate("/cart");
    }
  };

  const fetchAdminDetails = async () => {
    try {
      console.log("Fetching admin details for checkout");
      setAdminLoading(true);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const url = `${API_URL}/api/admin/checkout-details`;
      console.log("Making API call to:", url);
      
      // Use our new admin checkout details API endpoint
      const response = await axios.get(url);
      
      console.log("Admin details response:", response.data);
      console.log("Response status:", response.status);
      
      if (response.data && response.data.success) {
        const adminData = {
          _id: response.data.data._id,
          businessName: response.data.data.businessName || "SportWearXpress",
          fullName: response.data.data.fullName,
          bankAccounts: response.data.data.bankAccounts || [],
          wallets: response.data.data.wallets || [],
          status: response.data.data.status
        };
      
        console.log("Processed admin data:", adminData);
        console.log("Bank accounts count:", adminData.bankAccounts.length);
        console.log("Wallets count:", adminData.wallets.length);
        console.log("Bank accounts:", adminData.bankAccounts);
        console.log("Wallets:", adminData.wallets);
        
        setAdmin(adminData);
        console.log("Admin data set:", adminData);
      } else {
        console.error("Invalid response format:", response.data);
        throw new Error("Invalid response format");
      }
      
    } catch (error) {
      console.error("Error fetching admin details:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);
      
      // Create fallback admin data if API fails
      const fallbackAdmin = {
        _id: "admin",
        businessName: "SportWearXpress",
        bankAccounts: [],
        wallets: []
      };
      
      setAdmin(fallbackAdmin);
      console.log("Using fallback admin data:", fallbackAdmin);
      
      // Show warning but don't block checkout
      Swal.fire({
        title: "Warning",
        text: "Could not fetch admin payment details. You can still proceed with checkout.",
        icon: "warning",
        confirmButtonText: "Continue"
      });
    } finally {
      setAdminLoading(false);
      setLoading(false);
    }
  };

  const handleInputChange = (e, addressType = null) => {
    const { name, value } = e.target;
    
    if (addressType) {
      // If user is editing billing address and checkbox is checked, uncheck it
      if (addressType === "billingAddress" && sameAsShipping) {
        setSameAsShipping(false);
      }
      
      setFormData(prev => ({
        ...prev,
        [addressType]: {
          ...prev[addressType],
          [name]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        Swal.fire("Error", "Please upload an image file", "error");
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire("Error", "File size must be less than 5MB", "error");
        return;
      }

      setFormData(prev => ({
        ...prev,
        paymentScreenshot: file,
      }));
    }
  };

  const handleSameAsShippingChange = (e) => {
    const isChecked = e.target.checked;
    setSameAsShipping(isChecked);
    
    if (isChecked) {
      // Copy shipping address to billing address
      setFormData(prev => ({
        ...prev,
        billingAddress: { ...prev.shippingAddress }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.paymentScreenshot) {
      Swal.fire("Error", "Please upload payment screenshot", "error");
      return;
    }

    if (!formData.paidToBankAccount && !formData.paidToWallet) {
      Swal.fire("Error", "Please select a payment method", "error");
      return;
    }

    // Validate addresses
    const requiredAddressFields = ['street', 'city', 'state', 'country', 'zipCode', 'phone'];
    for (const field of requiredAddressFields) {
      if (!formData.shippingAddress[field] || !formData.billingAddress[field]) {
        Swal.fire("Error", `Please fill in all required address fields`, "error");
        return;
      }
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Group cart items by seller
      const itemsBySeller = {};
      cart.forEach(item => {
        const sellerId = item.sellerId || item.seller?._id || item.seller;
        if (!itemsBySeller[sellerId]) {
          itemsBySeller[sellerId] = [];
        }
        itemsBySeller[sellerId].push({
        product: item._id,
        quantity: item.quantity,
        price: item.price,
          color: item.selectedColor,
          size: item.selectedSize,
        name: item.name,
        images: item.images
        });
      });

      // Convert to array format expected by backend
      const cartItems = Object.keys(itemsBySeller).map(sellerId => ({
        sellerId,
        items: itemsBySeller[sellerId],
        paidToBankAccount: formData.paidToBankAccount,
        paidToWallet: formData.paidToWallet
      }));
      
      // Add order details
      formDataToSend.append("cartItems", JSON.stringify(cartItems));
      formDataToSend.append("shippingAddress", JSON.stringify(formData.shippingAddress));
      formDataToSend.append("billingAddress", JSON.stringify(formData.billingAddress));
      formDataToSend.append("paymentScreenshot", formData.paymentScreenshot);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/api/v1/order/create-from-cart`, formDataToSend, {        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        title: "Order Placed Successfully!",
        text: "Your order has been placed and is pending admin approval.",
        icon: "success",
        confirmButtonText: "View Orders",
      }).then(() => {
        clearCart();
        navigate("/buyer/orders");
      });

    } catch (error) {
      console.error("Error creating order:", error);
      Swal.fire("Error", error.response?.data?.message || "Failed to place order", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate totals
  const subtotal = getCartTotal();
  const shippingCost = 10; // Fixed shipping cost
  const totalAmount = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            {cart.map((item, index) => (
              <div key={`${item._id}-${item.selectedColor}-${item.selectedSize}`} className="flex justify-between items-center py-2 border-b">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    Qty: {item.quantity} × ${item.price}
                    {item.selectedColor && item.selectedSize && (
                      <span className="ml-2">
                        ({item.selectedColor}, {item.selectedSize})
                      </span>
                    )}
                  </p>
                </div>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            
            {/* Admin Payment Information */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">SportWearXpress</h3>
              
              {adminLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-blue-700">Loading admin details...</span>
                </div>
              ) : admin ? (
                <>
                  {admin.businessName && (
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>Business:</strong> {admin.businessName}
                    </p>
                  )}
                  
                  {admin.bankAccounts && admin.bankAccounts.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-medium text-sm text-blue-800">Bank Accounts:</h4>
                      {admin.bankAccounts.map((account, index) => (
                        <div key={index} className="text-sm text-blue-700 ml-2 mb-1 p-2 bg-blue-50 rounded">
                          <div><strong>Bank:</strong> {account.type === 'other' ? account.otherBankName : account.type}</div>
                          <div><strong>Account Title:</strong> {account.accountTitle}</div>
                          <div><strong>Account Number:</strong> {account.accountNumber}</div>
                          {account.branchCode && <div><strong>Branch Code:</strong> {account.branchCode}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {admin.wallets && admin.wallets.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-blue-800">Wallets:</h4>
                      {admin.wallets.map((wallet, index) => (
                        <div key={index} className="text-sm text-blue-700 ml-2 mb-1 p-2 bg-blue-50 rounded">
                          <div><strong>Type:</strong> {wallet.type === 'other' ? wallet.otherWalletName : wallet.type}</div>
                          <div><strong>Account Title:</strong> {wallet.accountTitle}</div>
                          <div><strong>Account Number:</strong> {wallet.accountNumber}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {(!admin.bankAccounts || admin.bankAccounts.length === 0) && 
                   (!admin.wallets || admin.wallets.length === 0) && (
                    <div className="text-sm text-orange-600 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="font-medium mb-2">No payment methods available</p>
                      <p className="text-xs">
                        SportWearXpress hasn't added any payment methods to their profile yet. 
                        Please contact SportWearXpress support to add their bank accounts or digital wallets 
                        so you can complete your purchase.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-red-600">
                  Could not load admin payment details.
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                
                {admin?.bankAccounts && admin.bankAccounts.length > 0 && (
                  <div className="mb-2">
                    <select
                      name="paidToBankAccount"
                      value={formData.paidToBankAccount}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Bank Account</option>
                      {admin.bankAccounts.map((account, index) => (
                        <option key={index} value={account.accountNumber}>
                          {(account.type === 'other' ? account.otherBankName : account.type)} - {account.accountTitle} ({account.accountNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {admin?.wallets && admin.wallets.length > 0 && (
                  <div>
                    <select
                      name="paidToWallet"
                      value={formData.paidToWallet}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Wallet</option>
                      {admin.wallets.map((wallet, index) => (
                        <option key={index} value={wallet.accountNumber}>
                          {(wallet.type === 'other' ? wallet.otherWalletName : wallet.type)} - {wallet.accountTitle} ({wallet.accountNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(!admin?.bankAccounts || admin.bankAccounts.length === 0) && 
                 (!admin?.wallets || admin.wallets.length === 0) && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> No payment methods are available for SportWearXpress. 
                      SportWearXpress needs to add payment methods to their profile before you can complete your purchase.
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Screenshot Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Screenshot *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload a screenshot of your payment confirmation (Max 5MB)
                </p>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Shipping Address *</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="street"
                    placeholder="Street Address"
                    value={formData.shippingAddress.street}
                    onChange={(e) => handleInputChange(e, "shippingAddress")}
                    className="col-span-2 p-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.shippingAddress.city}
                    onChange={(e) => handleInputChange(e, "shippingAddress")}
                    className="p-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.shippingAddress.state}
                    onChange={(e) => handleInputChange(e, "shippingAddress")}
                    className="p-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={formData.shippingAddress.country}
                    onChange={(e) => handleInputChange(e, "shippingAddress")}
                    className="p-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={formData.shippingAddress.zipCode}
                    onChange={(e) => handleInputChange(e, "shippingAddress")}
                    className="p-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.shippingAddress.phone}
                    onChange={(e) => handleInputChange(e, "shippingAddress")}
                    className="p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              {/* Billing Address */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Billing Address *</h3>
                  <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={handleSameAsShippingChange}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    Same as shipping address
                  </label>
                </div>
                {sameAsShipping && (
                  <p className="text-xs text-blue-600 mb-2">
                    ✓ Billing address will be automatically filled with your shipping address
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="street"
                    placeholder="Street Address"
                    value={formData.billingAddress.street}
                    onChange={(e) => handleInputChange(e, "billingAddress")}
                    className={`col-span-2 p-2 border border-gray-300 rounded-md ${sameAsShipping ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    required
                    readOnly={sameAsShipping}
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.billingAddress.city}
                    onChange={(e) => handleInputChange(e, "billingAddress")}
                    className={`p-2 border border-gray-300 rounded-md ${sameAsShipping ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    required
                    readOnly={sameAsShipping}
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.billingAddress.state}
                    onChange={(e) => handleInputChange(e, "billingAddress")}
                    className={`p-2 border border-gray-300 rounded-md ${sameAsShipping ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    required
                    readOnly={sameAsShipping}
                  />
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={formData.billingAddress.country}
                    onChange={(e) => handleInputChange(e, "billingAddress")}
                    className={`p-2 border border-gray-300 rounded-md ${sameAsShipping ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    required
                    readOnly={sameAsShipping}
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={formData.billingAddress.zipCode}
                    onChange={(e) => handleInputChange(e, "billingAddress")}
                    className={`p-2 border border-gray-300 rounded-md ${sameAsShipping ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    required
                    readOnly={sameAsShipping}
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.billingAddress.phone}
                    onChange={(e) => handleInputChange(e, "billingAddress")}
                    className={`p-2 border border-gray-300 rounded-md ${sameAsShipping ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    required
                    readOnly={sameAsShipping}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || adminLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;