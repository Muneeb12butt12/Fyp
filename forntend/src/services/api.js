// src/services/api.js
const API_BASE_URL = 'http://your-backend-api-url.com/api';

export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getPaymentMethods = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment-methods`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch payment methods');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

export const validateCoupon = async (couponCode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: couponCode }),
    });

    if (!response.ok) {
      throw new Error('Invalid coupon code');
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating coupon:', error);
    throw error;
  }
};