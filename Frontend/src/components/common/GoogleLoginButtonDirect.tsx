import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { googleLogin } from '../../store/slice/authSlice';
import type { AppDispatch, RootState } from '../../store/store';

interface GoogleLoginButtonDirectProps {
  text?: string;
  className?: string;
}

const GoogleLoginButtonDirect: React.FC<GoogleLoginButtonDirectProps> = ({ 
  text = "Continue with Google",
  className = ""
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.google && buttonRef.current) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      console.log('Direct Google Client ID:', clientId);

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'filled_blue',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
      });
    }
  }, []);

  const handleCredentialResponse = (response: { credential: string }) => {
    if (response.credential) {
      dispatch(googleLogin(response.credential));
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg text-white bg-gray-800">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        Signing in...
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div ref={buttonRef} className="w-full flex justify-center"></div>
    </div>
  );
};

export default GoogleLoginButtonDirect;