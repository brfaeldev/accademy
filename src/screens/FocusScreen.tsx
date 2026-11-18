/**
 * Tela de Foco e Pomodoro (FocusScreen)
 *
 * Central de produtividade que abriga o cronômetro Pomodoro, registro manual
 * de horas de estudo, histórico de sessões e relatório de dedicação por matéria.
 */

import React, { useState } from 'react';
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
import { Header } from '../components/common/Header';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { PomodoroTimerCard } from '../components/domain/PomodoroTimerCard';
import { DedicationReportCard } from '../components/domain/DedicationReportCard';
import { StudySession } from '../types';
import { getTodayISO, formatDateDisplay } from '../utils/dateUtils';

export const FocusScreen: React.FC = () => {
  const {
    subjects,
    studySessions,
    addStudySession,
    deleteStudySession,
    getSubjectAverage,
    pomodoro,
  } = useApp();

  const [showAllSessions, setShowAllSessions] = useState(false);
  const [manualNotice, setManualNotice] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<StudySession | null>(
    null
  );

  const handleSaveManualSession = async () => {
    const targetSubject =
      subjects.find((s) => s.id === pomodoro.selectedSubjectId) || subjects[0];

    const subjectName = targetSubject?.name ?? 'Estudo Geral';
    await addStudySession({
      subjectId: targetSubject?.id ?? '',
      subjectName,
      durationMinutes: 30,
      date: getTodayISO(),
      timestamp: new Date().toISOString(),
      notes: 'Registro manual de 30 minutos de estudo',
    });

    setManualNotice(
      `✅ +30 minutos registrados em "${subjectName}" no seu histórico!`
    );
  };

  const handleConfirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    await deleteStudySession(sessionToDelete.id);
    setSessionToDelete(null);
  };

  const visibleSessions = showAllSessions
    ? studySessions
    : studySessions.slice(0, 5);

  return (
    <View style={styles.container}>
      <Header
        title="Central de Foco"
        subtitle="Cronômetro Pomodoro e Relatórios de Dedicação"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <PomodoroTimerCard
          subjects={subjects}
          selectedSubjectId={pomodoro.selectedSubjectId}
          onSelectSubject={pomodoro.setSelectedSubjectId}
          timerMode={pomodoro.timerMode}
          onChangeMode={pomodoro.changeMode}
          timeFormatted={pomodoro.timeFormatted}
          isActive={pomodoro.isActive}
          onToggleTimer={pomodoro.toggleTimer}
          onResetTimer={pomodoro.resetTimer}
          onSaveManualSession={handleSaveManualSession}
          completionNotice={pomodoro.completionNotice || manualNotice}
          onDismissNotice={() => {
            pomodoro.dismissCompletionNotice();
            setManualNotice(null);
          }}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📈 Relatório de Dedicação Líquida</Text>
          <Text style={styles.sectionSub}>
            Horas estudadas conectadas ao rendimento acadêmico
          </Text>
        </View>

        <DedicationReportCard
          subjects={subjects}
          studySessions={studySessions}
          getSubjectAverage={getSubjectAverage}
        />

        <View style={styles.historyHeaderRow}>
          <Text style={styles.sectionTitle}>
            🕒 Histórico de Estudos ({studySessions.length})
          </Text>
          {studySessions.length > 5 ? (
            <TouchableOpacity
              onPress={() => setShowAllSessions((prev) => !prev)}
            >
              <Text style={styles.toggleHistoryLink}>
                {showAllSessions
                  ? 'Mostrar menos'
                  : `Ver todas (${studySessions.length})`}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {studySessions.length === 0 ? (
          <EmptyState
            icon="⏱️"
            title="Nenhuma sessão registrada"
            description="Inicie o cronômetro Pomodoro acima ou registre +30min manualmente para acompanhar sua evolução."
          />
        ) : (
          visibleSessions.map((sess) => (
            <Card key={sess.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionSubject}>{sess.subjectName}</Text>
                <View style={styles.sessionRight}>
                  <Badge
                    label={`${sess.durationMinutes} min`}
                    color={theme.colors.success}
                    variant="subject"
                    size="sm"
                  />
                  <TouchableOpacity
                    onPress={() => setSessionToDelete(sess)}
                    style={styles.deleteBtn}
                  >
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.sessionDate}>
                📅 {formatDateDisplay(sess.date)}
              </Text>
              {sess.notes ? (
                <Text style={styles.sessionNotes}>{sess.notes}</Text>
              ) : null}
            </Card>
          ))
        )}
      </ScrollView>

      <ConfirmModal
        visible={!!sessionToDelete}
        title="Remover Sessão de Estudo"
        message={
          sessionToDelete
            ? `Deseja excluir o registro de ${sessionToDelete.durationMinutes} min em "${sessionToDelete.subjectName}"?`
            : ''
        }
        confirmLabel="Excluir"
        onConfirm={handleConfirmDeleteSession}
        onCancel={() => setSessionToDelete(null)}
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
    paddingBottom: 40,
  },
  sectionHeader: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  sectionSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  toggleHistoryLink: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  sessionCard: {
    marginBottom: theme.spacing.sm,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionSubject: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  sessionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteBtn: {
    padding: 4,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.sm,
  },
  deleteBtnText: {
    fontSize: 13,
  },
  sessionDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  sessionNotes: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});
