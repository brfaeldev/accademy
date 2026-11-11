import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Subject, Task, GradeItem, StudySession, TaskStatus } from '../types';
import {
  initDatabase,
  resetDatabase,
  SubjectRepository,
  TaskRepository,
  GradeRepository,
  StudySessionRepository,
} from '../database';

interface AppContextData {
  subjects: Subject[];
  tasks: Task[];
  grades: GradeItem[];
  studySessions: StudySession[];
  isLoading: boolean;

  // Disciplinas (CRUD)
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  updateSubject: (subject: Subject) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  // Tarefas (CRUD)
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;

  // Notas e Avaliações (CRUD)
  addGrade: (grade: Omit<GradeItem, 'id'>) => Promise<void>;
  updateGrade: (grade: GradeItem) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;

  // Foco / Pomodoro
  addStudySession: (session: Omit<StudySession, 'id'>) => Promise<void>;

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

  // Inicializa o banco SQLite, executa migrações/seed e carrega dados
  useEffect(() => {
    async function load() {
      try {
        await initDatabase();
        const [loadedSubjects, loadedTasks, loadedGrades, loadedSessions] = await Promise.all([
          SubjectRepository.getAll(),
          TaskRepository.getAll(),
          GradeRepository.getAll(),
          StudySessionRepository.getAll(),
        ]);
        setSubjects(loadedSubjects);
        setTasks(loadedTasks);
        setGrades(loadedGrades);
        setStudySessions(loadedSessions);
      } catch (error) {
        console.error('Erro ao inicializar SQLite:', error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // --- CRUD Disciplinas ---
  const addSubject = async (subject: Omit<Subject, 'id'>) => {
    try {
      const newSubject = await SubjectRepository.create(subject);
      setSubjects((prev) => [newSubject, ...prev]);
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error);
    }
  };

  const updateSubject = async (subject: Subject) => {
    try {
      await SubjectRepository.update(subject);
      setSubjects((prev) => prev.map((s) => (s.id === subject.id ? subject : s)));
    } catch (error) {
      console.error('Erro ao atualizar disciplina:', error);
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      await SubjectRepository.delete(id);
      // Chaves estrangeiras ON DELETE CASCADE removem do SQLite, sincronizamos o estado React
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      setTasks((prev) => prev.filter((t) => t.subjectId !== id));
      setGrades((prev) => prev.filter((g) => g.subjectId !== id));
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error);
    }
  };

  // --- CRUD Tarefas ---
  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      const newTask = await TaskRepository.create(task);
      setTasks((prev) => [newTask, ...prev]);
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
    }
  };

  const updateTask = async (task: Task) => {
    try {
      await TaskRepository.update(task);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await TaskRepository.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
    }
  };

  const toggleTaskStatus = async (id: string) => {
    const order: TaskStatus[] = ['Pendente', 'Em Andamento', 'Concluído'];
    const current = tasks.find((t) => t.id === id);
    if (!current) return;

    const nextIdx = (order.indexOf(current.status) + 1) % order.length;
    const nextStatus = order[nextIdx];

    // Atualização otimista
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));

    try {
      await TaskRepository.toggleStatus(id);
    } catch (error) {
      console.error('Erro ao alternar status da tarefa no SQLite:', error);
    }
  };

  // --- CRUD Notas ---
  const addGrade = async (grade: Omit<GradeItem, 'id'>) => {
    try {
      const newGrade = await GradeRepository.create(grade);
      setGrades((prev) => [...prev, newGrade]);
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
    }
  };

  const updateGrade = async (grade: GradeItem) => {
    try {
      await GradeRepository.update(grade);
      setGrades((prev) => prev.map((g) => (g.id === grade.id ? grade : g)));
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
    }
  };

  const deleteGrade = async (id: string) => {
    try {
      await GradeRepository.delete(id);
      setGrades((prev) => prev.filter((g) => g.id !== id));
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
    }
  };

  // --- Sessões de Estudo ---
  const addStudySession = async (session: Omit<StudySession, 'id'>) => {
    try {
      const newSession = await StudySessionRepository.create(session);
      setStudySessions((prev) => [newSession, ...prev]);
    } catch (error) {
      console.error('Erro ao adicionar sessão de estudo:', error);
    }
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

    const requiredTotal = targetGrade * (totalWeight + finalExamWeight);
    const currentPoints = average * totalWeight;
    const needed = (requiredTotal - currentPoints) / finalExamWeight;

    return Math.max(0, Number(needed.toFixed(2)));
  };

  const resetAllData = async () => {
    try {
      setIsLoading(true);
      await resetDatabase();
      const [loadedSubjects, loadedTasks, loadedGrades, loadedSessions] = await Promise.all([
        SubjectRepository.getAll(),
        TaskRepository.getAll(),
        GradeRepository.getAll(),
        StudySessionRepository.getAll(),
      ]);
      setSubjects(loadedSubjects);
      setTasks(loadedTasks);
      setGrades(loadedGrades);
      setStudySessions(loadedSessions);
    } catch (error) {
      console.error('Erro ao resetar dados do SQLite:', error);
    } finally {
      setIsLoading(false);
    }
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
