import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState as RNAppState } from 'react-native';
import { Subject, StudySession } from '../types';
import { getTodayISO } from '../utils/dateUtils';

export type PomodoroMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export function getInitialPomodoroSeconds(mode: PomodoroMode): number {
  if (mode === 'pomodoro') return 25 * 60;
  if (mode === 'shortBreak') return 5 * 60;
  return 15 * 60;
}

interface UsePomodoroTimerParams {
  subjects: Subject[];
  onCompleteSession: (session: Omit<StudySession, 'id'>) => Promise<void>;
}

export interface PomodoroTimerController {
  timerMode: PomodoroMode;
  secondsLeft: number;
  isActive: boolean;
  selectedSubjectId: string;
  timeFormatted: string;
  completionNotice: string | null;
  setSelectedSubjectId: (id: string) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  changeMode: (mode: PomodoroMode) => void;
  dismissCompletionNotice: () => void;
}

export function usePomodoroTimer({
  subjects,
  onCompleteSession,
}: UsePomodoroTimerParams): PomodoroTimerController {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [timerMode, setTimerMode] = useState<PomodoroMode>('pomodoro');
  const [secondsLeft, setSecondsLeft] = useState<number>(
    getInitialPomodoroSeconds('pomodoro')
  );
  const [isActive, setIsActive] = useState<boolean>(false);
  const [completionNotice, setCompletionNotice] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number | null>(null);

  const effectiveSubjectId = subjects.some((s) => s.id === selectedSubjectId)
    ? selectedSubjectId
    : (subjects[0]?.id ?? '');

  const handleTimerComplete = useCallback(() => {
    endTimeRef.current = null;
    setIsActive(false);

    const targetSubject =
      subjects.find((s) => s.id === effectiveSubjectId) || subjects[0];

    if (timerMode === 'pomodoro') {
      const subjectLabel = targetSubject?.name ?? 'Estudo Geral';
      setCompletionNotice(
        `⏰ Tempo esgotado! Sessão Pomodoro de 25 min (${subjectLabel}) registrada com sucesso.`
      );
      void onCompleteSession({
        subjectId: targetSubject?.id ?? '',
        subjectName: subjectLabel,
        durationMinutes: 25,
        date: getTodayISO(),
        timestamp: new Date().toISOString(),
        notes: 'Sessão Pomodoro concluída com sucesso',
      });
    } else {
      setCompletionNotice('⏰ Pausa concluída! Pronto para retomar o foco.');
    }
  }, [subjects, effectiveSubjectId, timerMode, onCompleteSession]);

  const handleTimerCompleteRef = useRef(handleTimerComplete);
  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete;
  });

  // Temporizador principal com cálculo baseado em timestamp real (previne drift e funciona entre trocas de abas)
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      if (!endTimeRef.current) return;
      const remaining = Math.max(
        0,
        Math.ceil((endTimeRef.current - Date.now()) / 1000)
      );
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        endTimeRef.current = null;
        setIsActive(false);
        handleTimerCompleteRef.current();
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive]);

  // Sincroniza o cronômetro com o relógio do sistema quando o app retorna do segundo plano
  useEffect(() => {
    const subscription = RNAppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && isActive && endTimeRef.current) {
        const remaining = Math.max(
          0,
          Math.ceil((endTimeRef.current - Date.now()) / 1000)
        );
        setSecondsLeft(remaining);

        if (remaining <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          endTimeRef.current = null;
          setIsActive(false);
          handleTimerCompleteRef.current();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isActive]);

  const toggleTimer = useCallback(() => {
    setCompletionNotice(null);
    if (isActive) {
      endTimeRef.current = null;
      setIsActive(false);
    } else {
      endTimeRef.current = Date.now() + secondsLeft * 1000;
      setIsActive(true);
    }
  }, [isActive, secondsLeft]);

  const resetTimer = useCallback(() => {
    endTimeRef.current = null;
    setIsActive(false);
    setCompletionNotice(null);
    setSecondsLeft(getInitialPomodoroSeconds(timerMode));
  }, [timerMode]);

  const changeMode = useCallback((mode: PomodoroMode) => {
    endTimeRef.current = null;
    setIsActive(false);
    setCompletionNotice(null);
    setTimerMode(mode);
    setSecondsLeft(getInitialPomodoroSeconds(mode));
  }, []);

  const dismissCompletionNotice = useCallback(() => {
    setCompletionNotice(null);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  return {
    timerMode,
    secondsLeft,
    isActive,
    selectedSubjectId: effectiveSubjectId,
    timeFormatted,
    completionNotice,
    setSelectedSubjectId,
    toggleTimer,
    resetTimer,
    changeMode,
    dismissCompletionNotice,
  };
}
