import { api } from './client';

export type LoginRequest = {
  email?: string;
  password?: string;
};

export type RegisterRequest = {
  name: string;
  email?: string;
  password?: string;
  phone?: string;
};

export type OTPRequest = {
  phone?: string;
  email?: string;
  purpose?: string;
};

export type OTPVerifyRequest = {
  phone?: string;
  email?: string;
  otp: string;
  purpose?: string;
};

export const requestOtp = async (target: { phone?: string; email?: string } | string) => {
  const payload: Record<string, string> = { purpose: 'login' };

  if (typeof target === 'string') {
    if (target.includes('@')) {
      payload.email = target;
    } else {
      payload.phone = target;
    }
  } else {
    if (target.email) payload.email = target.email;
    if (target.phone) payload.phone = target.phone;
  }

  const response = await api.post('/otp/request', payload);
  return response.data;
};

export const sendOtp = requestOtp;

export const verifyOtp = async (
  target: { phone?: string; email?: string } | string,
  otp: string
) => {
  const payload: Record<string, string> = { otp, purpose: 'login' };

  if (typeof target === 'string') {
    if (target.includes('@')) {
      payload.email = target;
    } else {
      payload.phone = target;
    }
  } else {
    if (target.email) payload.email = target.email;
    if (target.phone) payload.phone = target.phone;
  }

  const response = await api.post('/otp/verify', payload);
  return response.data;
};

export const login = async (data: LoginRequest) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterRequest) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};