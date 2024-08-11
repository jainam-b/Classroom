import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Retrieve token and decode it to get user role
  const token = localStorage.getItem('token');
  
  // Mock function to decode JWT (replace with your actual decoding logic)
  const decodeToken = (token) => {
    try {
      // Replace with actual decoding method
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return decoded.role;
    } catch {
      return null;
    }
  };

  const userRole = token ? decodeToken(token) : null;

  // Check if user role is allowed
  if (!allowedRoles.includes(userRole)) {
    // Redirect to Unauthorized page if not allowed
    return <Navigate to="/unauthorized" />;
  }

  // Render the children if the user role is allowed
  return children;
};

export default ProtectedRoute;
