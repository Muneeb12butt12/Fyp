// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// API Endpoints
export const API_ENDPOINTS = {
  PRODUCTS: `${API_BASE_URL}/api/products`,
  AUTH: `${API_BASE_URL}/api/auth`,
  SELLER: `${API_BASE_URL}/api/seller`,
  BUYER: `${API_BASE_URL}/api/buyer`,
  ADMIN: `${API_BASE_URL}/api/admin`,
  CART: `${API_BASE_URL}/api/cart`,
  PAYMENT: `${API_BASE_URL}/api/payment`,
};
