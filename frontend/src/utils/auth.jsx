import {jwtDecode} from 'jwt-decode';

// Function to get the role from the JWT token
export const getRole = () => {
  const token = localStorage.getItem('token'); // Adjust if you store the token elsewhere
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.role; // Adjust based on your token's structure
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};
// utils/auth.js

export const getToken = () => {
  return localStorage.getItem('token');
};

 
