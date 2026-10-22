import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campus_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle if an HTTP response was received (distinguishes network errors and timeouts)
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';

      // Do not clear storage on authentication attempt endpoints or health checks
      const isAuthAttempt =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/demo-login') ||
        url.includes('/health');

      if (!isAuthAttempt) {
        const currentToken = localStorage.getItem('campus_auth_token');

        // If currently in offline demo mode with a synthetic token, preserve session
        // so service catch-blocks can safely deliver local fallback mock data
        const isSyntheticDemoToken = currentToken && currentToken.startsWith('demo_jwt_token_');

        if (!isSyntheticDemoToken && currentToken) {
          // Real JWT has expired or was rejected by backend
          localStorage.removeItem('campus_auth_token');
          localStorage.removeItem('campus_auth_user');

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('campus:auth-expired'));
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
