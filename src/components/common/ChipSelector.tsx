import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme/theme';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface ChipSelectorProps<T extends string> {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: 'segmented' | 'chips' | 'filter';
  style?: StyleProp<ViewStyle>;
}

export function ChipSelector<T extends string>({
  options,
  value,
  onChange,
  variant = 'chips',
  style,
}: ChipSelectorProps<T>) {
  if (variant === 'segmented') {
    return (
      <View style={[styles.segmentedContainer, style]}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.segmentedTab,
                isSelected && styles.segmentedTabActive,
              ]}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentedText,
                  isSelected && styles.segmentedTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  if (variant === 'filter') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={style}
      >
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.filterChip,
                isSelected && styles.filterChipActive,
              ]}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextActive,
                ]}
              >
                {opt.label}
                {opt.count !== undefined ? ` (${opt.count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.chipsGroup, style]}>
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, isSelected && styles.chipActive]}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.75}
          >
            <Text
              style={[styles.chipText, isSelected && styles.chipTextActive]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
  },
  segmentedTab: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
  },
  segmentedTabActive: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.soft,
  },
  segmentedText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  segmentedTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceSubtle,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  chipsGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  chipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
