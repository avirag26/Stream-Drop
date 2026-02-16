import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { changePassword } from '../../store/slice/profileSlice';
import Header from '../../components/user/Header';
import Footer from '../../components/user/Footer';
import Sidebar from '../../components/user/Sidebar';
import Toast from '../../components/common/Toast';
import { accountSettingsSidebarItems } from '../../constants/sidebarItems';
import { calculatePasswordStrength } from '../../utils/passwordStrength';

const SecurityPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { passwordLoading } = useSelector((state: RootState) => state.profile);
  const { profile } = useSelector((state: RootState) => state.profile);
  const { user } = useSelector((state: RootState) => state.auth);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    show: boolean;
  }>({
    message: '',
    type: 'success',
    show: false
  });

  // Calculate password strength dynamically
  const passwordStrength = useMemo(() => {
    return calculatePasswordStrength(passwordData.newPassword);
  }, [passwordData.newPassword]);

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({
        message: 'Passwords do not match',
        type: 'error',
        show: true
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setToast({
        message: 'Password must be at least 6 characters',
        type: 'error',
        show: true
      });
      return;
    }

    try {
      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap();

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setToast({
        message: 'Password changed successfully',
        type: 'success',
        show: true
      });
    } catch (error: any) {
      setToast({
        message: error || 'Failed to change password',
        type: 'error',
        show: true
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar items={accountSettingsSidebarItems} />
        
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-start gap-8">
              {/* Left Section - Security Settings */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Security Command Center</h1>
                    <p className="text-gray-400 text-sm">Manage your authentication protocols and safeguard your digital assets</p>
                  </div>
                </div>

                {/* Change Password Section */}
                <div className="bg-[#1a1f2e] rounded-lg p-6 border border-gray-800 mb-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white mb-1">CURRENT PASSWORD</h2>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-3 bg-[#0f1419] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {showCurrentPassword ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          )}
                        </svg>
                      </button>
                    </div>

                    <div className="pt-4">
                      <h2 className="text-lg font-semibold text-white mb-4">NEW ACCESS KEY</h2>
                      <p className="text-gray-400 text-sm mb-4">New complexity keys required</p>
                      
                      <div className="relative mb-4">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Enter new password"
                          className="w-full px-4 py-3 bg-[#0f1419] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {showNewPassword ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            )}
                          </svg>
                        </button>
                      </div>

                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 bg-[#0f1419] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors mb-4"
                        required
                      />

                      <div className="bg-[#0f1419] rounded-lg p-4 border border-gray-800 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">ENTROPY STRENGTH</span>
                          <span className={`text-sm font-semibold ${
                            passwordStrength.level === 'strong' ? 'text-green-400' :
                            passwordStrength.level === 'good' ? 'text-cyan-400' :
                            passwordStrength.level === 'fair' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {passwordStrength.percentage}% / {passwordStrength.level.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex space-x-1 mb-3">
                          <div className={`flex-1 h-2 rounded ${
                            passwordStrength.percentage >= 33 ? 
                            (passwordStrength.level === 'strong' ? 'bg-green-500' : 
                             passwordStrength.level === 'good' ? 'bg-cyan-500' : 
                             passwordStrength.level === 'fair' ? 'bg-yellow-500' : 'bg-red-500') 
                            : 'bg-gray-700'
                          }`}></div>
                          <div className={`flex-1 h-2 rounded ${
                            passwordStrength.percentage >= 66 ? 
                            (passwordStrength.level === 'strong' ? 'bg-green-500' : 'bg-cyan-500') 
                            : 'bg-gray-700'
                          }`}></div>
                          <div className={`flex-1 h-2 rounded ${
                            passwordStrength.percentage >= 90 ? 'bg-green-500' : 'bg-gray-700'
                          }`}></div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {passwordStrength.hasUppercase ? (
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span className="text-gray-400 text-xs">UPPERCASE ALPHA</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {passwordStrength.hasNumbers ? (
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span className="text-gray-400 text-xs">NUMERIC DIGITS</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {passwordStrength.hasSymbols ? (
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span className="text-gray-400 text-xs">SYMBOLIC CHARS</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{passwordLoading ? 'Updating...' : 'Commit Security Update'}</span>
                      </button>
                      <button
                        type="button"
                        className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        
                      >
                        Reset Form
                      </button>
                    </div>
                  </form>

                  {/* Hazardous Action */}
                 
                </div>
              </div>

              {/* Right Section - Identity Preview */}
              <div className="w-96">
                <div className="bg-[#1a1f2e] rounded-lg p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                      </svg>
                      <h3 className="text-lg font-semibold text-white">Identity Preview</h3>
                    </div>
                    <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded font-medium">
                      LIVE RENDER
                    </span>
                  </div>

                  <div className="bg-[#0f1419] rounded-lg p-4 border border-blue-500/30">
                    <div className="text-xs text-gray-500 mb-3 font-mono">
                      USER CONTEXT: "PROJECT_NEBULA_VFX"
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-4 p-3 bg-[#1a1f2e] rounded-lg">
                      <div className="w-10 h-10 bg-blue-500/20 rounded flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">Nebula_Final_Render_4K.mp4</p>
                        <p className="text-gray-500 text-xs">Shared by you</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-[#1a1f2e] rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {profile?.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'A'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{profile?.name || user?.name || 'Alex Streamer'}</p>
                        <p className="text-blue-400 text-xs">{user?.email || profile?.email}</p>
                      </div>
                      <button className="text-gray-500 hover:text-gray-300">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </button>
                    </div>

                    <p className="text-gray-500 text-xs mt-4 leading-relaxed">
                      Visual representation to secure collaboration clusters.
                    </p>
                  </div>

                  {/* Recent Security Logs */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                      RECENT SECURITY LOGS
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Login from Pasadena, CA</span>
                        <span className="text-gray-500">5d ago</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">API Key Rotation</span>
                        <span className="text-gray-500">8d ago</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cyan-400">Password Last Changed</span>
                        <span className="text-gray-500">10d ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default SecurityPage;
