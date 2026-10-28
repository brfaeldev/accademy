import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from '../types';
import { initialSubjects, initialTasks, initialGrades, initialStudySessions } from './mockData';

const STORAGE_KEY = '@academy_controle_estudos_state_v1';

let memoryCache: AppState = {
  subjects: initialSubjects,
  tasks: initialTasks,
  grades: initialGrades,
  studySessions: initialStudySessions,
};

export const StorageService = {
  async loadState(): Promise<AppState> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        memoryCache = {
          subjects: parsed.subjects ?? initialSubjects,
          tasks: parsed.tasks ?? initialTasks,
          grades: parsed.grades ?? initialGrades,
          studySessions: parsed.studySessions ?? initialStudySessions,
        };
        return memoryCache;
      }
    } catch {
      // Fallback em memória caso ocorra erro
    }
    return memoryCache;
  },

  async saveState(state: AppState): Promise<void> {
    memoryCache = state;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Mantém em memória se falhar
    }
  },

  async resetToDefaults(): Promise<AppState> {
    memoryCache = {
      subjects: initialSubjects,
      tasks: initialTasks,
      grades: initialGrades,
      studySessions: initialStudySessions,
    };
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignora erro
    }
    return memoryCache;
  },
};
