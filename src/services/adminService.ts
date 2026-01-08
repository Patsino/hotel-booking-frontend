import { hotelsApi, reservationsApi, paymentsApi, usersApi } from './api';

export const adminService = {
  // Users Admin
  getAllUsers: async (email?: string, role?: string, isDeleted?: boolean) => {
    const params: Record<string, string | boolean> = {};
    if (email) params.email = email;
    if (role) params.role = role;
    if (isDeleted !== undefined) params.isDeleted = isDeleted;
    const response = await usersApi.get('/api/users', { params });
    return response.data;
  },

  getUserById: async (userId: number) => {
    const response = await usersApi.get(`/api/users/${userId}`);
    return response.data;
  },

  updateUserRole: async (userId: number, role: string) => {
    await usersApi.patch(`/api/users/${userId}/role`, { role });
  },

  softDeleteUser: async (userId: number) => {
    await usersApi.post(`/api/users/${userId}/soft-delete`);
  },

  restoreUser: async (userId: number) => {
    await usersApi.post(`/api/users/${userId}/restore`);
  },

  // Hotels Admin
  getPendingHotels: async () => {
    const response = await hotelsApi.get('/api/admin/hotels/pending');
    return response.data;
  },

  getAllHotels: async (status?: string) => {
    const params = status ? { status } : undefined;
    const response = await hotelsApi.get('/api/admin/hotels/all', { params });
    return response.data;
  },

  approveHotel: async (hotelId: number) => {
    const response = await hotelsApi.post(`/api/admin/hotels/${hotelId}/approve`);
    return response.data;
  },

  rejectHotel: async (hotelId: number) => {
    const response = await hotelsApi.post(`/api/admin/hotels/${hotelId}/reject`);
    return response.data;
  },

  // Reservations Admin
  getAllReservations: async (status?: string, cancellationStatus?: string) => {
    const params: any = {};
    if (status) params.status = status;
    if (cancellationStatus) params.cancellationStatus = cancellationStatus;
    const response = await reservationsApi.get('/api/admin/reservations', { params });
    return response.data;
  },

  approveCancellation: async (reservationId: number) => {
    await reservationsApi.post(`/api/admin/reservations/${reservationId}/approve-cancellation`);
  },

  rejectCancellation: async (reservationId: number) => {
    await reservationsApi.post(`/api/admin/reservations/${reservationId}/reject-cancellation`);
  },

  // Payments Admin
  refundPayment: async (paymentId: number, amount: number | null, reason: string) => {
    const response = await paymentsApi.post('/api/payments/refund', {
      paymentId,
      amount,
      reason,
    });
    return response.data;
  },
};
