import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/user/home';
import Login from '../pages/user/login';
import Register from '../pages/user/register';
import Dashboard from '../pages/user/dashboard';
import VerifyOtp from '../pages/user/verify-otp';
import ForgotPassword from '../pages/user/forgot-password';
import ResetPassword from '../pages/user/reset-password';
import BoxPage from '../pages/user/box';
import NotFound from '../pages/NotFound';

const UserRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/box/:boxCode" element={<BoxPage />} />
      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default UserRoutes;