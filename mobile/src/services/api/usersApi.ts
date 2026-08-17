import { apiClient } from './client';
import { UserProfile, CreateUserRequest, UpdateUserRequest } from '../../types';

export const usersApi = {
  create: (payload: CreateUserRequest) => {
    return apiClient.post<UserProfile>('/api/v1/users', payload);
  },
  getById: (userId: string) => {
    return apiClient.get<UserProfile>(`/api/v1/users/${userId}`);
  },
  update: (userId: string, payload: UpdateUserRequest) => {
    return apiClient.put<UserProfile>(`/api/v1/users/${userId}`, payload);
  },
  getReviews: (userId: string) => {
    return apiClient.get(`/api/v1/users/${userId}/reviews`);
  },
  getNotifications: (userId: string) => {
    return apiClient.get(`/api/v1/users/${userId}/notifications`);
  },
  getUnreadNotifications: (userId: string) => {
    return apiClient.get(`/api/v1/users/${userId}/notifications/unread`);
  },
  markNotificationAsRead: (userId: string, notificationId: string) => {
    return apiClient.post(`/api/v1/users/${userId}/notifications/${notificationId}/read`);
  },
  markAllNotificationsAsRead: (userId: string) => {
    return apiClient.post(`/api/v1/users/${userId}/notifications/read-all`);
  },
  getBookings: (userId: string) => {
    return apiClient.get(`/api/v1/users/${userId}/bookings`);
  },
  getRides: (userId: string, filter: 'all' | 'upcoming' | 'active' | 'completed' | 'cancelled' = 'all') => {
    return apiClient.get(`/api/v1/users/${userId}/rides${filter !== 'all' ? `/${filter}` : ''}`);
  },
};
