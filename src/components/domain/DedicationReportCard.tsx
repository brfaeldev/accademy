import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Subject, StudySession } from '../../types';
import { theme } from '../../theme/theme';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { SubjectAverageResult } from '../../utils/gradeCalculations';

interface DedicationReportCardProps {
  subjects: Subject[];
  studySessions: StudySession[];
  getSubjectAverage: (subjectId: string) => SubjectAverageResult;
}

export const DedicationReportCard: React.FC<DedicationReportCardProps> = ({
  subjects,
  studySessions,
  getSubjectAverage,
}) => {
  const hoursPerSubject = subjects.map((sub) => {
    const totalMinutes = studySessions
      .filter((s) => s.subjectId === sub.id)
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const avg = getSubjectAverage(sub.id).average;
    return {
      subject: sub,
      minutes: totalMinutes,
      hours: (totalMinutes / 60).toFixed(1),
      avg,
    };
  });

  const maxMinutes = Math.max(...hoursPerSubject.map((h) => h.minutes), 60);

  if (subjects.length === 0) {
    return (
      <Card style={styles.reportCard}>
        <Text style={styles.emptyText}>
          Cadastre disciplinas na aba &quot;Matérias&quot; para acompanhar o relatório de horas dedicadas por matéria.
        </Text>
      </Card>
    );
  }

  return (
    <Card style={styles.reportCard}>
      {hoursPerSubject.map((item) => {
        const progress = item.minutes / maxMinutes;
        return (
          <View key={item.subject.id} style={styles.statRow}>
            <View style={styles.statInfo}>
              <Text style={styles.statSubject}>{item.subject.name}</Text>
              <Text style={styles.statDetails}>
                {item.hours}h dedicadas • Média:{' '}
                {item.avg > 0 ? item.avg.toFixed(1) : '—'}
              </Text>
            </View>

            <View style={styles.statBarContainer}>
              <ProgressBar
                progress={progress}
                color={item.subject.color}
                height={10}
              />
            </View>
          </View>
        );
      })}
    </Card>
  );
};

const styles = StyleSheet.create({
  reportCard: {
    padding: theme.spacing.md,
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 8,
  },
  statRow: {
    marginVertical: 8,
  },
  statInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statSubject: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statDetails: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  statBarContainer: {
    marginTop: 2,
  },
});
