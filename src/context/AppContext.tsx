import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
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
import {
  calculateSubjectAverage,
  calculateNeededForFinalExam,
  calculateGlobalAverage,
  SubjectAverageResult,
} from '../utils/gradeCalculations';
import {
  usePomodoroTimer,
  PomodoroTimerController,
} from '../hooks/usePomodoroTimer';

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
  deleteStudySession: (id: string) => Promise<void>;
  pomodoro: PomodoroTimerController;

  // Métricas e Cálculos
  getSubjectAverage: (subjectId: string) => SubjectAverageResult;
  getGlobalAverage: () => number;
  calculateNeededGrade: (
    subjectId: string,
    finalExamWeight?: number,
    targetGrade?: number
  ) => number;
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

  const refreshAccounts = useCallback(async () => {
    try {
      const users = await UserRepository.getAll();
      setAvailableAccounts(users);
    } catch (error) {
      console.error('Erro ao listar contas do banco SQLite:', error);
    }
  }, []);

  const loadUserData = useCallback(async (userId: string) => {
    try {
      const [loadedSubjects, loadedTasks, loadedGrades, loadedSessions] =
        await Promise.all([
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
  }, []);

  // Inicializa o banco SQLite, executa migrações/limpeza e restaura sessão se houver
  useEffect(() => {
    async function load() {
      try {
        await initDatabase();
        const loadedUsers = await UserRepository.getAll();
        setAvailableAccounts(loadedUsers);

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
  }, [loadUserData]);

  // --- Autenticação e Gestão de Contas ---
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!email.trim() || !password) {
        return {
          success: false,
          error: 'Preencha o e-mail e a senha para entrar.',
        };
      }

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
        return {
          success: false,
          error: 'Insira um endereço de e-mail válido.',
        };
      }
      if (!data.password || data.password.length < 3) {
        return {
          success: false,
          error: 'A senha deve possuir pelo menos 3 caracteres.',
        };
      }

      const newUser = await UserRepository.create({
        name: data.name,
        email: data.email,
        password: data.password,
        course: data.course,
      });

      setCurrentUser(newUser);
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
      setSubjects((prev) =>
        prev.map((s) => (s.id === subject.id ? subject : s))
      );
    } catch (error) {
      console.error('Erro ao atualizar disciplina:', error);
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      await SubjectRepository.delete(id);
      // Sincroniza estado em memória com ON DELETE CASCADE (tasks, grades) e ON DELETE SET NULL (study_sessions)
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      setTasks((prev) => prev.filter((t) => t.subjectId !== id));
      setGrades((prev) => prev.filter((g) => g.subjectId !== id));
      setStudySessions((prev) =>
        prev.map((sess) =>
          sess.subjectId === id ? { ...sess, subjectId: '' } : sess
        )
      );
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error);
    }
  };

  // --- CRUD Tarefas ---
  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      const newTask = await TaskRepository.create(task);
      setTasks((prev) =>
        [...prev, newTask].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      );
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
    }
  };

  const updateTask = async (task: Task) => {
    try {
      await TaskRepository.update(task);
      setTasks((prev) =>
        prev
          .map((t) => (t.id === task.id ? task : t))
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      );
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

    const previousStatus = current.status;
    const nextIdx = (order.indexOf(previousStatus) + 1) % order.length;
    const nextStatus = order[nextIdx];

    // Atualização otimista com rollback em caso de falha no banco
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    try {
      await TaskRepository.toggleStatus(id);
    } catch (error) {
      console.error('Erro ao alternar status da tarefa no SQLite:', error);
      // Reverte atualização otimista se o SQLite falhar
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: previousStatus } : t))
      );
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
      setGrades((prev) =>
        prev.map((g) => (g.id === grade.id ? grade : g))
      );
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
  const addStudySession = useCallback(
    async (session: Omit<StudySession, 'id'>) => {
      try {
        const newSession = await StudySessionRepository.create(
          session,
          currentUser?.id
        );
        setStudySessions((prev) => [newSession, ...prev]);
      } catch (error) {
        console.error('Erro ao adicionar sessão de estudo:', error);
      }
    },
    [currentUser]
  );

  const deleteStudySession = useCallback(async (id: string) => {
    try {
      await StudySessionRepository.delete(id);
      setStudySessions((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Erro ao excluir sessão de estudo:', error);
    }
  }, []);

  // Cronômetro Pomodoro elevado ao contexto global para não perder estado ao trocar de aba
  const pomodoro = usePomodoroTimer({
    subjects,
    onCompleteSession: addStudySession,
  });

  // --- Cálculos e Simulador de Notas ---
  const getSubjectAverage = useCallback(
    (subjectId: string): SubjectAverageResult => {
      const subject = subjects.find((s) => s.id === subjectId);
      const target = subject?.targetGrade ?? 7.0;
      return calculateSubjectAverage(grades, subjectId, target);
    },
    [grades, subjects]
  );

  const getGlobalAverage = useCallback((): number => {
    return calculateGlobalAverage(subjects, grades);
  }, [subjects, grades]);

  const calculateNeededGrade = useCallback(
    (
      subjectId: string,
      finalExamWeight: number = 4.0,
      targetGrade: number = 7.0
    ): number => {
      return calculateNeededForFinalExam(
        grades,
        subjectId,
        finalExamWeight,
        targetGrade
      );
    },
    [grades]
  );

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
        deleteStudySession,
        pomodoro,
        getSubjectAverage,
        getGlobalAverage,
        calculateNeededGrade,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export const useAuth = () => {
  const { currentUser, availableAccounts, login, register, logout, refreshAccounts } =
    useContext(AppContext);
  return { currentUser, availableAccounts, login, register, logout, refreshAccounts };
};
