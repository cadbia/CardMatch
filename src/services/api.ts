/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { Card, ApiResponse, LoginResponse, User } from '../types';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for auth tokens, etc.
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

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle common errors here
    if (error.response) {
      // Server responded with a status code outside of 2xx
      console.error('API Error:', error.response.data);
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        // Redirect to login or refresh token
        console.log('Unauthorized, redirecting to login...');
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // Request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something else happened while setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const register = async (userData: any): Promise<LoginResponse> => {
  return api.post('/auth/register', userData);
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  return api.post('/auth/login', { email, password });
};

export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  return api.get('/auth/me');
};

export const deleteAccount = async (): Promise<ApiResponse<void>> => {
  return api.delete('/users/account');
};

// Card API functions
export const fetchCards = async (): Promise<ApiResponse<Card[]>> => {
  return api.get('/cards');
};

export const fetchCardById = async (id: string): Promise<ApiResponse<Card>> => {
  return api.get(`/cards/${id}`);
};

export const fetchCardRecommendations = async (): Promise<ApiResponse<Card[]>> => {
  return api.get('/cards/recommendations');
};

// User API functions
export const updateUserProfile = async (userData: Partial<User>): Promise<ApiResponse<User>> => {
  return api.put('/users/profile', userData);
};

export const updateUserPreferences = async (preferences: any): Promise<ApiResponse<any>> => {
  return api.put('/users/preferences', preferences);
};

// Mock function to simulate fetching dashboard data
export const fetchDashboardData = async () => {
  try {
    const response = await fetchCardRecommendations();
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

export default api;