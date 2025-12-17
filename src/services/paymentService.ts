import { paymentsApi } from './api';
import type { CreatePaymentIntentData, PaymentIntentResponse } from '../types';

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
};
