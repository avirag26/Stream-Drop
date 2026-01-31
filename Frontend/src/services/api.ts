import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(async (config) => {
  try {
    const { store } = await import('../store/store');
    
    // Check if this is an admin request
    if (config.url?.includes('/admin')) {
      const adminToken = store.getState().admin.token;
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      // Regular user token
      const token = store.getState().auth.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error("Could not inject token into request", error);
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;