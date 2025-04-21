// components/RoleBasedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { message } from 'antd';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    message.error('Please login to continue');
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // message.error('Unauthorized access');
    // Redirect based on user role
    const redirectPath = user.role === 'admin' ? '/admin' : 
                        user.role === 'partner' ? '/partner' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default RoleBasedRoute;
