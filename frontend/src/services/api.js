// frontend/src/services/api.js
import axios from 'axios';



const API_URL = "http://localhost:5000/api/speech";


// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const uploadAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.wav");

  const response = await axios.post(`${API_URL}/convert`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export default api;