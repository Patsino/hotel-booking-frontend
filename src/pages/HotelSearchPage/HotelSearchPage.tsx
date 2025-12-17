import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { hotelService } from '../../services/hotelService';
import { getErrorMessage } from '../../services/api';
import type { HotelSearchParams, HotelSearchResult } from '../../types';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Loading } from '../../components/Loading/Loading';
import { Toast } from '../../components/Toast/Toast';
import './HotelSearchPage.css';

export const HotelSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState<HotelSearchParams>({
    country: '',
    city: '',
    startDate: '',
    endDate: '',
    guestsCount: 1,
  });
  const [results, setResults] = useState<HotelSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSearched(true);

    console.log('Searching with params:', searchParams);

    try {
      const data = await hotelService.searchHotels(searchParams);
      console.log('Search results:', data);
      setResults(data);
      if (data.length === 0) {
        setInfo('No hotels found. Try different search criteria.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(getErrorMessage(err));
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (hotelId: number, roomId: number, pricePerNight: number) => {
    console.log('Book Now clicked:', { hotelId, roomId, pricePerNight, isAuthenticated });
    
    if (!isAuthenticated) {
      setInfo('Please login to make a booking');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    if (!searchParams.startDate || !searchParams.endDate) {
      setError('Please select check-in and check-out dates');
      return;
    }

    console.log('Navigating to booking with state:', {
      roomId,
      hotelId,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
      guestsCount: searchParams.guestsCount,
      pricePerNight,
    });

    navigate('/booking', {
      state: {
        roomId,
        hotelId,
        startDate: searchParams.startDate,
        endDate: searchParams.endDate,
        guestsCount: searchParams.guestsCount,
        pricePerNight,
      },
    });
  };

  return (
    <div className="search-page">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {info && <Toast message={info} type="info" onClose={() => setInfo(null)} />}

      <div className="search-container">
        <h1 className="search-title">Find Your Perfect Stay</h1>

        <Card className="search-form-card">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-form-row">
              <Input
                label="Country"
                value={searchParams.country}
                onChange={(e) => setSearchParams({ ...searchParams, country: e.target.value })}
                placeholder="e.g., Latvia"
              />
              <Input
                label="City"
                value={searchParams.city}
                onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                placeholder="e.g., Riga"
              />
            </div>

            <div className="search-form-row">
              <Input
                label="Check-in"
                type="date"
                value={searchParams.startDate}
                onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
              />
              <Input
                label="Check-out"
                type="date"
                value={searchParams.endDate}
                onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
              />
            </div>

            <div className="search-form-row">
              <Input
                label="Guests"
                type="number"
                min="1"
                max="20"
                value={searchParams.guestsCount}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, guestsCount: Number(e.target.value) })
                }
              />
              <Input
                label="Min Price (€)"
                type="number"
                min="0"
                value={searchParams.minPrice || ''}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    minPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="Any"
              />
              <Input
                label="Max Price (€)"
                type="number"
                min="0"
                value={searchParams.maxPrice || ''}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    maxPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="Any"
              />
            </div>

            <Button type="submit" loading={loading} fullWidth>
              Search Hotels
            </Button>
          </form>
        </Card>

        {loading && <Loading />}

        {!loading && searched && (
          <div className="search-results">
            <h2 className="results-title">
              {results.length > 0
                ? `Found ${results.length} hotel${results.length > 1 ? 's' : ''}`
                : 'No hotels found'}
            </h2>

            <div className="results-grid">
              {results.map((hotel) => (
                <Card key={hotel.hotelId} className="hotel-card">
                  <h3 className="hotel-name">{hotel.name}</h3>
                  <p className="hotel-location">
                    {hotel.city}, {hotel.country}
                    {hotel.district && ` • ${hotel.district}`}
                  </p>
                  <p className="hotel-description">{hotel.description}</p>

                  <div className="hotel-features">
                    {hotel.petsAllowed && <span className="feature-badge">🐾 Pet Friendly</span>}
                    {hotel.isPetHotel && <span className="feature-badge">🏨 Pet Hotel</span>}
                    <span className="feature-badge">
                      📅 Free cancellation {hotel.cancelFreeDaysBefore} days before
                    </span>
                  </div>

                  <div className="rooms-section">
                    <h4 className="rooms-title">Available Rooms</h4>
                    {hotel.rooms.map((room) => (
                      <div key={room.roomId} className="room-item">
                        <div className="room-info">
                          <p className="room-name">
                            {room.roomNumber} - {room.accommodation}
                          </p>
                          <p className="room-details">
                            👥 {room.capacity} guests • 🛏️ {room.bedrooms} bedroom
                            {room.bedrooms > 1 ? 's' : ''}
                            {room.petsAllowed && ' • 🐾 Pets allowed'}
                          </p>
                          <p className="room-description">{room.description}</p>
                        </div>
                        <div className="room-booking">
                          <p className="room-price">€{room.pricePerNight}/night</p>
                          <Button
                            onClick={() => handleRoomSelect(hotel.hotelId, room.roomId, room.pricePerNight)}
                            variant="primary"
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
