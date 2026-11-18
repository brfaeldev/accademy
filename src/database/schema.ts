/**
 * Schemas DDL do SQLite (schema.ts)
 *
 * Contém os comandos SQL de criação das tabelas (users, subjects, tasks,
 * grades, study_sessions) com integridade referencial e índices relacionais.
 */

export const CREATE_TABLES_SQL = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    course TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    professor TEXT NOT NULL,
    professor_email TEXT NOT NULL,
    location TEXT NOT NULL,
    schedule TEXT NOT NULL,
    color TEXT NOT NULL,
    target_grade REAL DEFAULT 7.0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY NOT NULL,
    subject_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    due_date TEXT NOT NULL,
    weight REAL NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS grades (
    id TEXT PRIMARY KEY NOT NULL,
    subject_id TEXT NOT NULL,
    name TEXT NOT NULL,
    grade REAL NOT NULL,
    weight REAL NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS study_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT,
    subject_id TEXT,
    subject_name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
  );
`;

export const CREATE_INDEXES_SQL = `
  CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_subject_id ON tasks(subject_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
  CREATE INDEX IF NOT EXISTS idx_grades_subject_id ON grades(subject_id);
  CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(date);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

