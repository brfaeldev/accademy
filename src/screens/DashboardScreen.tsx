import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { theme } from '../theme/theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { FloatingActionButton } from '../components/common/FloatingActionButton';
import { Header } from '../components/common/Header';

interface DashboardScreenProps {
  onNavigateToTab: (tabName: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToTab }) => {
  const { subjects, tasks, grades, studySessions, toggleTaskStatus } = useApp();

  // Próximas tarefas (próximos 7 dias)
  const pendingTasks = tasks.filter((t) => t.status !== 'Concluído');
  const next7DaysTasks = pendingTasks.slice(0, 4);

  // Total de horas estudadas
  const totalStudyMinutes = studySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalHours = (totalStudyMinutes / 60).toFixed(1);

  // Média geral do aluno
  const allGrades = grades.map((g) => g.grade);
  const overallAvg =
    allGrades.length > 0
      ? (allGrades.reduce((a, b) => a + b, 0) / allGrades.length).toFixed(1)
      : '0.0';

  const nextClass = subjects[0] ?? {
    name: 'Nenhuma aula cadastrada',
    location: '—',
    schedule: 'Consulte a grade',
    professor: '—',
  };

  return (
    <View style={styles.container}>
      <Header
        title="Controle de Estudos"
        subtitle="Bem-vindo de volta! Resumo acadêmico do dia."
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Metric Banner Cards */}
        <View style={styles.metricsRow}>
          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: '#EEF2FF' }]}
            activeOpacity={0.8}
            onPress={() => onNavigateToTab('tasks')}
          >
            <Text style={[styles.metricNumber, { color: theme.colors.primary }]}>
              {pendingTasks.length}
            </Text>
            <Text style={styles.metricLabel}>Tarefas Ativas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: '#ECFDF5' }]}
            activeOpacity={0.8}
            onPress={() => onNavigateToTab('grades')}
          >
            <Text style={[styles.metricNumber, { color: theme.colors.success }]}>
              {overallAvg}
            </Text>
            <Text style={styles.metricLabel}>Média Global</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: '#FFFBEB' }]}
            activeOpacity={0.8}
            onPress={() => onNavigateToTab('focus')}
          >
            <Text style={[styles.metricNumber, { color: theme.colors.warning }]}>
              {totalHours}h
            </Text>
            <Text style={styles.metricLabel}>Horas Foco</Text>
          </TouchableOpacity>
        </View>

        {/* Card: Próxima Aula */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📍 Próxima Aula</Text>
          <TouchableOpacity onPress={() => onNavigateToTab('subjects')}>
            <Text style={styles.sectionLink}>Ver Todas</Text>
          </TouchableOpacity>
        </View>

        <Card highlightColor={theme.colors.primary}>
          <View style={styles.classHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.className}>{nextClass.name}</Text>
              <Text style={styles.classProfessor}>Docente: {nextClass.professor}</Text>
            </View>
            <Badge label="Hoje" color={theme.colors.primary} variant="subject" />
          </View>
          <View style={styles.classDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🏛</Text>
              <Text style={styles.detailText}>{nextClass.location}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🕒</Text>
              <Text style={styles.detailText}>{nextClass.schedule}</Text>
            </View>
          </View>
        </Card>

        {/* Card: Próximos 7 Dias (Tarefas e Provas) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📅 Vencimentos nos Próximos 7 Dias</Text>
          <TouchableOpacity onPress={() => onNavigateToTab('tasks')}>
            <Text style={styles.sectionLink}>Ver Agenda</Text>
          </TouchableOpacity>
        </View>

        {next7DaysTasks.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>🎉 Parabéns! Nenhuma pendência para os próximos dias.</Text>
          </Card>
        ) : (
          next7DaysTasks.map((task) => {
            const subject = subjects.find((s) => s.id === task.subjectId);
            return (
              <Card key={task.id} style={styles.taskCard}>
                <View style={styles.taskTopRow}>
                  <Badge
                    label={subject ? subject.name : 'Disciplina'}
                    color={subject?.color ?? theme.colors.primary}
                    variant="subject"
                    size="sm"
                  />
                  <Badge
                    label={task.status}
                    status={task.status}
                    variant="status"
                    size="sm"
                  />
                </View>
                <Text style={styles.taskTitle}>{task.title}</Text>
                {task.description ? (
                  <Text style={styles.taskDesc} numberOfLines={2}>
                    {task.description}
                  </Text>
                ) : null}
                <View style={styles.taskFooter}>
                  <Text style={styles.taskDueDate}>🗓 Entrega: {task.dueDate}</Text>
                  <TouchableOpacity
                    onPress={() => toggleTaskStatus(task.id)}
                    style={styles.toggleBtn}
                  >
                    <Text style={styles.toggleBtnText}>Alterar Status ➔</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        )}

        {/* Seção de Ações Rápidas */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>⚡ Acesso Rápido</Text>
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => onNavigateToTab('subjects')}
            >
              <Text style={styles.quickIcon}>📚</Text>
              <Text style={styles.quickTitle}>Disciplinas</Text>
              <Text style={styles.quickSub}>{subjects.length} cadastradas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => onNavigateToTab('grades')}
            >
              <Text style={styles.quickIcon}>📊</Text>
              <Text style={styles.quickTitle}>Simulador</Text>
              <Text style={styles.quickSub}>Calcular final</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => onNavigateToTab('focus')}
            >
              <Text style={styles.quickIcon}>⏱</Text>
              <Text style={styles.quickTitle}>Pomodoro</Text>
              <Text style={styles.quickSub}>Modo foco</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Botão Flutuante (FAB) do Escopo */}
      <FloatingActionButton
        label="Estudar Agora"
        onPress={() => onNavigateToTab('focus')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 90,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    ...theme.shadows.soft,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  sectionLink: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  className: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  classProfessor: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  classDetails: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  detailText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  taskCard: {
    marginBottom: theme.spacing.sm,
  },
  taskTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginVertical: 2,
  },
  taskDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  taskDueDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  toggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  toggleBtnText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
  quickAccessSection: {
    marginTop: theme.spacing.md,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  quickCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: 3,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  quickIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  quickSub: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});
