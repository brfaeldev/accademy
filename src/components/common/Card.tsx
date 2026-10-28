import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '../../theme/theme';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  highlightColor?: string;
}

export const Card: React.FC<CardProps> = ({ children, style, highlightColor }) => {
  return (
    <View
      style={[
        styles.card,
        highlightColor ? { borderLeftWidth: 4, borderLeftColor: highlightColor } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
});
