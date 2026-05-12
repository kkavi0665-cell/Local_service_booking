import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'admin') return { to: '/admin', label: 'Admin Panel' };
    if (user.role === 'provider') return { to: '/provider-dashboard', label: 'My Dashboard' };
    return { to: '/dashboard', label: 'My Bookings' };
  };

  const dashLink = getDashboardLink();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          🔧 <span>SunGlow</span>Homecare
        </Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            Browse Services
          </Link>

          {dashLink && (
            <Link to={dashLink.to} className={`nav-link ${isActive(dashLink.to)}`}>
              {dashLink.label}
            </Link>
          )}

          {user ? (
            <>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                Hi, {user.name.split(' ')[0]} ({user.role})
              </span>
              <button className="nav-btn outline" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn outline">Login</Link>
              <Link to="/register" className="nav-btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
