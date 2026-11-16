import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GradeItem, Subject } from '../../types';
import { theme } from '../../theme/theme';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { SubjectAverageResult } from '../../utils/gradeCalculations';

interface SubjectGradeCardProps {
  subject: Subject;
  stats: SubjectAverageResult;
  grades: GradeItem[];
  onAddGrade: (subjectId: string) => void;
  onEditGrade: (grade: GradeItem) => void;
  onDeleteGrade: (grade: GradeItem) => void;
}

export const SubjectGradeCard: React.FC<SubjectGradeCardProps> = ({
  subject,
  stats,
  grades,
  onAddGrade,
  onEditGrade,
  onDeleteGrade,
}) => {
  const target = subject.targetGrade ?? 7.0;
  const progress = stats.average / 10;

  return (
    <Card highlightColor={subject.color} style={styles.subjectGradeCard}>
      <View style={styles.cardTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.subjectTitle}>{subject.name}</Text>
          <Text style={styles.subjectProf}>{subject.professor}</Text>
        </View>
        <View style={styles.averageBadge}>
          <Text
            style={[
              styles.averageValue,
              {
                color:
                  stats.average >= target
                    ? theme.colors.success
                    : theme.colors.warning,
              },
            ]}
          >
            {stats.totalWeight > 0 ? stats.average.toFixed(1) : 'Sem notas'}
          </Text>
          <Text style={styles.targetLabel}>Meta: {target.toFixed(1)}</Text>
        </View>
      </View>

      <View style={{ marginTop: 8 }}>
        <ProgressBar
          progress={progress}
          color={
            stats.average >= target
              ? theme.colors.success
              : theme.colors.warning
          }
          height={8}
        />
      </View>

      <View style={styles.gradesList}>
        <View style={styles.gradesListHeader}>
          <Text style={styles.gradesListTitle}>
            Avaliações ({grades.length})
          </Text>
          <TouchableOpacity onPress={() => onAddGrade(subject.id)}>
            <Text style={styles.addGradeLink}>+ Nota</Text>
          </TouchableOpacity>
        </View>

        {grades.length === 0 ? (
          <Text style={styles.emptyGradesText}>
            Nenhuma avaliação registrada ainda.
          </Text>
        ) : (
          grades.map((g) => (
            <View key={g.id} style={styles.gradeItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.gradeItemName}>{g.name}</Text>
                <Text style={styles.gradeItemWeight}>
                  Peso: {g.weight.toFixed(1)}
                </Text>
              </View>
              <Text style={styles.gradeItemScore}>{g.grade.toFixed(1)}</Text>
              <TouchableOpacity
                onPress={() => onEditGrade(g)}
                style={styles.iconBtn}
              >
                <Text style={styles.editGradeText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDeleteGrade(g)}
                style={styles.iconBtn}
              >
                <Text style={styles.deleteGradeText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  subjectGradeCard: {
    marginBottom: theme.spacing.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subjectProf: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  averageBadge: {
    alignItems: 'flex-end',
  },
  averageValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  targetLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  gradesList: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  gradesListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  gradesListTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  addGradeLink: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  emptyGradesText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  gradeItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceSubtle,
  },
  gradeItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  gradeItemWeight: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  gradeItemScore: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginRight: 8,
  },
  iconBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginLeft: 2,
  },
  editGradeText: {
    fontSize: 12,
  },
  deleteGradeText: {
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
});
