import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { reservationService } from '../../services/reservationService';
import { getErrorMessage } from '../../services/api';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Toast } from '../../components/Toast/Toast';
import { format, differenceInDays } from 'date-fns';
import './BookingPage.css';

export const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const { roomId, startDate, endDate, guestsCount, pricePerNight = 100 } = location.state || {};

  const [guestsNames, setGuestsNames] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!roomId || !startDate || !endDate || !userId) {
    return (
      <div className="booking-page">
        <Card>
          <h2>Invalid Booking</h2>
          <p>Please start by searching for a hotel and selecting a room.</p>
          <Button onClick={() => navigate('/')}>Back to Search</Button>
        </Card>
      </div>
    );
  }

  const nights = Math.max(1, differenceInDays(new Date(endDate), new Date(startDate)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log('Creating reservation with data:', {
      userId,
      roomId,
      startDate,
      endDate,
      guestsCount: guestsCount || 1,
      guestsNames,
    });

    try {
      const result = await reservationService.createReservation({
        userId,
        roomId,
        startDate,
        endDate,
        guestsCount: guestsCount || 1,
        guestsNames,
      });

      console.log('Reservation created:', result);
      const totalPrice = pricePerNight * nights;
      setSuccess('Reservation created successfully! Redirecting to payment...');
      setTimeout(() => {
        navigate('/payment', {
          state: {
            reservationId: result.id,
            amount: totalPrice,
            roomId,
            startDate,
            endDate,
          },
        });
      }, 1500);
    } catch (err) {
      console.error('Error creating reservation:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}

      <div className="booking-container">
        <h1 className="booking-title">Complete Your Booking</h1>

        <div className="booking-content">
          <Card className="booking-form-card">
            <h2>Booking Details</h2>
            <form onSubmit={handleSubmit} className="booking-form">
              <div className="booking-info">
                <div className="info-item">
                  <span className="info-label">Check-in:</span>
                  <span className="info-value">{format(new Date(startDate), 'PPP')}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Check-out:</span>
                  <span className="info-value">{format(new Date(endDate), 'PPP')}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Nights:</span>
                  <span className="info-value">{nights}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Guests:</span>
                  <span className="info-value">{guestsCount || 1}</span>
                </div>
              </div>

              <Input
                label="Guest Names"
                value={guestsNames}
                onChange={(e) => setGuestsNames(e.target.value)}
                placeholder="John Doe, Jane Smith"
                required
                fullWidth
              />

              <div className="booking-actions">
                <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                  Back
                </Button>
                <Button type="submit" loading={loading}>
                  Confirm Booking
                </Button>
              </div>
            </form>
          </Card>

          <Card className="booking-summary-card">
            <h2>Booking Summary</h2>
            <div className="summary-content">
              <p className="summary-text">
                You are about to create a reservation. After confirming, you will need to complete
                the payment to finalize your booking.
              </p>
              <div className="summary-note">
                <strong>Note:</strong> Your reservation will be in "Pending" status until payment is
                completed.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
