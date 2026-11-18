/**
 * Componente TaskCard (Card de Tarefa / Avaliação)
 *
 * Apresenta prazos de provas e trabalhos, badges contextuais de urgência
 * (atrasado, hoje, dias restantes), alternância rápida de status e ações CRUD.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Subject, Task } from '../../types';
import { theme } from '../../theme/theme';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { formatDateDisplay, getTaskDueState } from '../../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  subject?: Subject;
  compact?: boolean;
  onToggleStatus: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  subject,
  compact = false,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  const dueState = task.status === 'Concluído' ? 'later' : getTaskDueState(task.dueDate);
  const formattedDate = formatDateDisplay(task.dueDate);

  const getDueBadge = () => {
    if (task.status === 'Concluído') return null;
    if (dueState === 'overdue') {
      return <Badge label="⚠️ Atrasada" variant="status" status="Pendente" size="sm" />;
    }
    if (dueState === 'today') {
      return <Badge label="🔥 Vence Hoje" variant="status" status="Em Andamento" size="sm" />;
    }
    return null;
  };

  return (
    <Card
      highlightColor={subject?.color ?? theme.colors.primary}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.tagRow}>
          <Badge
            label={subject?.name ?? 'Disciplina'}
            color={subject?.color ?? theme.colors.primary}
            variant="subject"
            size="sm"
          />
          <Badge
            label={task.type}
            type={task.type}
            variant="type"
            size="sm"
          />
          {getDueBadge()}
        </View>

        <TouchableOpacity
          onPress={() => onToggleStatus(task.id)}
          activeOpacity={0.7}
        >
          <Badge
            label={task.status}
            status={task.status}
            variant="status"
            size="sm"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{task.title}</Text>
      {task.description ? (
        <Text
          style={styles.description}
          numberOfLines={compact ? 2 : undefined}
        >
          {task.description}
        </Text>
      ) : null}

      {compact ? (
        <View style={styles.footerRow}>
          <Text
            style={[
              styles.metaText,
              dueState === 'overdue' && styles.overdueText,
            ]}
          >
            🗓 Entrega: {formattedDate}
          </Text>
          <TouchableOpacity
            onPress={() => onToggleStatus(task.id)}
            style={styles.toggleBtn}
          >
            <Text style={styles.toggleBtnText}>Alterar Status ➔</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.metaRow}>
            <Text
              style={[
                styles.metaText,
                dueState === 'overdue' && styles.overdueText,
              ]}
            >
              📅 Entrega: {formattedDate}
            </Text>
            <Text style={styles.metaText}>
              ⚖️ Peso Acadêmico: {task.weight.toFixed(1)}
            </Text>
          </View>

          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => onToggleStatus(task.id)}
            >
              <Text style={styles.toggleBtnText}>
                🔄 Mudar Status: <Text style={styles.bold}>{task.status}</Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.iconActions}>
              {onEdit ? (
                <TouchableOpacity
                  onPress={() => onEdit(task)}
                  style={styles.iconBtn}
                >
                  <Text style={styles.iconBtnText}>✏️</Text>
                </TouchableOpacity>
              ) : null}
              {onDelete ? (
                <TouchableOpacity
                  onPress={() => onDelete(task)}
                  style={[styles.iconBtn, { marginLeft: 6 }]}
                >
                  <Text style={styles.iconBtnText}>🗑️</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginVertical: 3,
  },
  description: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    paddingVertical: 4,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  overdueText: {
    color: theme.colors.dangerText,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  toggleBtn: {
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.sm,
  },
  toggleBtnText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  bold: {
    fontWeight: '700',
  },
  iconActions: {
    flexDirection: 'row',
  },
  iconBtn: {
    padding: 6,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.sm,
  },
  iconBtnText: {
    fontSize: 14,
  },
});
