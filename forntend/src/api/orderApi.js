import axios from 'axios';

const API_URL = '/api/orders';

// Create new order
export const createOrder = async (orderData) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const response = await axios.post(API_URL, orderData, config);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};

// Get all orders
export const getOrders = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error.message;
  }
};