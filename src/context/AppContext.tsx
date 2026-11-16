import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subject, Task, GradeItem, StudySession, TaskStatus, User } from '../types';
import {
  initDatabase,
  resetDatabase,
  SubjectRepository,
  TaskRepository,
  GradeRepository,
  StudySessionRepository,
  UserRepository,
} from '../database';

const AUTH_SESSION_KEY = '@academy_logged_user_id';

interface AppContextData {
  subjects: Subject[];
  tasks: Task[];
  grades: GradeItem[];
  studySessions: StudySession[];
  isLoading: boolean;

  // Autenticação e Usuários
  currentUser: User | null;
  availableAccounts: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    course?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAccounts: () => Promise<void>;

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableAccounts, setAvailableAccounts] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshAccounts = async () => {
    try {
      const users = await UserRepository.getAll();
      setAvailableAccounts(users);
    } catch (error) {
      console.error('Erro ao listar contas do banco SQLite:', error);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      const [loadedSubjects, loadedTasks, loadedGrades, loadedSessions] = await Promise.all([
        SubjectRepository.getAll(userId),
        TaskRepository.getAll(userId),
        GradeRepository.getAll(userId),
        StudySessionRepository.getAll(userId),
      ]);
      setSubjects(loadedSubjects);
      setTasks(loadedTasks);
      setGrades(loadedGrades);
      setStudySessions(loadedSessions);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  // Inicializa o banco SQLite, executa migrações/limpeza e restaura sessão se houver
  useEffect(() => {
    async function load() {
      try {
        await initDatabase();
        const loadedUsers = await UserRepository.getAll();
        setAvailableAccounts(loadedUsers);

        // Restaura a sessão do usuário caso exista no AsyncStorage
        try {
          const savedUserId = await AsyncStorage.getItem(AUTH_SESSION_KEY);
          if (savedUserId) {
            const user = await UserRepository.getById(savedUserId);
            if (user) {
              setCurrentUser(user);
              await loadUserData(user.id);
            } else {
              await AsyncStorage.removeItem(AUTH_SESSION_KEY);
              setSubjects([]);
              setTasks([]);
              setGrades([]);
              setStudySessions([]);
            }
          } else {
            setSubjects([]);
            setTasks([]);
            setGrades([]);
            setStudySessions([]);
          }
        } catch {
          setSubjects([]);
          setTasks([]);
          setGrades([]);
          setStudySessions([]);
        }
      } catch (error) {
        console.error('Erro ao inicializar SQLite:', error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // --- Autenticação e Gestão de Contas ---
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!email.trim() || !password) {
        return { success: false, error: 'Preencha o e-mail e a senha para entrar.' };
      }

      // Validação no banco de dados SQLite
      const user = await UserRepository.authenticate(email, password);
      setCurrentUser(user);
      await AsyncStorage.setItem(AUTH_SESSION_KEY, user.id);
      await loadUserData(user.id);
      await refreshAccounts();
      return { success: true };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return {
        success: false,
        error: error.message || 'Falha ao autenticar. Tente novamente.',
      };
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    course?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!data.name.trim()) {
        return { success: false, error: 'O nome completo é obrigatório.' };
      }
      if (!data.email.trim() || !data.email.includes('@')) {
        return { success: false, error: 'Insira um endereço de e-mail válido.' };
      }
      if (!data.password || data.password.length < 3) {
        return { success: false, error: 'A senha deve possuir pelo menos 3 caracteres.' };
      }

      // Criação da conta no SQLite
      const newUser = await UserRepository.create({
        name: data.name,
        email: data.email,
        password: data.password,
        course: data.course,
      });

      setCurrentUser(newUser);
      // Conta criada começa 100% limpa, sem nenhum mock ou dados imputados
      setSubjects([]);
      setTasks([]);
      setGrades([]);
      setStudySessions([]);
      await AsyncStorage.setItem(AUTH_SESSION_KEY, newUser.id);
      await refreshAccounts();
      return { success: true };
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      return {
        success: false,
        error: error.message || 'Falha ao criar conta. Tente novamente.',
      };
    }
  };

  const logout = async () => {
    try {
      setCurrentUser(null);
      setSubjects([]);
      setTasks([]);
      setGrades([]);
      setStudySessions([]);
      await AsyncStorage.removeItem(AUTH_SESSION_KEY);
      await refreshAccounts();
    } catch (error) {
      console.error('Erro ao sair da conta:', error);
    }
  };

  // --- CRUD Disciplinas ---
  const addSubject = async (subject: Omit<Subject, 'id'>) => {
    try {
      const newSubject = await SubjectRepository.create(subject, currentUser?.id);
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
      const newSession = await StudySessionRepository.create(session, currentUser?.id);
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
      setSubjects([]);
      setTasks([]);
      setGrades([]);
      setStudySessions([]);
      setAvailableAccounts([]);
      setCurrentUser(null);
      await AsyncStorage.removeItem(AUTH_SESSION_KEY);
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
        currentUser,
        availableAccounts,
        login,
        register,
        logout,
        refreshAccounts,
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
