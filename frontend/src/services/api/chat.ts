import { api } from './client';

export interface ChatMessage {
  id: string;
  trip_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export const chatApi = {
  // Send message in trip chat
  sendMessage: async (tripId: string, message: string): Promise<ChatMessage> => {
    const response = await api.post(`/chat/trips/${tripId}/messages`, { message });
    return response.data;
  },

  // Get chat messages for trip
  getMessages: async (tripId: string, page = 1, limit = 50): Promise<ChatMessage[]> => {
    const response = await api.get(`/chat/trips/${tripId}/messages`, {
      params: { page, limit },
    });
    return response.data?.messages || response.data || [];
  },
};
