export interface UserProfile {
  id: string;
  phone: string;
  name?: string;
  full_name?: string;
  email?: string;
  gender?: string;
  role: 'passenger' | 'driver' | 'both' | 'admin';
  avatar_url?: string;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserRequest {
  full_name?: string;
  name?: string;
  phone: string;
  email?: string;
  gender?: string;
  role?: 'passenger' | 'driver' | 'both';
}

export interface UpdateUserRequest {
  full_name?: string;
  name?: string;
  email?: string;
  gender?: string;
  role?: 'passenger' | 'driver' | 'both';
}
