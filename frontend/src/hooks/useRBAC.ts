import { useUserStore, UserRole } from '@/store/userStore';

export type Permission =
  | 'trips:search'
  | 'trips:book'
  | 'payments:pay'
  | 'safety:sos'
  | 'reviews:rate_driver'
  | 'trips:create'
  | 'vehicles:manage'
  | 'rides:verify_otp'
  | 'earnings:view'
  | 'payouts:request'
  | 'kyc:submit'
  | 'reviews:rate_passenger'
  | 'admin:users:manage'
  | 'admin:kyc:review'
  | 'admin:payouts:process'
  | 'admin:analytics:view';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  passenger: [
    'trips:search',
    'trips:book',
    'payments:pay',
    'safety:sos',
    'reviews:rate_driver',
  ],
  driver: [
    'trips:search',
    'trips:create',
    'vehicles:manage',
    'rides:verify_otp',
    'earnings:view',
    'payouts:request',
    'kyc:submit',
    'reviews:rate_passenger',
    'safety:sos',
  ],
  admin: [
    'trips:search',
    'trips:book',
    'payments:pay',
    'safety:sos',
    'reviews:rate_driver',
    'trips:create',
    'vehicles:manage',
    'rides:verify_otp',
    'earnings:view',
    'payouts:request',
    'kyc:submit',
    'reviews:rate_passenger',
    'admin:users:manage',
    'admin:kyc:review',
    'admin:payouts:process',
    'admin:analytics:view',
  ],
};

export function useRBAC() {
  const { role, setRole, isLoggedIn } = useUserStore();

  const hasRole = (allowedRoles: UserRole | UserRole[]): boolean => {
    if (!isLoggedIn) return false;
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(role);
    }
    return role === allowedRoles;
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!isLoggedIn) return false;
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  };

  const isPassenger = role === 'passenger';
  const isDriver = role === 'driver';
  const isAdmin = role === 'admin';

  return {
    role,
    setRole,
    isLoggedIn,
    isPassenger,
    isDriver,
    isAdmin,
    hasRole,
    hasPermission,
  };
}
