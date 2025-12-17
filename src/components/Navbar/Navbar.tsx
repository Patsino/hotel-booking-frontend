import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { isAuthenticated, email, role, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🏨 Hotel Booking
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">
            Search
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/reservations" className="nav-link">
                My Reservations
              </Link>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
              <div className="nav-user">
                <span className="user-email">{email}</span>
                <span className="user-role">{role}</span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
