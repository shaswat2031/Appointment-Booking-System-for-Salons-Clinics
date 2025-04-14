// Make sure this file has the correct API URL
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Update this to match your backend URL
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token when available
API.interceptors.request.use((config) => {
  const vendorToken = localStorage.getItem('vendorToken');
  if (vendorToken) {
    config.headers['Authorization'] = `Bearer ${vendorToken}`;
  }
  return config;
});

// Add response interceptor for better error handling
API.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default API;
