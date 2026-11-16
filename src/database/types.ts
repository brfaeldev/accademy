import { Subject, Task, GradeItem, StudySession, User } from '../types';

export interface SubjectRow {
  id: string;
  user_id: string | null;
  name: string;
  code: string;
  professor: string;
  professor_email: string;
  location: string;
  schedule: string;
  color: string;
  target_grade: number;
}

export interface TaskRow {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  type: string;
  due_date: string;
  weight: number;
  status: string;
}

export interface GradeRow {
  id: string;
  subject_id: string;
  name: string;
  grade: number;
  weight: number;
}

export interface StudySessionRow {
  id: string;
  user_id: string | null;
  subject_id: string | null;
  subject_name: string;
  duration_minutes: number;
  timestamp: string;
  date: string;
  notes: string | null;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password?: string;
  course: string | null;
  created_at: string;
}

export function mapSubjectFromRow(row: SubjectRow): Subject {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    name: row.name,
    code: row.code,
    professor: row.professor,
    professorEmail: row.professor_email,
    location: row.location,
    schedule: row.schedule,
    color: row.color,
    targetGrade: row.target_grade ?? 7.0,
  };
}

export function mapTaskFromRow(row: TaskRow): Task {
  return {
    id: row.id,
    subjectId: row.subject_id,
    title: row.title,
    description: row.description ?? undefined,
    type: row.type as Task['type'],
    dueDate: row.due_date,
    weight: row.weight,
    status: row.status as Task['status'],
  };
}

export function mapGradeFromRow(row: GradeRow): GradeItem {
  return {
    id: row.id,
    subjectId: row.subject_id,
    name: row.name,
    grade: row.grade,
    weight: row.weight,
  };
}

export function mapStudySessionFromRow(row: StudySessionRow): StudySession {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    subjectId: row.subject_id ?? '',
    subjectName: row.subject_name,
    durationMinutes: row.duration_minutes,
    timestamp: row.timestamp,
    date: row.date,
    notes: row.notes ?? undefined,
  };
}

export function mapUserFromRow(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    course: row.course ?? undefined,
    createdAt: row.created_at,
  };
}

