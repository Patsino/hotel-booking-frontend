import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { hotelService } from '../../services/hotelService';
import { getErrorMessage } from '../../services/api';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Toast } from '../../components/Toast/Toast';
import './CreateRoomPage.css';

const accommodationTypes = [
  'HotelRoom',
  'Apartment',
  'Villa',
  'Bungalow',
  'Studio',
  'Suite',
  'Dormitory',
];

export const CreateRoomPage: React.FC = () => {
  const { isAuthenticated, role } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { hotelId, hotelName } = (location.state as { hotelId?: number; hotelName?: string }) || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    roomNumber: '',
    description: '',
    capacity: 2,
    bedrooms: 1,
    pricePerNight: 100,
    petsAllowed: false,
    accommodation: 'HotelRoom',
  });

  if (!isAuthenticated || (role !== 'HotelOwner' && role !== 'Admin')) {
    return (
      <div className="create-room-page">
        <Card>
          <h2>Access Denied</h2>
          <p>You need to be a Hotel Owner to add rooms.</p>
          <Button onClick={() => navigate('/profile')}>Go to Profile</Button>
        </Card>
      </div>
    );
  }

  if (!hotelId) {
    return (
      <div className="create-room-page">
        <Card>
          <h2>Invalid Request</h2>
          <p>Please select a hotel first to add rooms.</p>
          <Button onClick={() => navigate('/my-hotels')}>Go to My Hotels</Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await hotelService.createRoom({
        hotelId,
        ...formData,
      });

      setSuccess('Room created successfully!');
      setTimeout(() => {
        navigate('/my-hotels');
      }, 1500);
      console.log('Room created:', result);
    } catch (err) {
      console.error('Error creating room:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="create-room-page">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}

      <div className="create-room-container">
        <h1 className="create-room-title">Add Room to {hotelName || `Hotel #${hotelId}`}</h1>

        <Card className="create-room-card">
          <form onSubmit={handleSubmit} className="create-room-form">
            <div className="form-row">
              <Input
                label="Room Number"
                value={formData.roomNumber}
                onChange={(e) => handleChange('roomNumber', e.target.value)}
                placeholder="101"
                required
                fullWidth
              />
              <div className="form-group">
                <label htmlFor="accommodation">Accommodation Type</label>
                <select
                  id="accommodation"
                  value={formData.accommodation}
                  onChange={(e) => handleChange('accommodation', e.target.value)}
                  required
                >
                  {accommodationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the room..."
                rows={3}
                required
              />
            </div>

            <div className="form-row triple">
              <Input
                label="Capacity (guests)"
                type="number"
                min="1"
                max="20"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', Number(e.target.value))}
                required
                fullWidth
              />
              <Input
                label="Bedrooms"
                type="number"
                min="1"
                max="10"
                value={formData.bedrooms}
                onChange={(e) => handleChange('bedrooms', Number(e.target.value))}
                required
                fullWidth
              />
              <Input
                label="Price per Night (€)"
                type="number"
                min="1"
                value={formData.pricePerNight}
                onChange={(e) => handleChange('pricePerNight', Number(e.target.value))}
                required
                fullWidth
              />
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.petsAllowed}
                  onChange={(e) => handleChange('petsAllowed', e.target.checked)}
                />
                <span>🐾 Pets Allowed in Room</span>
              </label>
            </div>

            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Add Room
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
