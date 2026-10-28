export type TaskStatus = 'Pendente' | 'Em Andamento' | 'Concluído';

export type TaskType = 'Prova' | 'Trabalho' | 'Lista' | 'Seminário' | 'Outro';

export interface Subject {
  id: string;
  name: string;
  code: string;
  professor: string;
  professorEmail: string;
  location: string; // ex: "Bloco B - Sala 204" ou "Google Meet"
  schedule: string; // ex: "Segundas e Quartas 19h10 - 20h50"
  color: string;
  targetGrade?: number; // padrão 7.0
}

export interface Task {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  type: TaskType;
  dueDate: string; // YYYY-MM-DD
  weight: number; // Peso na média (ex: 2.0, 3.0 ou porcentagem)
  status: TaskStatus;
}

export interface GradeItem {
  id: string;
  subjectId: string;
  name: string; // ex: "P1", "Trabalho 1", "P2"
  grade: number; // 0 a 10
  weight: number; // peso
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  durationMinutes: number; // tempo dedicado
  timestamp: string; // ISO date
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface AppState {
  subjects: Subject[];
  tasks: Task[];
  grades: GradeItem[];
  studySessions: StudySession[];
}
