import { hotelsApi } from './api';
import type { Hotel, Room, HotelSearchParams, HotelSearchResult, HotelReservation } from '../types';

export const hotelService = {
  searchHotels: async (params: HotelSearchParams): Promise<HotelSearchResult[]> => {
    const response = await hotelsApi.get<HotelSearchResult[]>('/api/hotels/search', { params });
    return response.data;
  },

  getHotelById: async (id: number): Promise<Hotel> => {
    const response = await hotelsApi.get<Hotel>(`/api/hotels/${id}`);
    return response.data;
  },

  getMyHotels: async (): Promise<Hotel[]> => {
    const response = await hotelsApi.get<Hotel[]>('/api/hotels/mine');
    return response.data;
  },

  getHotelReservations: async (hotelId: number): Promise<HotelReservation[]> => {
    const response = await hotelsApi.get<HotelReservation[]>(`/api/hotels/${hotelId}/reservations`);
    return response.data;
  },

  createHotel: async (data: {
    ownerId: number;
    name: string;
    country: string;
    city: string;
    description: string;
    district: string;
    addressLine: string;
    petsAllowed: boolean;
    isPetHotel: boolean;
    cancelFreeDaysBefore: number;
  }): Promise<{ id: number }> => {
    const response = await hotelsApi.post<{ id: number }>('/api/hotels', data);
    return response.data;
  },

  getHotelRooms: async (hotelId: number): Promise<Room[]> => {
    const response = await hotelsApi.get<Room[]>(`/api/hotels/${hotelId}/rooms`);
    return response.data;
  },

  getRoomById: async (id: number): Promise<Room> => {
    const response = await hotelsApi.get<Room>(`/api/rooms/${id}`);
    return response.data;
  },

  createRoom: async (data: {
    hotelId: number;
    capacity: number;
    bedrooms: number;
    pricePerNight: number;
    roomNumber: string;
    description: string;
    petsAllowed: boolean;
    accommodation: string;
  }): Promise<{ id: number }> => {
    const response = await hotelsApi.post<{ id: number }>('/api/rooms', data);
    return response.data;
  },
};
