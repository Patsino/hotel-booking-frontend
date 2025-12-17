import { reservationsApi } from './api';
import type { Reservation, CreateReservationData } from '../types';

export const reservationService = {
  createReservation: async (data: CreateReservationData): Promise<{ id: number }> => {
    const response = await reservationsApi.post<{ id: number }>('/api/reservations', data);
    return response.data;
  },

  getReservationById: async (id: number): Promise<Reservation> => {
    const response = await reservationsApi.get<Reservation>(`/api/reservations/${id}`);
    return response.data;
  },

  getMyReservations: async (): Promise<Reservation[]> => {
    const response = await reservationsApi.get<Reservation[]>('/api/reservations/mine');
    return response.data;
  },

  cancelReservation: async (id: number, reason: string): Promise<void> => {
    await reservationsApi.post(`/api/reservations/${id}/cancel`, { reason });
  },
};
