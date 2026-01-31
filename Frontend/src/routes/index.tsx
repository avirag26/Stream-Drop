import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserRoutes from './userRoutes';
import AdminRoutes from './adminRoutes';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* User Routes */}
      <Route path="/*" element={<UserRoutes />} />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  );
};

export default AppRoutes;