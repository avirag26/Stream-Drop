import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLogin from '../pages/admin/login';
import AdminDashboard from '../pages/admin/dashboard';
import UserList from '../pages/admin/users'
const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path='/users' element={<UserList/>}/>
    </Routes>
  );
};

export default AdminRoutes;