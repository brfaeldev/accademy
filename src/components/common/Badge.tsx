import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';
import { TaskStatus, TaskType } from '../../types';

interface BadgeProps {
  label: string;
  variant?: 'status' | 'type' | 'subject' | 'neutral';
  status?: TaskStatus;
  type?: TaskType;
  color?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  status,
  color,
  size = 'md',
}) => {
  let backgroundColor = theme.colors.surfaceSubtle;
  let textColor = theme.colors.textSecondary;
  let borderColor = theme.colors.surfaceBorder;

  if (variant === 'status' && status) {
    switch (status) {
      case 'Concluído':
        backgroundColor = theme.colors.successLight;
        textColor = theme.colors.successText;
        borderColor = '#A7F3D0';
        break;
      case 'Em Andamento':
        backgroundColor = theme.colors.warningLight;
        textColor = theme.colors.warningText;
        borderColor = '#FDE68A';
        break;
      case 'Pendente':
        backgroundColor = theme.colors.dangerLight;
        textColor = theme.colors.dangerText;
        borderColor = '#FECACA';
        break;
    }
  } else if (variant === 'subject' && color) {
    backgroundColor = `${color}18`;
    textColor = color;
    borderColor = `${color}35`;
  }

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor, borderColor },
        isSmall && styles.badgeSm,
      ]}
    >
      <Text style={[styles.text, { color: textColor }, isSmall && styles.textSm]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
  },
});
