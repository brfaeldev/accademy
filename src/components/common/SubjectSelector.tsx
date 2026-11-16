import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Subject } from '../../types';
import { theme } from '../../theme/theme';

interface SubjectSelectorProps {
  subjects: Subject[];
  selectedId: string;
  onSelect: (subjectId: string) => void;
  label?: string;
  activeColor?: string;
  emptyMessage?: string;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  subjects,
  selectedId,
  onSelect,
  label,
  activeColor = theme.colors.primary,
  emptyMessage = 'Nenhuma matéria cadastrada.',
}) => {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {subjects.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {subjects.map((sub) => {
            const isSelected = selectedId === sub.id;
            const chipColor = sub.color || activeColor;

            return (
              <TouchableOpacity
                key={sub.id}
                style={[
                  styles.chip,
                  isSelected && {
                    backgroundColor: activeColor,
                    borderColor: activeColor,
                  },
                ]}
                onPress={() => onSelect(sub.id)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: isSelected ? '#FFFFFF' : chipColor },
                  ]}
                />
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {sub.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  scrollContent: {
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginRight: 8,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyBox: {
    backgroundColor: theme.colors.warningLight,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 12,
    color: theme.colors.warningText,
    fontWeight: '500',
  },
});
