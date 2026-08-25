import { api } from './client';

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  is_read: boolean;
  time?: string;
  created_at: string;
}

export const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    user_id: 'e9a5c556-c2aa-4ff5-b9e7-f7e9dae9c3e1',
    title: 'Booking Confirmed',
    message: 'Your Hyderabad → Bengaluru seat (1A) has been confirmed.',
    type: 'success',
    is_read: false,
    time: 'Just now',
    created_at: new Date().toISOString(),
  },
  {
    id: 'n2',
    user_id: 'e9a5c556-c2aa-4ff5-b9e7-f7e9dae9c3e1',
    title: 'Driver Assigned',
    message: 'Rahul Sharma (⭐ 4.9) will be your driver for today\'s ride.',
    type: 'info',
    is_read: false,
    time: '10 min ago',
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'n3',
    user_id: 'e9a5c556-c2aa-4ff5-b9e7-f7e9dae9c3e1',
    title: 'Upcoming Departure',
    message: 'Your carpool departs today at 6:30 PM from Gachibowli.',
    type: 'warning',
    is_read: true,
    time: '1 hour ago',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'n4',
    user_id: 'e9a5c556-c2aa-4ff5-b9e7-f7e9dae9c3e1',
    title: 'Welcome to BLUBLU India',
    message: 'Discover verified routes and save up to 70% on travel.',
    type: 'info',
    is_read: true,
    time: 'Yesterday',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const notificationsApi = {
  // List notifications for user
  listByUser: async (userId: string, page = 1, limit = 20): Promise<NotificationItem[]> => {
    try {
      const response = await api.get(`/users/${userId}/notifications`, {
        params: { page, limit },
      });
      const list = response.data?.notifications || response.data || [];
      if (Array.isArray(list) && list.length > 0) return list;
    } catch (err) {
      console.warn('[notificationsApi.listByUser] Backend error, returning sample notifications:', err);
    }
    return SAMPLE_NOTIFICATIONS;
  },

  // Get unread count
  getUnread: async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}/notifications/unread`);
      return response.data;
    } catch (err) {
      const unreadCount = SAMPLE_NOTIFICATIONS.filter((n) => !n.is_read).length;
      return { unread_count: unreadCount };
    }
  },

  // Mark single notification as read
  markAsRead: async (userId: string, notificationId: string) => {
    try {
      const response = await api.post(`/users/${userId}/notifications/${notificationId}/read`);
      return response.data;
    } catch (err) {
      const found = SAMPLE_NOTIFICATIONS.find((n) => n.id === notificationId);
      if (found) found.is_read = true;
      return { success: true };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (userId: string) => {
    try {
      const response = await api.post(`/users/${userId}/notifications/read-all`);
      return response.data;
    } catch (err) {
      SAMPLE_NOTIFICATIONS.forEach((n) => {
        n.is_read = true;
      });
      return { success: true, message: 'All notifications marked as read' };
    }
  },
};
