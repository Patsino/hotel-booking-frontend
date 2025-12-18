import { paymentsApi } from './api';
import type { CreatePaymentIntentData, PaymentIntentResponse, Payment } from '../types';

export const paymentService = {
  createPaymentIntent: async (data: CreatePaymentIntentData): Promise<PaymentIntentResponse> => {
    const response = await paymentsApi.post<PaymentIntentResponse>(
      '/api/payments/create-intent',
      data
    );
    return response.data;
  },

  confirmPayment: async (paymentIntentId: string, paymentMethodId: string): Promise<void> => {
    await paymentsApi.post('/api/payments/confirm', {
      paymentIntentId,
      paymentMethodId,
    });
  },

  getPaymentByReservation: async (reservationId: number): Promise<Payment | null> => {
    try {
      const response = await paymentsApi.get<Payment[]>(`/api/payments/reservation/${reservationId}`);
      return response.data && response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      return null;
    }
  },
};
