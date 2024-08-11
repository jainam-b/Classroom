import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrincipalDashboard from './components/PrincipalDashboard';
import Unauthorized from './components/Unauthorized';
import Login from './components/Login'; // Import the Login component
import ProtectedRoute from './components/ProtectedRoute'; // Updated version for React Router v6

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/principal-dashboard"
          element={
            <ProtectedRoute allowedRoles={['principal']}>
              <PrincipalDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
};

export default App;
