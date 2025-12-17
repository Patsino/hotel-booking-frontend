import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Toast } from '../../components/Toast/Toast';
import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
  const { email, role, isAuthenticated, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <Card>
          <h2>Please Login</h2>
          <p>You need to be logged in to view your profile.</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </Card>
      </div>
    );
  }

  const handleBecomeHotelOwner = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.becomeHotelOwner();
      setAuth(response);
      setSuccess('You are now a Hotel Owner! You can create and manage hotels.');
      console.log('Upgraded to Hotel Owner:', response);
    } catch (err) {
      console.error('Error becoming hotel owner:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}

      <div className="profile-container">
        <h1 className="profile-title">My Profile</h1>

        <Card className="profile-card">
          <h2>Account Information</h2>
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Role:</span>
              <span className={`role-badge role-${role?.toLowerCase()}`}>{role}</span>
            </div>
          </div>
        </Card>

        {role === 'User' && (
          <Card className="upgrade-card">
            <h2>Become a Hotel Owner</h2>
            <p className="upgrade-description">
              Upgrade your account to Hotel Owner to create and manage your own hotels and rooms.
            </p>
            <div className="upgrade-benefits">
              <h3>Benefits:</h3>
              <ul>
                <li>✅ Create and manage hotels</li>
                <li>✅ Add rooms with custom pricing</li>
                <li>✅ Set cancellation policies</li>
                <li>✅ Receive bookings from guests</li>
              </ul>
            </div>
            <Button onClick={handleBecomeHotelOwner} loading={loading} fullWidth>
              Upgrade to Hotel Owner
            </Button>
          </Card>
        )}

        {(role === 'HotelOwner' || role === 'Admin') && (
          <Card className="actions-card">
            <h2>Hotel Management</h2>
            <div className="action-buttons">
              <Button onClick={() => navigate('/my-hotels')} fullWidth>
                My Hotels
              </Button>
              <Button onClick={() => navigate('/create-hotel')} variant="primary" fullWidth>
                Create New Hotel
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
