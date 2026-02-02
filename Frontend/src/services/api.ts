import axios from 'axios';
import { logout } from '../store/slice/authSlice';
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(async (config) => {
  try {
    const { store } = await import('../store/store');
    
   
    if (config.url?.includes('/admin')) {
      const adminToken = store.getState().admin.token;
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
     
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

api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const { store } = await import('../store/store');
    

    const isLoginRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/google');

    if (error.response) {
      const status = error.response.status;

      if ((status === 401 || status === 403) ) {
        
        console.warn("Session expired or account blocked. Logging out...");
        
       
        store.dispatch(logout());

  
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;