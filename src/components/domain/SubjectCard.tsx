/**
 * Componente SubjectCard (Card de Disciplina)
 *
 * Apresenta as informações detalhadas da matéria (código, docente, local,
 * horários e média atual ponderada), além de ações de edição e exclusão.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Subject } from '../../types';
import { theme } from '../../theme/theme';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { SubjectAverageResult } from '../../utils/gradeCalculations';

interface SubjectCardProps {
  subject: Subject;
  stats: SubjectAverageResult;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  stats,
  onEdit,
  onDelete,
}) => {
  const target = subject.targetGrade ?? 7.0;

  return (
    <Card highlightColor={subject.color} style={styles.subjectCard}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.codeRow}>
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>{subject.code}</Text>
            </View>
            <View style={styles.targetBadge}>
              <Text style={styles.targetBadgeText}>Meta: {target.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={styles.subjectName}>{subject.name}</Text>
        </View>
        <View style={styles.gradeBadge}>
          <Text style={styles.gradeBadgeLabel}>Média Atual</Text>
          <Text
            style={[
              styles.gradeBadgeValue,
              {
                color: stats.passing
                  ? theme.colors.success
                  : theme.colors.warning,
              },
            ]}
          >
            {stats.totalWeight > 0 ? stats.average.toFixed(1) : '—'}
          </Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>👨‍🏫</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Docente Responsável</Text>
            <Text style={styles.infoValue}>{subject.professor}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>✉️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Canal de Contato</Text>
            <Text style={styles.infoValue}>{subject.professorEmail}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Localização (Física ou Remota)</Text>
            <Text style={styles.infoValue}>{subject.location}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🕒</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Dias e Horários</Text>
            <Text style={styles.infoValue}>{subject.schedule}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <Button
          title="Editar"
          variant="outline"
          size="sm"
          onPress={() => onEdit(subject)}
          style={{ marginRight: 8, flex: 1 }}
        />
        <Button
          title="Excluir"
          variant="danger"
          size="sm"
          onPress={() => onDelete(subject)}
          style={{ flex: 0.6 }}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  subjectCard: {
    padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  codeBadge: {
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  targetBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  targetBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  subjectName: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  gradeBadge: {
    alignItems: 'flex-end',
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
  },
  gradeBadgeLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  gradeBadgeValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  infoSection: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  infoTitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
});
