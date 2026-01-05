// API Response Types
export interface User {
  id: number;
  email: string;
  role: 'User' | 'HotelOwner' | 'Admin';
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  userId: number;
  email: string;
  role: 'User' | 'HotelOwner' | 'Admin';
}

export interface RegisterResponse {
  userId: number;
  email: string;
  role: 'User' | 'HotelOwner' | 'Admin';
}

export interface Hotel {
  id: number;
  ownerId: number;
  name: string;
  description: string;
  country: string;
  city: string;
  district: string;
  addressLine: string;
  petsAllowed: boolean;
  isPetHotel: boolean;
  cancelFreeDaysBefore: number;
  approval: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
  reviewedAt: string | null;
}

export interface Room {
  id: number;
  hotelId: number;
  roomNumber: string;
  description: string;
  capacity: number;
  bedrooms: number;
  pricePerNight: number;
  visible: boolean;
  petsAllowed: boolean;
  accommodation: 'HotelRoom' | 'Apartment' | 'Villa' | 'Bungalow' | 'Studio' | 'Suite' | 'Dormitory';
  createdAt: string;
}

export interface HotelSearchResult {
  hotelId: number;
  name: string;
  country: string;
  city: string;
  district: string;
  description: string;
  petsAllowed: boolean;
  isPetHotel: boolean;
  cancelFreeDaysBefore: number;
  rooms: RoomSearchResult[];
}

export interface RoomSearchResult {
  roomId: number;
  roomNumber: string;
  description: string;
  capacity: number;
  bedrooms: number;
  pricePerNight: number;
  petsAllowed: boolean;
  accommodation: string;
}

export interface Reservation {
  id: number;
  userId: number;
  roomId: number;
  startDate: string;
  endDate: string;
  guestsCount: number;
  guestsNames: string;
  status: 'Pending' | 'Held' | 'Confirmed' | 'Canceled';
  cancellationStatus: 'None' | 'Requested' | 'AutoCanceled' | 'AdminApproved' | 'AdminRejected';
  cancellationReason: string | null;
  cancellationRequestedAt: string | null;
  createdAt: string;
}

export interface HotelReservation {
  id: number;
  userId: number;
  roomId: number;
  roomNumber: string;
  startDate: string;
  endDate: string;
  guestsCount: number;
  guestsNames: string;
  status: 'Pending' | 'Held' | 'Confirmed' | 'Canceled';
  cancellationStatus: 'None' | 'Requested' | 'AutoCanceled' | 'AdminApproved' | 'AdminRejected';
  cancellationReason: string | null;
  cancellationRequestedAt: string | null;
  createdAt: string;
}

export interface Payment {
  id: number;
  reservationId: number;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Succeeded' | 'Failed' | 'Refunded';
  amountRefunded?: number;
  paidAt: string | null;
  createdAt: string;
}

// Form Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface HotelSearchParams {
  country?: string;
  city?: string;
  district?: string;
  startDate?: string;
  endDate?: string;
  guestsCount?: number;
  withPets?: boolean;
  isPetHotelOnly?: boolean;
  accommodation?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CreateReservationData {
  userId: number;
  roomId: number;
  startDate: string;
  endDate: string;
  guestsCount: number;
  guestsNames: string;
}

export interface CreatePaymentIntentData {
  reservationId: number;
  amount: number;
  currency: string;
}

export interface PaymentIntentResponse {
  paymentIntentId: string;
  clientSecret: string;
  paymentId: number;
}

// Error Response
export interface ApiError {
  error: string;
}
