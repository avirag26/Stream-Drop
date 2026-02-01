import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import api from '../../services/api';

const AuthGuard = () => {
    const [status, setStatus] = useState<'loading' | 'active' | 'blocked'>('loading');
    const { user, token } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const verifyStatus = async () => {
            // Check if user has token first
            if (!token || !user) {
                console.log('No token or user found, redirecting to login');
                setStatus('blocked');
                return;
            }

            try {
                console.log('Verifying auth status with token:', token);
                await api.get('/auth/status');
                console.log('Auth verification successful');
                setStatus('active');
            } catch (err: any) {
                console.error('Auth status check failed:', err.response?.data || err.message);
                setStatus('blocked');
            }
        };
        verifyStatus();
    }, [token, user]);

    if (status === 'loading') return <div>Verifying Security Credentials...</div>;
    
    return status === 'active' ? <Outlet /> : <Navigate to="/login" />;
};

export default AuthGuard;