import CreateTripScreen from '@/features/driver/create-trip/CreateTripScreen';
import RoleGuard from '@/components/auth/RoleGuard';

export default function CreateTrip() {
  return (
    <RoleGuard allowedRoles={['driver', 'admin']}>
      <CreateTripScreen />
    </RoleGuard>
  );
}