import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from './store/store';
import { logout } from './store/slice/authSlice';
import api from './services/api';
import AppRoutes from './routes';

function App() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const checkUserOnRefresh = async () => {
     
      if (!token || !user) return;

      try {
        await api.get('/auth/status');
        console.log('User status check on refresh: OK');
      } catch (error: any) {
        console.log('User status check failed on refresh:', error.response?.data?.message);
        
        if (error.response?.status === 403) {
       
        }
        
        dispatch(logout());
      }
    };

    checkUserOnRefresh();
  }, []); 

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;