import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Subject, Task, GradeItem, StudySession, AppState, TaskStatus } from '../types';
import { StorageService } from '../services/storage';

interface AppContextData {
  subjects: Subject[];
  tasks: Task[];
  grades: GradeItem[];
  studySessions: StudySession[];
  isLoading: boolean;

  // Disciplinas (CRUD)
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;

  // Tarefas (CRUD)
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;

  // Notas e Avaliações (CRUD)
  addGrade: (grade: Omit<GradeItem, 'id'>) => void;
  updateGrade: (grade: GradeItem) => void;
  deleteGrade: (id: string) => void;

  // Foco / Pomodoro
  addStudySession: (session: Omit<StudySession, 'id'>) => void;

  // Métricas e Cálculos
  getSubjectAverage: (subjectId: string) => { average: number; totalWeight: number; passing: boolean };
  calculateNeededGrade: (subjectId: string, finalExamWeight?: number, targetGrade?: number) => number;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextData>({} as AppContextData);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Carregar dados iniciais
  useEffect(() => {
    async function load() {
      try {
        const state = await StorageService.loadState();
        setSubjects(state.subjects);
        setTasks(state.tasks);
        setGrades(state.grades);
        setStudySessions(state.studySessions);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Salvar automaticamente sempre que houver alterações
  const persist = (nextState: Partial<AppState>) => {
    const fullState: AppState = {
      subjects: nextState.subjects ?? subjects,
      tasks: nextState.tasks ?? tasks,
      grades: nextState.grades ?? grades,
      studySessions: nextState.studySessions ?? studySessions,
    };
    StorageService.saveState(fullState);
  };

  // --- CRUD Disciplinas ---
  const addSubject = (subject: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subject,
      id: `sub-${Date.now()}`,
    };
    const updated = [newSubject, ...subjects];
    setSubjects(updated);
    persist({ subjects: updated });
  };

  const updateSubject = (subject: Subject) => {
    const updated = subjects.map((s) => (s.id === subject.id ? subject : s));
    setSubjects(updated);
    persist({ subjects: updated });
  };

  const deleteSubject = (id: string) => {
    const updatedSubjects = subjects.filter((s) => s.id !== id);
    const updatedTasks = tasks.filter((t) => t.subjectId !== id);
    const updatedGrades = grades.filter((g) => g.subjectId !== id);
    setSubjects(updatedSubjects);
    setTasks(updatedTasks);
    setGrades(updatedGrades);
    persist({ subjects: updatedSubjects, tasks: updatedTasks, grades: updatedGrades });
  };

  // --- CRUD Tarefas ---
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    persist({ tasks: updated });
  };

  const updateTask = (task: Task) => {
    const updated = tasks.map((t) => (t.id === task.id ? task : t));
    setTasks(updated);
    persist({ tasks: updated });
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    persist({ tasks: updated });
  };

  const toggleTaskStatus = (id: string) => {
    const order: TaskStatus[] = ['Pendente', 'Em Andamento', 'Concluído'];
    const updated = tasks.map((t) => {
      if (t.id !== id) return t;
      const nextIdx = (order.indexOf(t.status) + 1) % order.length;
      return { ...t, status: order[nextIdx] };
    });
    setTasks(updated);
    persist({ tasks: updated });
  };

  // --- CRUD Notas ---
  const addGrade = (grade: Omit<GradeItem, 'id'>) => {
    const newGrade: GradeItem = {
      ...grade,
      id: `gr-${Date.now()}`,
    };
    const updated = [...grades, newGrade];
    setGrades(updated);
    persist({ grades: updated });
  };

  const updateGrade = (grade: GradeItem) => {
    const updated = grades.map((g) => (g.id === grade.id ? grade : g));
    setGrades(updated);
    persist({ grades: updated });
  };

  const deleteGrade = (id: string) => {
    const updated = grades.filter((g) => g.id !== id);
    setGrades(updated);
    persist({ grades: updated });
  };

  // --- Sessões de Estudo ---
  const addStudySession = (session: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...session,
      id: `sess-${Date.now()}`,
    };
    const updated = [newSession, ...studySessions];
    setStudySessions(updated);
    persist({ studySessions: updated });
  };

  // --- Cálculos e Simulador de Notas ---
  const getSubjectAverage = (subjectId: string) => {
    const items = grades.filter((g) => g.subjectId === subjectId);
    if (items.length === 0) return { average: 0, totalWeight: 0, passing: false };

    const totalWeight = items.reduce((acc, curr) => acc + curr.weight, 0);
    const weightedSum = items.reduce((acc, curr) => acc + curr.grade * curr.weight, 0);
    const average = totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(2)) : 0;

    const subject = subjects.find((s) => s.id === subjectId);
    const target = subject?.targetGrade ?? 7.0;

    return {
      average,
      totalWeight,
      passing: average >= target,
    };
  };

  const calculateNeededGrade = (
    subjectId: string,
    finalExamWeight: number = 4.0,
    targetGrade: number = 7.0
  ): number => {
    const { average, totalWeight } = getSubjectAverage(subjectId);
    if (totalWeight === 0) return targetGrade;

    // Fórmula: (MédiaAtual * PesoAtual + NotaFinal * PesoFinal) / (PesoAtual + PesoFinal) >= Target
    // NotaFinal * PesoFinal >= Target * (PesoAtual + PesoFinal) - MédiaAtual * PesoAtual
    const requiredTotal = targetGrade * (totalWeight + finalExamWeight);
    const currentPoints = average * totalWeight;
    const needed = (requiredTotal - currentPoints) / finalExamWeight;

    return Math.max(0, Number(needed.toFixed(2)));
  };

  const resetAllData = async () => {
    const defaults = await StorageService.resetToDefaults();
    setSubjects(defaults.subjects);
    setTasks(defaults.tasks);
    setGrades(defaults.grades);
    setStudySessions(defaults.studySessions);
  };

  return (
    <AppContext.Provider
      value={{
        subjects,
        tasks,
        grades,
        studySessions,
        isLoading,
        addSubject,
        updateSubject,
        deleteSubject,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        addGrade,
        updateGrade,
        deleteGrade,
        addStudySession,
        getSubjectAverage,
        calculateNeededGrade,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
