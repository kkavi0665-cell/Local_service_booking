import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import BookingPage from './pages/BookingPage';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminPanel from './pages/AdminPanel';
import './index.css';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route
          path="/login"
          element={<PublicRoute><LoginPage /></PublicRoute>}
        />
        <Route
          path="/register"
          element={<PublicRoute><RegisterPage /></PublicRoute>}
        />
        <Route
          path="/book/:serviceId"
          element={<PrivateRoute roles={['customer']}><BookingPage /></PrivateRoute>}
        />
        <Route
          path="/dashboard"
          element={<PrivateRoute roles={['customer']}><CustomerDashboard /></PrivateRoute>}
        />
        <Route
          path="/provider-dashboard"
          element={<PrivateRoute roles={['provider']}><ProviderDashboard /></PrivateRoute>}
        />
        <Route
          path="/admin"
          element={<PrivateRoute roles={['admin']}><AdminPanel /></PrivateRoute>}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
