/**
 * Definições de Tipos e Contratos (types/index.ts)
 *
 * Reúne todas as interfaces e tipos centrais da aplicação: entidades acadêmicas
 * (Subject, Task, GradeItem, StudySession, User) e enums de status e tipos.
 */

export type TaskStatus = 'Pendente' | 'Em Andamento' | 'Concluído';

export type TaskType = 'Prova' | 'Trabalho' | 'Lista' | 'Seminário' | 'Outro';

export interface Subject {
  id: string;
  userId?: string;
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
  dueDate: string; // Data de entrega no formato AAAA-MM-DD
  weight: number; // Peso na média (ex: 2.0, 3.0 ou porcentagem)
  status: TaskStatus;
}

export interface GradeItem {
  id: string;
  subjectId: string;
  name: string; // ex: "P1", "Trabalho 1", "P2"
  grade: number; // Nota de 0 a 10
  weight: number; // Peso da avaliação
}

export interface StudySession {
  id: string;
  userId?: string;
  subjectId: string;
  subjectName: string;
  durationMinutes: number; // Tempo dedicado em minutos
  timestamp: string; // Data e hora no formato ISO
  date: string; // Data no formato AAAA-MM-DD
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  course?: string;
  createdAt: string; // Data de criação no formato ISO
}

