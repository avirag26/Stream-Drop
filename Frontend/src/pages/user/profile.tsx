import React, { useState, useEffect, ChangeEvent, FormEvent as ReactFormEvent } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import Layout from '../../components/user/Layout';
import api from '../../services/api';
import Toast from '../../components/common/Toast';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  tier: string;
  is_verified: boolean;
  createdAt: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      if (response.data.success) {
        setProfile(response.data.data);
        setFormData({
          name: response.data.data.name,
          email: response.data.data.email
        });
      }
    } catch (error: any) {
      setToast({
        message: error.response?.data?.message || 'Failed to load profile',
        type: 'error',
        show: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: ReactFormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const response = await api.put('/profile', formData);
      if (response.data.success) {
        setProfile(response.data.data);
        setEditing(false);
        setToast({
          message: 'Profile updated successfully',
          type: 'success',
          show: true
        });
      }
    } catch (error: any) {
      setToast({
        message: error.response?.data?.message || 'Failed to update profile',
        type: 'error',
        show: true
      });
    }
  };

  const handleChangePassword = async (e: ReactFormEvent<HTMLFormElement>) => {
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
      const response = await api.post('/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setChangingPassword(false);
        setToast({
          message: 'Password changed successfully',
          type: 'success',
          show: true
        });
      }
    } catch (error: any) {
      setToast({
        message: error.response?.data?.message || 'Failed to change password',
        type: 'error',
        show: true
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

          {/* Profile Information Card */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Profile Information</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
                  >
                    Save Changes
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
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Name</label>
                  <p className="text-white text-lg">{profile?.name}</p>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Email</label>
                  <p className="text-white text-lg">{profile?.email}</p>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Account Tier</label>
                  <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                    {profile?.tier}
                  </span>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Member Since</label>
                  <p className="text-white">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Card */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Security</h2>
              {!changingPassword && (
                <button
                  onClick={() => setChangingPassword(true)}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Change Password
                </button>
              )}
            </div>

            {changingPassword ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-gray-300 text-sm mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChangingPassword(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-gray-400">
                Keep your account secure by using a strong password and changing it regularly.
              </p>
            )}
          </div>
        </div>

        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
        />
      </div>
    </Layout>
  );
};

export default ProfilePage;
