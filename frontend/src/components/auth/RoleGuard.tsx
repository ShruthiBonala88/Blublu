import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useRBAC, Permission } from '@/hooks/useRBAC';
import { UserRole } from '@/store/userStore';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: Permission;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  fallback,
  showAccessDenied = true,
}) => {
  const router = useRouter();
  const { role, hasRole, hasPermission } = useRBAC();

  const isRoleAllowed = allowedRoles ? hasRole(allowedRoles) : true;
  const isPermAllowed = requiredPermission ? hasPermission(requiredPermission) : true;

  const isAuthorized = isRoleAllowed && isPermAllowed;

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showAccessDenied) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.title}>Access Restricted</Text>
        <Text style={styles.message}>
          This feature requires{' '}
          {allowedRoles ? allowedRoles.join(' or ') : 'additional'}{' '}
          permissions. You are currently browsing as a{' '}
          <Text style={styles.bold}>{role}</Text>.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/role-selection')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Switch Role</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    maxWidth: 360,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  bold: {
    fontWeight: '600',
    color: '#2563EB',
    textTransform: 'capitalize',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default RoleGuard;
