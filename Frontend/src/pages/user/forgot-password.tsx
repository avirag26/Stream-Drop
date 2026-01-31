import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, verifyResetOtp, clearError, resetForgotPasswordState } from '../../store/slice/authSlice';
import type { AppDispatch, RootState } from '../../store/store';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, resetStep, tempEmail, resetToken } = useSelector((state: RootState) => state.auth);

  console.log('Current state:', { loading, error, resetStep, tempEmail, resetToken });

  useEffect(() => {
    console.log('Reset token changed:', resetToken);
    if (resetToken) {
      console.log('Navigating to reset-password');
      navigate('/reset-password');
    }
  }, [resetToken, navigate]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(forgotPassword(email));
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempEmail && otp) {
      console.log('Submitting OTP:', { email: tempEmail, otp });
      dispatch(verifyResetOtp({ email: tempEmail, otp }));
    }
  };

  const handleBack = () => {
    if (resetStep === 2) {
      dispatch(resetForgotPasswordState());
    } else {
      navigate('/login');
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
    if (error) dispatch(clearError());
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
            {resetStep === 1 ? (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-semibold text-white mb-2">Forgot Password</h1>
                  <p className="text-gray-400 text-sm">Enter your email to receive a reset code</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
                    {error}
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleEmailSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/25"
                  >
                    <span>{loading ? "Sending..." : "Send Reset Code"}</span>
                    {!loading && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-semibold text-white mb-2">Enter Reset Code</h1>
                  <p className="text-gray-400 text-sm">We sent a reset code to</p>
                  <p className="text-blue-400 text-sm font-medium">{tempEmail}</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
                    {error}
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleOtpSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reset Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={handleOtpChange}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-center text-lg tracking-widest"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !otp}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/25"
                  >
                    <span>{loading ? "Verifying..." : "Verify Code"}</span>
                    {!loading && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </form>
              </>
            )}

            <div className="flex justify-between items-center text-sm pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {resetStep === 1 ? 'Back to Login' : 'Back'}
              </button>
              {resetStep === 2 && (
                <button
                  type="button"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Resend Code
                </button>
              )}
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

export default ForgotPassword;