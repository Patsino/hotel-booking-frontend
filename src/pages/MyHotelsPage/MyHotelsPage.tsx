import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { hotelService } from '../../services/hotelService';
import { getErrorMessage } from '../../services/api';
import type { Hotel, Room } from '../../types';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Loading } from '../../components/Loading/Loading';
import { Toast } from '../../components/Toast/Toast';
import './MyHotelsPage.css';

export const MyHotelsPage: React.FC = () => {
  const { isAuthenticated, role } = useAuthStore();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelRooms, setHotelRooms] = useState<Record<number, Room[]>>({});
  const [expandedHotel, setExpandedHotel] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const data = await hotelService.getMyHotels();
      setHotels(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (hotelId: number) => {
    if (hotelRooms[hotelId]) {
      setExpandedHotel(expandedHotel === hotelId ? null : hotelId);
      return;
    }

    try {
      const rooms = await hotelService.getHotelRooms(hotelId);
      setHotelRooms(prev => ({ ...prev, [hotelId]: rooms }));
      setExpandedHotel(hotelId);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    if (!isAuthenticated || (role !== 'HotelOwner' && role !== 'Admin')) {
      navigate('/profile');
      return;
    }
    fetchHotels();
  }, [isAuthenticated, role, navigate]);

  const getApprovalBadgeClass = (approval: string) => {
    switch (approval) {
      case 'Approved':
        return 'approval-approved';
      case 'Pending':
        return 'approval-pending';
      case 'Rejected':
        return 'approval-rejected';
      default:
        return '';
    }
  };

  if (!isAuthenticated || (role !== 'HotelOwner' && role !== 'Admin')) {
    return null;
  }

  return (
    <div className="my-hotels-page">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      <div className="my-hotels-container">
        <div className="my-hotels-header">
          <h1 className="my-hotels-title">My Hotels</h1>
          <div className="header-actions">
            <Button onClick={fetchHotels} variant="secondary" disabled={loading}>
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </Button>
            <Button onClick={() => navigate('/create-hotel')}>
              + Create New Hotel
            </Button>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : hotels.length === 0 ? (
          <Card>
            <p className="no-hotels">You haven't created any hotels yet.</p>
            <Button onClick={() => navigate('/create-hotel')} fullWidth>
              Create Your First Hotel
            </Button>
          </Card>
        ) : (
          <div className="hotels-list">
            {hotels.map((hotel) => (
              <Card key={hotel.id} className="hotel-card">
                <div className="hotel-header">
                  <h3 className="hotel-name">{hotel.name}</h3>
                  <span className={`approval-badge ${getApprovalBadgeClass(hotel.approval)}`}>
                    {hotel.approval}
                  </span>
                </div>

                <div className="hotel-details">
                  <p className="hotel-location">
                    📍 {hotel.city}, {hotel.country}
                    {hotel.district && ` • ${hotel.district}`}
                  </p>
                  <p className="hotel-address">{hotel.addressLine}</p>
                  <p className="hotel-description">{hotel.description}</p>

                  <div className="hotel-features">
                    {hotel.petsAllowed && <span className="feature-badge">🐾 Pet Friendly</span>}
                    {hotel.isPetHotel && <span className="feature-badge">🏨 Pet Hotel</span>}
                    <span className="feature-badge">
                      📅 {hotel.cancelFreeDaysBefore} days free cancellation
                    </span>
                  </div>
                </div>

                <div className="hotel-actions">
                  <Button 
                    variant="secondary" 
                    onClick={() => fetchRooms(hotel.id)}
                  >
                    {expandedHotel === hotel.id ? 'Hide Rooms' : 'View Rooms'}
                  </Button>
                  <Button 
                    onClick={() => navigate('/create-room', { state: { hotelId: hotel.id, hotelName: hotel.name } })}
                    disabled={hotel.approval !== 'Approved'}
                  >
                    + Add Room
                  </Button>
                </div>

                {expandedHotel === hotel.id && hotelRooms[hotel.id] && (
                  <div className="rooms-section">
                    <h4>Rooms ({hotelRooms[hotel.id].length})</h4>
                    {hotelRooms[hotel.id].length === 0 ? (
                      <p className="no-rooms">No rooms added yet.</p>
                    ) : (
                      <div className="rooms-grid">
                        {hotelRooms[hotel.id].map((room) => (
                          <div key={room.id} className="room-item">
                            <div className="room-header">
                              <span className="room-number">Room {room.roomNumber}</span>
                              <span className={`visibility-badge ${room.visible ? 'visible' : 'hidden'}`}>
                                {room.visible ? '👁 Visible' : '🚫 Hidden'}
                              </span>
                            </div>
                            <p className="room-type">{room.accommodation}</p>
                            <p className="room-capacity">
                              👥 {room.capacity} guests • 🛏 {room.bedrooms} bedroom(s)
                            </p>
                            <p className="room-price">€{room.pricePerNight}/night</p>
                            {room.petsAllowed && <span className="pet-badge">🐾 Pets OK</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
