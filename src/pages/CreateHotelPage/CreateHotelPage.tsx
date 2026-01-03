import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { hotelService } from '../../services/hotelService';
import { getErrorMessage } from '../../services/api';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Toast } from '../../components/Toast/Toast';
import './CreateHotelPage.css';

export const CreateHotelPage: React.FC = () => {
  const { isAuthenticated, role, userId } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    country: '',
    city: '',
    district: '',
    addressLine: '',
    petsAllowed: false,
    isPetHotel: false,
    cancelFreeDaysBefore: 3,
  });

  if (!isAuthenticated || (role !== 'HotelOwner' && role !== 'Admin')) {
    return (
      <div className="create-hotel-page">
        <Card>
          <h2>Access Denied</h2>
          <p>You need to be a Hotel Owner to create hotels.</p>
          <Button onClick={() => navigate('/profile')}>Go to Profile</Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await hotelService.createHotel({
        ownerId: userId!,
        ...formData,
      });

      setSuccess('Hotel created successfully! It will be reviewed by an admin.');
      setTimeout(() => {
        navigate('/my-hotels');
      }, 2000);
      console.log('Hotel created:', result);
    } catch (err) {
      console.error('Error creating hotel:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="create-hotel-page">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}

      <div className="create-hotel-container">
        <h1 className="create-hotel-title">Create New Hotel</h1>

        <Card className="create-hotel-card">
          <form onSubmit={handleSubmit} className="create-hotel-form">
            <Input
              label="Hotel Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Grand Hotel"
              required
              fullWidth
            />

            <div className="form-row">
              <Input
                label="Country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="Lithuania"
                required
                fullWidth
              />
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Vilnius"
                required
                fullWidth
              />
            </div>

            <div className="form-row">
              <Input
                label="District (Optional)"
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                placeholder="Old Town"
                fullWidth
              />
              <Input
                label="Address"
                value={formData.addressLine}
                onChange={(e) => handleChange('addressLine', e.target.value)}
                placeholder="123 Main Street"
                required
                fullWidth
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your hotel..."
                rows={4}
                required
              />
            </div>

            <Input
              label="Free Cancellation Days Before Check-in"
              type="number"
              min="0"
              max="30"
              value={formData.cancelFreeDaysBefore}
              onChange={(e) => handleChange('cancelFreeDaysBefore', Number(e.target.value))}
              fullWidth
            />

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.petsAllowed}
                  onChange={(e) => handleChange('petsAllowed', e.target.checked)}
                />
                <span>🐾 Pets Allowed</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isPetHotel}
                  onChange={(e) => handleChange('isPetHotel', e.target.checked)}
                />
                <span>🏨 Pet-Only Hotel</span>
              </label>
            </div>

            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create Hotel
              </Button>
            </div>
          </form>
        </Card>

        <Card className="info-card">
          <h3>ℹ️ Important Information</h3>
          <ul>
            <li>Your hotel will need to be approved by an administrator before it becomes visible to guests.</li>
            <li>Make sure all information is accurate and complete.</li>
            <li>After approval, you can add rooms to your hotel.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
