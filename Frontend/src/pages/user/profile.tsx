import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchProfile, updateProfile } from '../../store/slice/profileSlice';
import Header from '../../components/user/Header';
import Footer from '../../components/user/Footer';
import Sidebar from '../../components/user/Sidebar';
import Toast from '../../components/common/Toast';
import { accountSettingsSidebarItems } from '../../constants/sidebarItems';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, updateLoading } = useSelector((state: RootState) => state.profile);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
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

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      await dispatch(updateProfile({ name: formData.name })).unwrap();
      setEditing(false);
      setToast({
        message: 'Profile updated successfully',
        type: 'success',
        show: true
      });
    } catch (error: any) {
      setToast({
        message: error || 'Failed to update profile',
        type: 'error',
        show: true
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar items={accountSettingsSidebarItems} />
        
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-start gap-8">
              {/* Left Section - Profile Details */}
              <div className="flex-1">
                {/* Profile Header */}
                <div className="flex items-center space-x-6 mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
                      <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{profile?.name || 'User'}</h1>
                    <p className="text-blue-400 text-sm mb-1">{profile?.email}</p>
                    <p className="text-gray-500 text-sm">Member since {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '2023'}</p>
                  </div>
                </div>

                {/* Account Details Card */}
                <div className="bg-[#1a1f2e] rounded-lg p-6 border border-gray-800">
                  <div className="flex items-center space-x-2 mb-6">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                    <h2 className="text-xl font-semibold text-white">Account Details</h2>
                  </div>

                  {editing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-[#0f1419] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Email Address</label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full px-4 py-3 bg-[#0f1419] text-gray-500 rounded-lg border border-gray-700 cursor-not-allowed"
                        />
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="submit"
                          disabled={updateLoading}
                          className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {updateLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(false);
                            setFormData({
                              name: profile?.name || '',
                              email: profile?.email || ''
                            });
                          }}
                          className="px-6 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-500 text-sm mb-2">Full Name</label>
                        <div className="flex items-center justify-between px-4 py-3 bg-[#0f1419] rounded-lg border border-gray-800">
                          <p className="text-white">{profile?.name}</p>
                          <button
                            onClick={() => setEditing(true)}
                            className="text-gray-500 hover:text-gray-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-500 text-sm mb-2">Email Address</label>
                        <div className="px-4 py-3 bg-[#0f1419] rounded-lg border border-gray-800">
                          <p className="text-white">{profile?.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
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
                      INSIDE PRIVATE BOX: "PROJECT_NEBULA_VFX"
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
                          {profile?.name?.charAt(0).toUpperCase() || 'A'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{profile?.name || 'Alex Streamer'}</p>
                        <p className="text-blue-400 text-xs">{user?.email || profile?.email}</p>
                      </div>
                      <button className="text-gray-500 hover:text-gray-300">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </button>
                    </div>

                    <p className="text-gray-500 text-xs mt-4 leading-relaxed">
                      This is how you appear to other members when sharing files in a secure box.
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-[#0f1419] rounded-lg p-4 border border-gray-800">
                      <p className="text-gray-500 text-xs mb-1">FILES SHARED</p>
                      <p className="text-white text-2xl font-bold">1,284</p>
                    </div>
                    <div className="bg-[#0f1419] rounded-lg p-4 border border-gray-800">
                      <p className="text-gray-500 text-xs mb-1">TOTAL BANDWIDTH</p>
                      <p className="text-white text-2xl font-bold">4.2 TB</p>
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

export default ProfilePage;
