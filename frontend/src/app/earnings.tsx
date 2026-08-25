import EarningsScreen from '@/features/driver/earnings/EarningsScreen';
import RoleGuard from '@/components/auth/RoleGuard';

export default function Earnings() {
  return (
    <RoleGuard allowedRoles={['driver', 'admin']}>
      <EarningsScreen />
    </RoleGuard>
  );
}