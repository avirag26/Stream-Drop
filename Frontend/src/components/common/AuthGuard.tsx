import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { logout } from '../../store/slice/authSlice';
import api from '../../services/api';

const AuthGuard = () => {
    const [checking, setChecking] = useState(true);
    const { user, token } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const checkUserStatus = async () => {
            if (!token || !user) {
                setChecking(false);
                return;
            }

            try {
                await api.get('/auth/status');
                setChecking(false);
            } catch (error: any) {
                if (error.response?.status === 403) {
                    
                    alert('Your account has been suspended.');
                }
                dispatch(logout());
                setChecking(false);
            }
        };

        checkUserStatus();
    }, [token, user, dispatch]);

    if (checking) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Checking access...</div>
            </div>
        );
    }

    return user && token ? <Outlet /> : <Navigate to="/login" />;
};

export default AuthGuard;