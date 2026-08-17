import { apiClient } from './client';
import { AppNotification } from '../../types';

export const notificationsApi = {
  getByUser: (userId: string) => {
    return apiClient.get<AppNotification[]>(`/api/v1/users/${userId}/notifications`);
  },
  markAllAsRead: (userId: string) => {
    return apiClient.post(`/api/v1/users/${userId}/notifications/read-all`);
  },
};

export const notifications = notificationsApi;
