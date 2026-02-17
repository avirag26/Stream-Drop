import axios from 'axios';
import { logout } from '../store/slice/authSlice';
import { logout as adminLogout } from '../store/slice/adminSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, 
});


let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

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
    const originalRequest = error.config;


    const isLoginRequest = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/google') ||
                          error.config?.url?.includes('/admin/login');

    if (error.response) {
      const status = error.response.status;


      if ((status === 401 || status === 403) && isLoginRequest) {
        console.warn("Login failed or account blocked.");
        return Promise.reject(error);
      }


      if (status === 401 && !originalRequest._retry && !isLoginRequest) {
        if (isRefreshing) {
     
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
       
          const isAdminRequest = originalRequest.url?.includes('/admin');
          const refreshEndpoint = isAdminRequest ? '/admin/refresh-token' : '/auth/refresh-token';
          
   
          const response = await api.post(refreshEndpoint);
          const newToken = response.data.data.accessToken || response.data.data.token;

          if (newToken) {
          
            if (isAdminRequest) {
              const { setToken } = await import('../store/slice/adminSlice');
              store.dispatch(setToken(newToken));
            } else {
              const { setToken } = await import('../store/slice/authSlice');
              store.dispatch(setToken(newToken));
            }

       
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            processQueue(null, newToken);
            
          
            return api(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          
    
          console.warn("Session expired. Logging out...");
          
          if (originalRequest.url?.includes('/admin')) {
            store.dispatch(adminLogout());
            window.location.href = '/admin/login';
          } else {
            store.dispatch(logout());
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      
      if (status === 403 && !isLoginRequest) {
        console.warn("Account blocked or insufficient permissions. Logging out...");
        
        if (originalRequest.url?.includes('/admin')) {
          store.dispatch(adminLogout());
          window.location.href = '/admin/login';
        } else {
          store.dispatch(logout());
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;