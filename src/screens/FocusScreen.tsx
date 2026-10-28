import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { theme } from '../theme/theme';
import { Card } from '../components/common/Card';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';

export const FocusScreen: React.FC = () => {
  const { subjects, studySessions, addStudySession, getSubjectAverage } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id ?? ''
  );
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  
  // Pomodoro: 25min (1500s), Pausa curta: 5min (300s), Pausa longa: 15min (900s)
  const getInitialSeconds = (mode: string) => {
    if (mode === 'pomodoro') return 25 * 60;
    if (mode === 'shortBreak') return 5 * 60;
    return 15 * 60;
  };

  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsActive(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const handleTimerComplete = () => {
    Alert.alert('⏰ Tempo Esgotado!', 'Excelente trabalho! Sessão de foco concluída.');
    const targetSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
    if (timerMode === 'pomodoro' && targetSubject) {
      addStudySession({
        subjectId: targetSubject.id,
        subjectName: targetSubject.name,
        durationMinutes: 25,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        notes: 'Sessão Pomodoro concluída com sucesso',
      });
    }
  };

  const handleToggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsLeft(getInitialSeconds(timerMode));
  };

  const handleChangeMode = (mode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setIsActive(false);
    setTimerMode(mode);
    setSecondsLeft(getInitialSeconds(mode));
  };

  const handleSaveManualSession = () => {
    const targetSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
    if (!targetSubject) return;

    addStudySession({
      subjectId: targetSubject.id,
      subjectName: targetSubject.name,
      durationMinutes: 30,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      notes: 'Registro manual de 30 minutos de estudo',
    });

    Alert.alert('Sucesso', '30 minutos de estudo registrados no seu histórico!');
  };

  // Formatar tempo MM:SS
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Cálculo de Horas por Matéria para os Relatórios de Produtividade
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
        {/* TIMER POMODORO INTERATIVO */}
        <Card style={styles.timerCard}>
          {/* Seletor de Modo */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.modeTab, timerMode === 'pomodoro' && styles.modeTabActive]}
              onPress={() => handleChangeMode('pomodoro')}
            >
              <Text style={[styles.modeTabText, timerMode === 'pomodoro' && styles.modeTabTextActive]}>
                Foco (25m)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, timerMode === 'shortBreak' && styles.modeTabActive]}
              onPress={() => handleChangeMode('shortBreak')}
            >
              <Text style={[styles.modeTabText, timerMode === 'shortBreak' && styles.modeTabTextActive]}>
                Pausa Curta (5m)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, timerMode === 'longBreak' && styles.modeTabActive]}
              onPress={() => handleChangeMode('longBreak')}
            >
              <Text style={[styles.modeTabText, timerMode === 'longBreak' && styles.modeTabTextActive]}>
                Pausa Longa (15m)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Seletor de Matéria Vinculada */}
          <View style={styles.subSelectArea}>
            <Text style={styles.subSelectLabel}>Matéria em foco:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
              {subjects.map((sub) => {
                const isSelected = (currentSubject?.id ?? '') === sub.id;
                return (
                  <TouchableOpacity
                    key={sub.id}
                    style={[
                      styles.subChip,
                      isSelected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                    ]}
                    onPress={() => setSelectedSubjectId(sub.id)}
                  >
                    <Text style={[styles.subChipText, isSelected && { color: '#FFF', fontWeight: '700' }]}>
                      {sub.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Relógio Digital */}
          <View style={styles.clockCircle}>
            <Text style={styles.clockText}>{timeFormatted}</Text>
            <Text style={styles.clockSub}>
              {isActive ? '🔥 Sessão em andamento' : 'Pausado'}
            </Text>
          </View>

          {/* Controles de Play / Pause / Reset */}
          <View style={styles.timerControls}>
            <Button
              title={isActive ? 'Pausar' : 'Iniciar Foco'}
              variant={isActive ? 'secondary' : 'primary'}
              size="lg"
              onPress={handleToggleTimer}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Resetar"
              variant="outline"
              size="lg"
              onPress={handleReset}
              style={{ flex: 0.7 }}
            />
          </View>

          <TouchableOpacity
            style={styles.manualLogBtn}
            onPress={handleSaveManualSession}
          >
            <Text style={styles.manualLogText}>+ Registrar +30min manualmente</Text>
          </TouchableOpacity>
        </Card>

        {/* RELATÓRIOS DE PRODUTIVIDADE E DEDICAÇÃO */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📈 Relatório de Dedicação Líquida</Text>
          <Text style={styles.sectionSub}>Horas estudadas conectadas ao rendimento acadêmico</Text>
        </View>

        <Card style={styles.reportCard}>
          {hoursPerSubject.map((item) => {
            const progress = item.minutes / maxMinutes;
            return (
              <View key={item.subject.id} style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statSubject}>{item.subject.name}</Text>
                  <Text style={styles.statDetails}>
                    {item.hours}h dedicadas • Média: {item.avg > 0 ? item.avg.toFixed(1) : '—'}
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

        {/* HISTÓRICO DE SESSÕES */}
        <Text style={styles.sectionTitle}>🕒 Histórico Recente de Estudos</Text>
        {studySessions.slice(0, 5).map((sess) => (
          <Card key={sess.id} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionSubject}>{sess.subjectName}</Text>
              <Badge
                label={`${sess.durationMinutes} min`}
                color={theme.colors.success}
                variant="subject"
                size="sm"
              />
            </View>
            <Text style={styles.sessionDate}>📅 {sess.date}</Text>
            {sess.notes ? <Text style={styles.sessionNotes}>{sess.notes}</Text> : null}
          </Card>
        ))}
      </ScrollView>
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
  timerCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.full,
    padding: 3,
    marginBottom: 12,
  },
  modeTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  modeTabActive: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.soft,
  },
  modeTabText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  subSelectArea: {
    width: '100%',
    marginVertical: 6,
  },
  subSelectLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  subChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginRight: 6,
  },
  subChipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
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
  sectionHeader: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  sectionSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  reportCard: {
    padding: theme.spacing.md,
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
