import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { googleLogin } from '../../store/slice/authSlice';
import { useGoogleOAuth } from '../providers/GoogleOAuthProvider';
import type { AppDispatch, RootState } from '../../store/store';

interface GoogleLoginButtonProps {
  text?: string;
  className?: string;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  text = "Continue with Google",
  className = ""
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const { isLoaded, error } = useGoogleOAuth();

  const handleGoogleLogin = () => {
    if (!isLoaded || !window.google) {
      console.error('Google Identity Services not ready');
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    console.log('Using Google Client ID:', clientId);

    // Try using renderButton instead of prompt
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'none';
    document.body.appendChild(buttonContainer);

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(buttonContainer, {
      theme: 'filled_blue',
      size: 'large',
      text: 'signin_with',
    });

    // Programmatically click the hidden button
    const googleButton = buttonContainer.querySelector('div[role="button"]') as HTMLElement;
    if (googleButton) {
      googleButton.click();
    }

    // Clean up
    setTimeout(() => {
      document.body.removeChild(buttonContainer);
    }, 1000);
  };

  const handleCredentialResponse = (response: { credential: string }) => {
    if (response.credential) {
      dispatch(googleLogin(response.credential));
    }
  };

  if (error) {
    return (
      <div className="w-full p-3 text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg">
        Google OAuth Error: {error}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading || !isLoaded}
      className={`w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
      ) : (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      {loading ? 'Signing in...' : !isLoaded ? 'Loading Google...' : text}
    </button>
  );
};

export default GoogleLoginButton;