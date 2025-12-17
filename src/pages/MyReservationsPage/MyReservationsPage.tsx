import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { reservationService } from '../../services/reservationService';
import { getErrorMessage } from '../../services/api';
import type { Reservation } from '../../types';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Loading } from '../../components/Loading/Loading';
import { Toast } from '../../components/Toast/Toast';
import { format, differenceInDays } from 'date-fns';
import './MyReservationsPage.css';

export const MyReservationsPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    console.log('Fetching reservations...');
    setLoading(true);
    try {
      const data = await reservationService.getMyReservations();
      console.log('Reservations fetched:', data);
      setReservations(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchReservations();
  }, [isAuthenticated]);

  const handlePayNow = (reservation: Reservation) => {
    console.log('Navigate to payment for reservation:', reservation);
    
    // Calculate estimated total based on dates (default price per night: 100)
    const nights = differenceInDays(new Date(reservation.endDate), new Date(reservation.startDate));
    const totalAmount = 100 * nights; // Default to 100 per night as estimate
    
    navigate('/payment', {
      state: {
        reservationId: reservation.id,
        amount: totalAmount,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="reservations-page">
        <Card>
          <h2>Please Login</h2>
          <p>You need to be logged in to view your reservations.</p>
          <Link to="/login">Go to Login</Link>
        </Card>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'status-confirmed';
      case 'Pending':
        return 'status-pending';
      case 'Cancelled':
        return 'status-cancelled';
      case 'Completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  return (
    <div className="reservations-page">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      <div className="reservations-container">
        <div className="reservations-header">
          <h1 className="reservations-title">My Reservations</h1>
          <Button onClick={fetchReservations} variant="secondary" disabled={loading}>
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </Button>
        </div>

        {loading ? (
          <Loading />
        ) : reservations.length === 0 ? (
          <Card>
            <p className="no-reservations">You don't have any reservations yet.</p>
            <Link to="/" className="search-link">
              Search for hotels
            </Link>
          </Card>
        ) : (
          <div className="reservations-grid">
            {reservations.map((reservation) => (
              <Card key={reservation.id} className="reservation-card">
                <div className="reservation-header">
                  <h3 className="reservation-id">Reservation #{reservation.id}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(reservation.status)}`}>
                    {reservation.status}
                  </span>
                </div>

                <div className="reservation-details">
                  <div className="detail-item">
                    <span className="detail-label">Room ID:</span>
                    <span className="detail-value">{reservation.roomId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Check-in:</span>
                    <span className="detail-value">
                      {format(new Date(reservation.startDate), 'PP')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Check-out:</span>
                    <span className="detail-value">
                      {format(new Date(reservation.endDate), 'PP')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Guests:</span>
                    <span className="detail-value">{reservation.guestsCount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Guest Names:</span>
                    <span className="detail-value">{reservation.guestsNames}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">
                      {format(new Date(reservation.createdAt), 'PPp')}
                    </span>
                  </div>
                  <div className="detail-item total-price">
                    <span className="detail-label">Total Price (est.):</span>
                    <span className="detail-value">
                      €{(
                        100 * 
                        differenceInDays(new Date(reservation.endDate), new Date(reservation.startDate))
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                {reservation.status === 'Pending' && (
                  <div className="reservation-actions">
                    <p className="payment-notice">⚠️ Payment required to confirm this booking</p>
                    <Button onClick={() => handlePayNow(reservation)} fullWidth>
                      Pay Now
                    </Button>
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
