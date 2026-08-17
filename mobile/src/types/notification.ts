export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  booking_id?: string;
  trip_id?: string;
  is_read: boolean;
  created_at: string;
}
