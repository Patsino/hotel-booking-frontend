import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { reservationService } from '../../services/reservationService';
import { paymentService } from '../../services/paymentService';
import { hotelService } from '../../services/hotelService';
import { getErrorMessage } from '../../services/api';
import type { Reservation, Payment } from '../../types';
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
  const [payments, setPayments] = useState<Record<number, Payment>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchReservations = async () => {
    console.log('Fetching reservations...');
    setLoading(true);
    try {
      const data = await reservationService.getMyReservations();
      console.log('Reservations fetched:', data);
      setReservations(data);

      // Fetch payment status for each reservation
      const paymentData: Record<number, Payment> = {};
      for (const reservation of data) {
        const payment = await paymentService.getPaymentByReservation(reservation.id);
        if (payment) {
          paymentData[reservation.id] = payment;
        }
      }
      setPayments(paymentData);
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

  const handlePayNow = async (reservation: Reservation) => {
    console.log('Navigate to payment for reservation:', reservation);
    
    // Check if we already have payment info with the correct amount
    const existingPayment = payments[reservation.id];
    if (existingPayment && existingPayment.amount > 0) {
      navigate('/payment', {
        state: {
          reservationId: reservation.id,
          amount: existingPayment.amount,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
        },
      });
      return;
    }
    
    // Fetch room details to get the actual price
    try {
      const room = await hotelService.getRoomById(reservation.roomId);
      const nights = Math.max(1, differenceInDays(new Date(reservation.endDate), new Date(reservation.startDate)));
      const totalAmount = room.pricePerNight * nights;
      
      navigate('/payment', {
        state: {
          reservationId: reservation.id,
          amount: totalAmount,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
        },
      });
    } catch (err) {
      console.error('Error fetching room details:', err);
      setError('Failed to get room pricing. Please try again.');
    }
  };

  const handleCancelReservation = async (reservationId: number) => {
    if (!confirm('Are you sure you want to cancel this reservation? If approved, a refund will be processed.')) {
      return;
    }

    const reason = prompt('Please provide a reason for cancellation (optional):');
    
    setCancellingId(reservationId);
    setError(null);
    
    try {
      await reservationService.cancelReservation(reservationId, reason || 'User requested cancellation');
      setSuccess('Cancellation request submitted successfully. You will be notified once processed.');
      await fetchReservations();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
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
      case 'Held':
        return 'status-held';
      case 'Canceled':
        return 'status-canceled';
      case 'CancellationRequested':
        return 'status-cancellation-requested';
      case 'CancellationRejected':
        return 'status-cancellation-rejected';
      default:
        return '';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Succeeded':
        return <span className="payment-status payment-succeeded">✓ Paid</span>;
      case 'Pending':
        return <span className="payment-status payment-pending">⏳ Processing</span>;
      case 'Failed':
        return <span className="payment-status payment-failed">✗ Failed</span>;
      case 'Refunded':
        return <span className="payment-status payment-refunded">↩ Refunded</span>;
      default:
        return null;
    }
  };

  return (
    <div className="reservations-page">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}

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
                  <span className={`status-badge ${getStatusBadgeClass(
                    reservation.cancellationStatus === 'Requested' ? 'CancellationRequested' :
                    reservation.cancellationStatus === 'AdminRejected' ? 'CancellationRejected' :
                    reservation.status
                  )}`}>
                    {reservation.cancellationStatus === 'Requested' ? 'Cancellation Requested' :
                     reservation.cancellationStatus === 'AdminRejected' ? 'Cancellation Rejected' :
                     reservation.status}
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
                    <span className="detail-label">Total Price:</span>
                    <span className="detail-value">
                      {payments[reservation.id] ? (
                        <>€{payments[reservation.id].amount.toFixed(2)}</>
                      ) : (
                        <span className="price-pending">Pending payment</span>
                      )}
                    </span>
                  </div>
                  {payments[reservation.id] && (
                    <div className="detail-item">
                      <span className="detail-label">Payment:</span>
                      <span className="detail-value">
                        {getPaymentStatusBadge(payments[reservation.id].status)}
                        {payments[reservation.id].status === 'Refunded' && payments[reservation.id].amount && (
                          <span className="refund-amount"> €{payments[reservation.id].amount.toFixed(2)}</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {reservation.status === 'Pending' && (
                  <div className="reservation-actions">
                    <p className="payment-notice">⚠️ Payment required to confirm this booking</p>
                    <Button onClick={() => handlePayNow(reservation)} fullWidth>
                      Pay Now
                    </Button>
                  </div>
                )}

                {(reservation.status === 'Confirmed' || reservation.status === 'Pending') && (
                  <div className="reservation-actions">
                    <Button 
                      onClick={() => handleCancelReservation(reservation.id)} 
                      variant="secondary"
                      fullWidth
                      disabled={cancellingId === reservation.id}
                    >
                      {cancellingId === reservation.id ? 'Cancelling...' : 'Cancel & Request Refund'}
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
