import axios from 'axios';
import { auth } from '@/services/firebase';

// Track if we're currently refreshing to avoid infinite loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor: attach fresh token to every request
axios.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('[Auth] Failed to get ID token for request:', error?.message || error);
  }
  return config;
});

// Response interceptor: handle 401 errors with automatic retry
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Only handle 401 errors and prevent infinite retry loops
    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axios(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const user = auth.currentUser;
    if (!user) {
      // No user logged in, redirect to login
      console.warn('[Auth] 401 received but no user is logged in. Redirecting to login.');
      isRefreshing = false;
      processQueue(new Error('Not authenticated'), null);
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      // Force refresh the token
      const newToken = await user.getIdToken(true);
      console.info('[Auth] Token force-refreshed successfully after 401');
      
      processQueue(null, newToken);
      
      // Retry the original request with new token
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      return axios(originalRequest);
    } catch (refreshError) {
      console.error('[Auth] Token refresh failed after 401:', refreshError?.message || refreshError);
      processQueue(refreshError, null);
      
      // Refresh token is likely revoked (password change, account disabled, etc.)
      // Sign out and redirect to login
      try {
        await auth.signOut();
      } catch (signOutError) {
        console.error('[Auth] Sign out failed:', signOutError?.message || signOutError);
      }
      
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export {}; // ensure module side-effects run on import