import { api } from './client';

export interface KYCSubmissionPayload {
  document_type: 'aadhaar' | 'driving_license' | 'pan';
  document_number: string;
  document_front_url: string;
  document_back_url?: string;
  selfie_url: string;
}

export const kycApi = {
  // Submit KYC verification
  submit: async (data: KYCSubmissionPayload) => {
    const response = await api.post('/kyc/submit', data);
    return response.data;
  },

  // Get current KYC status
  getStatus: async () => {
    const response = await api.get('/kyc/status');
    return response.data;
  },

  // Admin: list pending KYC submissions
  adminList: async (statusFilter?: string) => {
    const response = await api.get('/admin/kyc', {
      params: { status: statusFilter },
    });
    return response.data;
  },

  // Admin: review (approve/reject) KYC
  adminReview: async (submissionId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    const response = await api.post(`/admin/kyc/${submissionId}/review`, {
      status,
      rejection_reason: rejectionReason,
    });
    return response.data;
  },
};
