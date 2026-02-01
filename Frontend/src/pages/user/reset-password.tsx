import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { finalizeReset, clearError } from '../../store/slice/authSlice';
import type { AppDispatch, RootState } from '../../store/store';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, tempEmail, resetToken } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!resetToken || !tempEmail) {
      navigate('/forgot-password');
    }
  }, [resetToken, tempEmail, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any existing local errors
    setPasswordError('');
    
    // Basic frontend validation
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (tempEmail && resetToken) {
      dispatch(finalizeReset({
        email: tempEmail,
        token: resetToken,
        password
      })).then((result) => {
        if (result.type === 'auth/finalizeReset/fulfilled') {
          navigate('/login');
        }
        // Backend validation errors will be automatically handled by Redux and shown in the error state
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError('');
    if (error) dispatch(clearError());
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (passwordError) setPasswordError('');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="flex justify-between items-center p-6">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <span className="text-white text-xl font-semibold">StreamDrop</span>
        </Link>
        <div className="text-gray-400 text-sm">
          Remember your password? <Link to="/login" className="text-blue-400 hover:text-blue-300">Log In</Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-white mb-2">Reset Password</h1>
              <p className="text-gray-400 text-sm">Enter your new password for</p>
              <p className="text-blue-400 text-sm font-medium">{tempEmail}</p>
            </div>

            {(error || passwordError) && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
                {error || passwordError}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with letters, numbers, and special characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/25"
              >
                <span>{loading ? "Updating..." : "Update Password"}</span>
                {!loading && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </form>

            <div className="flex justify-center items-center text-sm pt-4">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Back to Reset
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 mb-3">
              SECURED BY AES-256 ENCRYPTION
            </p>
            <div className="flex justify-center space-x-6 text-xs text-gray-500">
              <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;