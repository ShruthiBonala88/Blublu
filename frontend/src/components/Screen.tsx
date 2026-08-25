import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';
import React, { PropsWithChildren } from 'react';
import {
  ScrollView,
  StyleSheet,
} from 'react-native';



type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
}>;

export function Screen({
  children,
  scroll = true,
}: ScreenProps) {
  if (scroll) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, styles.content]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
  },
});