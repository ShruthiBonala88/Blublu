import { useAuth as useAuthContext } from '../app/providers/AuthProvider';

export const useAuth = () => {
  return useAuthContext();
};
