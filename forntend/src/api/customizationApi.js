import axios from 'axios';

// For local development (matches your backend PORT=5000)
const API_BASE_URL = 'http://localhost:5000/api'; 

export const saveCustomization = async (customizationData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/customizations`, customizationData);
    return response.data;
  } catch (error) {
    console.error('Error saving customization:', error);
    throw error;
  }
};

export const uploadImage = async (file, type) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type); // 'logo' or 'pattern'
    
    const response = await axios.post(`${API_BASE_URL}/uploads`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(percentCompleted);
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const getProductOptions = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/${productId}/options`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product options:', error);
    throw error;
  }
};