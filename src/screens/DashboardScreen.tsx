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
import { EmptyState } from '../components/common/EmptyState';
import { FloatingActionButton } from '../components/common/FloatingActionButton';
import { Header } from '../components/common/Header';
import { TaskCard } from '../components/domain/TaskCard';
import {
  filterUpcomingAndOverdueTasks,
  getNextClassForToday,
} from '../utils/dateUtils';

interface DashboardScreenProps {
  onNavigateToTab: (tabName: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToTab,
}) => {
  const {
    subjects,
    tasks,
    studySessions,
    toggleTaskStatus,
    getGlobalAverage,
    currentUser,
    logout,
  } = useApp();

  const pendingTasks = tasks.filter((t) => t.status !== 'Concluído');
  const next7DaysTasks = filterUpcomingAndOverdueTasks(tasks).slice(0, 5);

  const totalStudyMinutes = studySessions.reduce(
    (acc, curr) => acc + curr.durationMinutes,
    0
  );
  const totalHours = (totalStudyMinutes / 60).toFixed(1);

  const overallAvg = getGlobalAverage().toFixed(1);
  const { subject: nextClass, badgeLabel: nextClassBadge } =
    getNextClassForToday(subjects);

  return (
    <View style={styles.container}>
      <Header
        title="Accademy"
        subtitle={
          currentUser
            ? `Olá, ${currentUser.name}! 👋 Resumo do dia.`
            : 'Bem-vindo de volta! Resumo acadêmico do dia.'
        }
        rightAction={{
          icon: '🚪',
          label: 'Sair',
          onPress: logout,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {currentUser ? (
          <View style={styles.userBanner}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {currentUser.name
                  ? currentUser.name.charAt(0).toUpperCase()
                  : '👤'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{currentUser.name}</Text>
                <Badge
                  label="Online no SQLite"
                  variant="status"
                  status="Concluído"
                  size="sm"
                />
              </View>
              <Text style={styles.userSub}>
                {currentUser.email}
                {currentUser.course ? ` • ${currentUser.course}` : ''}
              </Text>
            </View>
            <TouchableOpacity
              onPress={logout}
              style={styles.logoutPill}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutPillText}>Sair</Text>
            </TouchableOpacity>
          </View>
        ) : null}

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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📍 Próxima Aula</Text>
          <TouchableOpacity onPress={() => onNavigateToTab('subjects')}>
            <Text style={styles.sectionLink}>Ver Todas</Text>
          </TouchableOpacity>
        </View>

        {!nextClass ? (
          <EmptyState
            icon="📚"
            title="Nenhuma matéria cadastrada"
            description='Toque em "Ver Todas" para cadastrar suas disciplinas do semestre.'
            actionLabel="Ir para Matérias"
            onAction={() => onNavigateToTab('subjects')}
          />
        ) : (
          <Card highlightColor={nextClass.color || theme.colors.primary}>
            <View style={styles.classHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.className}>{nextClass.name}</Text>
                <Text style={styles.classProfessor}>
                  Docente: {nextClass.professor}
                </Text>
              </View>
              <Badge
                label={nextClassBadge}
                color={nextClass.color || theme.colors.primary}
                variant="subject"
              />
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
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            📅 Vencimentos nos Próximos 7 Dias
          </Text>
          <TouchableOpacity onPress={() => onNavigateToTab('tasks')}>
            <Text style={styles.sectionLink}>Ver Agenda</Text>
          </TouchableOpacity>
        </View>

        {next7DaysTasks.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="Sem entregas nos próximos 7 dias"
            description="Nenhuma tarefa pendente vencendo nos próximos 7 dias ou atrasada."
          />
        ) : (
          next7DaysTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              subject={subjects.find((s) => s.id === task.subjectId)}
              compact
              onToggleStatus={toggleTaskStatus}
            />
          ))
        )}

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
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  userSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  logoutPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.dangerText,
  },
});
