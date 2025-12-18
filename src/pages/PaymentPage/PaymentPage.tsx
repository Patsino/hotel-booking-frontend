import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { paymentService } from '../../services/paymentService';
import { getErrorMessage } from '../../services/api';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Input } from '../../components/Input/Input';
import { Toast } from '../../components/Toast/Toast';
import { differenceInDays } from 'date-fns';
import './PaymentPage.css';

export const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  
  const state = location.state as {
    reservationId?: number;
    amount?: number;
    startDate?: string;
    endDate?: string;
  } | null;

  const reservationId = state?.reservationId;
  const amount = state?.amount;
  const startDate = state?.startDate;
  const endDate = state?.endDate;

  const [paymentMethodId, setPaymentMethodId] = useState('pm_card_visa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  console.log('PaymentPage - State:', state);
  console.log('PaymentPage - reservationId:', reservationId, 'amount:', amount);

  if (!reservationId || !amount || !userId) {
    return (
      <div className="payment-page">
        <Card>
          <h2>Invalid Payment</h2>
          <p>Missing payment information. Please create a reservation first.</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem' }}>
            Debug: reservationId={String(reservationId)}, amount={String(amount)}, userId={String(userId)}
          </p>
          <Button onClick={() => navigate('/')}>Back to Search</Button>
        </Card>
      </div>
    );
  }

  const nights = startDate && endDate ? differenceInDays(new Date(endDate), new Date(startDate)) : 0;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log('Creating payment intent for reservation:', reservationId);

    try {
      // Step 1: Create payment intent
      const paymentIntent = await paymentService.createPaymentIntent({
        reservationId,
        amount,
        currency: 'EUR',
      });

      console.log('Payment intent created:', paymentIntent);

      // Step 2: Confirm payment (in real app, this would use Stripe.js)
      await paymentService.confirmPayment(
        paymentIntent.paymentIntentId,
        paymentMethodId
      );

      console.log('Payment confirmed');
      setSuccess('Payment successful! Your reservation is confirmed.');
      
      // Wait a bit longer to allow backend to process the status update
      setTimeout(() => {
        navigate('/reservations');
      }, 2500);
    } catch (err) {
      console.error('Payment error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}

      <div className="payment-container">
        <h1 className="payment-title">Complete Payment</h1>

        <div className="payment-content">
          <Card className="payment-form-card">
            <h2>Payment Details</h2>
            <form onSubmit={handlePayment} className="payment-form">
              <div className="payment-summary">
                <div className="summary-row">
                  <span>Reservation ID:</span>
                  <span className="summary-value">#{reservationId}</span>
                </div>
                {nights > 0 && (
                  <div className="summary-row">
                    <span>Nights:</span>
                    <span className="summary-value">{nights}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span className="summary-value">€{amount.toFixed(2)}</span>
                </div>
              </div>

              <Input
                label="Payment Method ID (Test)"
                value={paymentMethodId}
                onChange={(e) => setPaymentMethodId(e.target.value)}
                placeholder="pm_card_visa"
                fullWidth
              />

              <div className="test-cards">
                <p className="test-cards-title">Test Payment Methods:</p>
                <div className="test-card-options">
                  <button
                    type="button"
                    className="test-card-btn"
                    onClick={() => setPaymentMethodId('pm_card_visa')}
                  >
                    💳 Visa
                  </button>
                  <button
                    type="button"
                    className="test-card-btn"
                    onClick={() => setPaymentMethodId('pm_card_mastercard')}
                  >
                    💳 Mastercard
                  </button>
                </div>
              </div>

              <div className="payment-actions">
                <Button type="button" variant="secondary" onClick={() => navigate('/reservations')}>
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  Pay €{amount.toFixed(2)}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="payment-info-card">
            <h2>Payment Information</h2>
            <div className="info-content">
              <p className="info-text">
                Your payment is processed securely through Stripe. After successful payment, your
                reservation will be confirmed immediately.
              </p>
              <div className="info-note">
                <strong>Note:</strong> This is a demo environment. Use test payment methods provided.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
