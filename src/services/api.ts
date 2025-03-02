import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api', // This would be your actual API base URL in production
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for auth tokens, etc.
api.interceptors.request.use(
  (config) => {
    // You could add auth tokens here
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

// Mock API functions

// Mock function to simulate fetching dashboard data
export const fetchDashboardData = async () => {
  // In a real app, this would be: return api.get('/dashboard');
  
  // For now, return mock data after a short delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          name: 'Premium Rewards Card',
          provider: 'Capital One',
          category: 'Travel',
          matchScore: 95,
        },
        {
          id: '2',
          name: 'Cash Back Preferred',
          provider: 'Chase',
          category: 'Cash Back',
          matchScore: 88,
        },
        {
          id: '3',
          name: 'Student Rewards',
          provider: 'Discover',
          category: 'Student',
          matchScore: 82,
        },
        {
          id: '4',
          name: 'Business Platinum',
          provider: 'American Express',
          category: 'Business',
          matchScore: 75,
        },
      ]);
    }, 1000);
  });
};

// Mock login function
export const login = async (email: string, password: string) => {
  // In a real app, this would be: return api.post('/auth/login', { email, password });
  
  // For now, return mock data after a short delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        token: 'mock-jwt-token',
        user: {
          id: '123',
          email,
          name: 'Test User',
        },
      });
    }, 800);
  });
};

export default api;