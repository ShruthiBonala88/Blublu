import React from 'react';
import { StyleSheet, View, ViewStyle, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  backgroundColor?: string;
  barStyle?: 'light-content' | 'dark-content';
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  scrollable = false,
  backgroundColor = colors.background.primary,
  barStyle = 'light-content',
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={barStyle} backgroundColor={backgroundColor} />
      {scrollable ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, style]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.content, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
