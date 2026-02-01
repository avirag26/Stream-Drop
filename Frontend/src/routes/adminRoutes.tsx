import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLogin from '../pages/admin/login';
import AdminDashboard from '../pages/admin/dashboard';
import UserList from '../pages/admin/users';
import NotFound from '../pages/NotFound';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path='/users' element={<UserList/>}/>
      {/* Catch-all route for 404 in admin section */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AdminRoutes;