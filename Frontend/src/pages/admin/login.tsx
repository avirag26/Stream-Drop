import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogin, clearAdminError } from '../../store/slice/adminSlice'; // Ensure this exists
import type { AppDispatch, RootState } from '../../store/store';

const AdminLogin: React.FC = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, admin, token } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    if (admin && token) {
      navigate('/admin/dashboard');
    }
  }, [admin, token, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (error) dispatch(clearAdminError());
    
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(adminLogin(credentials));
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col font-sans">
      {/* Header Section */}
      <header className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
             <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
             </svg>
          </div>
          <span className="text-white text-xl font-bold tracking-tight">StreamDrop <span className="text-red-500">Admin</span></span>
        </Link>
        <div className="text-gray-400 text-sm">
          Regular user? <Link to="/login" className="text-red-500 hover:text-red-400 font-medium">User Login</Link>
        </div>
      </header>

      {/* Main Form Section */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
            {/* Subtle Gradient Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl"></div>
            
            <div className="text-center mb-10 relative z-10">
              <h1 className="text-3xl font-bold text-white mb-3">Admin Portal</h1>
              <p className="text-gray-400 text-sm">Secure access for StreamDrop administrators</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center space-x-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email" // ESSENTIAL FOR CHANGE HANDLER
                  required
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="admin@streamdrop.com"
                  className="w-full px-4 py-3.5 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Secure Password
                </label>
                <input
                  type="password"
                  name="password" // ESSENTIAL FOR CHANGE HANDLER
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/40 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 disabled:text-gray-400 text-white py-4 rounded-xl font-bold transition-all duration-300 transform active:scale-[0.98] shadow-lg shadow-red-600/20 flex items-center justify-center space-x-3 mt-4"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <span>Access Dashboard</span>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center text-gray-500 text-xs">
            <p className="mb-2">UNAUTHORIZED ACCESS IS PROHIBITED</p>
            <div className="flex justify-center space-x-4">
              <span className="hover:text-gray-300 cursor-help underline underline-offset-4">Security Protocol</span>
              <span className="hover:text-gray-300 cursor-help underline underline-offset-4">System Status</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;