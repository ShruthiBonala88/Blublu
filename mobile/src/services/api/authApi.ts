import { apiClient } from './client';

export interface RequestOtpResponse {
  message: string;
  otp_id?: string;
  dev_otp?: string; // Present in dev mode
}

export interface VerifyOtpResponse {
  token: string;
  user: {
    id: string;
    phone: string;
    name?: string;
    role?: 'passenger' | 'driver';
  };
}

export const authApi = {
  requestOtp: (phone: string) => {
    return apiClient.post<RequestOtpResponse>('/api/v1/otp/request', { phone });
  },
  verifyOtp: (phone: string, otp: string) => {
    return apiClient.post<VerifyOtpResponse>('/api/v1/otp/verify', { phone, otp });
  },
};
