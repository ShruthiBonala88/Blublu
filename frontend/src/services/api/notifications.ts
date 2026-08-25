import { api } from './client';

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const notificationsApi = {
  // List notifications for user
  listByUser: async (userId: string, page = 1, limit = 20) => {
    const response = await api.get(`/users/${userId}/notifications`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get unread count
  getUnread: async (userId: string) => {
    const response = await api.get(`/users/${userId}/notifications/unread`);
    return response.data;
  },

  // Mark single notification as read
  markAsRead: async (userId: string, notificationId: string) => {
    const response = await api.post(`/users/${userId}/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (userId: string) => {
    const response = await api.post(`/users/${userId}/notifications/read-all`);
    return response.data;
  },
};
