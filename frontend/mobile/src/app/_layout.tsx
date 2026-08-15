import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AppProviders } from '../providers/AppProviders';
import { useAuth } from '../providers/AuthProvider';
import { Loading } from '../components/Loading';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    SplashScreen.hideAsync().catch(() => {});

    const inAuthGroup = segments[0] === '(auth)';

    if (status === 'unauthenticated' && !inAuthGroup) {
      router.replace('/(auth)/splash' as any);
    } else if (status === 'authenticated' && inAuthGroup) {
      router.replace('/(main)' as any);
    }
  }, [status, segments]);

  if (status === 'loading') {
    return <Loading message="Initializing Blublu..." overlay />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RouteGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
        </Stack>
      </RouteGuard>
    </AppProviders>
  );
}
