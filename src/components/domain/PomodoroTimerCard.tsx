/**
 * Componente PomodoroTimerCard (Card do Cronômetro Pomodoro)
 *
 * Mostrador digital e painel de controle dos ciclos de estudo (Foco 25m,
 * Pausa Curta 5m e Pausa Longa 15m) com vínculo à matéria escolhida.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Subject } from '../../types';
import { theme } from '../../theme/theme';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { SubjectSelector } from '../common/SubjectSelector';
import { ChipSelector, ChipOption } from '../common/ChipSelector';
import { PomodoroMode } from '../../hooks/usePomodoroTimer';

interface PomodoroTimerCardProps {
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubject: (id: string) => void;
  timerMode: PomodoroMode;
  onChangeMode: (mode: PomodoroMode) => void;
  timeFormatted: string;
  isActive: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSaveManualSession: () => void;
  completionNotice?: string | null;
  onDismissNotice?: () => void;
}

const MODE_OPTIONS: ChipOption<PomodoroMode>[] = [
  { value: 'pomodoro', label: 'Foco (25m)' },
  { value: 'shortBreak', label: 'Pausa Curta (5m)' },
  { value: 'longBreak', label: 'Pausa Longa (15m)' },
];

export const PomodoroTimerCard: React.FC<PomodoroTimerCardProps> = ({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  timerMode,
  onChangeMode,
  timeFormatted,
  isActive,
  onToggleTimer,
  onResetTimer,
  onSaveManualSession,
  completionNotice,
  onDismissNotice,
}) => {
  return (
    <Card style={styles.timerCard}>
      <ChipSelector
        options={MODE_OPTIONS}
        value={timerMode}
        onChange={onChangeMode}
        variant="segmented"
        style={styles.modeSelector}
      />

      {completionNotice ? (
        <TouchableOpacity
          style={styles.noticeBanner}
          onPress={onDismissNotice}
          activeOpacity={0.8}
        >
          <Text style={styles.noticeText}>{completionNotice}</Text>
        </TouchableOpacity>
      ) : null}

      <SubjectSelector
        label="Matéria em foco:"
        subjects={subjects}
        selectedId={selectedSubjectId}
        onSelect={onSelectSubject}
        emptyMessage="Nenhuma matéria cadastrada (sessão geral de foco)"
      />

      <View style={styles.clockCircle}>
        <Text style={styles.clockText}>{timeFormatted}</Text>
        <Text style={styles.clockSub}>
          {isActive ? '🔥 Sessão em andamento' : 'Pausado'}
        </Text>
      </View>

      <View style={styles.timerControls}>
        <Button
          title={isActive ? 'Pausar' : 'Iniciar Foco'}
          variant={isActive ? 'secondary' : 'primary'}
          size="lg"
          onPress={onToggleTimer}
          style={{ flex: 1, marginRight: 8 }}
        />
        <Button
          title="Resetar"
          variant="outline"
          size="lg"
          onPress={onResetTimer}
          style={{ flex: 0.7 }}
        />
      </View>

      <TouchableOpacity
        style={styles.manualLogBtn}
        onPress={onSaveManualSession}
      >
        <Text style={styles.manualLogText}>+ Registrar +30min manualmente</Text>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  timerCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  modeSelector: {
    width: '100%',
    marginBottom: 10,
  },
  noticeBanner: {
    width: '100%',
    backgroundColor: theme.colors.successLight,
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: 10,
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 12,
    color: theme.colors.successText,
    fontWeight: '600',
    textAlign: 'center',
  },
  clockCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 4,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  clockText: {
    fontSize: 48,
    fontWeight: '900',
    color: theme.colors.primaryDark,
    letterSpacing: -1,
  },
  clockSub: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  timerControls: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: theme.spacing.md,
    marginTop: 6,
  },
  manualLogBtn: {
    marginTop: 12,
    paddingVertical: 6,
  },
  manualLogText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
