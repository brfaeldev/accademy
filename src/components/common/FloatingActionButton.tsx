import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

interface FloatingActionButtonProps {
  onPress: () => void;
  label?: string;
  iconText?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  label = 'Iniciar Foco',
  iconText = '⏱',
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.fab}
      onPress={onPress}
    >
      <Text style={styles.icon}>{iconText}</Text>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    ...theme.shadows.hover,
    zIndex: 99,
  },
  icon: {
    fontSize: 18,
    marginRight: 6,
    color: '#FFFFFF',
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
