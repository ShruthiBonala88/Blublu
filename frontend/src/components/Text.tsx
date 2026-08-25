import React, { PropsWithChildren } from 'react';
import { StyleSheet, Text as RNText, TextProps } from 'react-native';

import { colors } from '@/theme';

type AppTextProps = PropsWithChildren<TextProps & {
  size?: number;
  weight?: '400' | '500' | '600' | '700';
  color?: string;
}>;

export function Text({
  children,
  size = 16,
  weight = '400',
  color = colors.text,
  style,
  ...props
}: AppTextProps) {
  return (
    <RNText
      {...props}
      style={[
        styles.text,
        {
          fontSize: size,
          fontWeight: weight,
          color,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  text: {
    lineHeight: 24,
  },
});