import React, { createContext, useContext, useEffect, useState } from 'react';

interface GoogleOAuthContextType {
  isLoaded: boolean;
  error: string | null;
}

const GoogleOAuthContext = createContext<GoogleOAuthContextType>({
  isLoaded: false,
  error: null,
});

export const useGoogleOAuth = () => useContext(GoogleOAuthContext);

interface GoogleOAuthProviderProps {
  children: React.ReactNode;
  clientId: string;
}

export const GoogleOAuthProvider: React.FC<GoogleOAuthProviderProps> = ({
  children,
  clientId,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeGoogleOAuth = () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: () => {}, // This will be overridden by individual components
          });
          setIsLoaded(true);
        } catch (err) {
          setError('Failed to initialize Google OAuth');
          console.error('Google OAuth initialization error:', err);
        }
      } else {
        // Wait for Google script to load
        setTimeout(initializeGoogleOAuth, 100);
      }
    };

    initializeGoogleOAuth();
  }, [clientId]);

  const value = {
    isLoaded,
    error,
  };

  return (
    <GoogleOAuthContext.Provider value={value}>
      {children}
    </GoogleOAuthContext.Provider>
  );
};