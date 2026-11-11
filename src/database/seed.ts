import { SQLiteDatabase } from 'expo-sqlite';
import { initialSubjects, initialTasks, initialGrades, initialStudySessions } from '../services/mockData';

export async function seedDatabaseIfEmpty(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM subjects'
  );

  if (result && result.count > 0) {
    return; // Banco já possui registros
  }

  await db.withTransactionAsync(async () => {
    // 1. Disciplinas
    for (const sub of initialSubjects) {
      await db.runAsync(
        `INSERT INTO subjects (id, name, code, professor, professor_email, location, schedule, color, target_grade)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sub.id,
          sub.name,
          sub.code,
          sub.professor,
          sub.professorEmail,
          sub.location,
          sub.schedule,
          sub.color,
          sub.targetGrade ?? 7.0,
        ]
      );
    }

    // 2. Tarefas
    for (const task of initialTasks) {
      await db.runAsync(
        `INSERT INTO tasks (id, subject_id, title, description, type, due_date, weight, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task.id,
          task.subjectId,
          task.title,
          task.description ?? null,
          task.type,
          task.dueDate,
          task.weight,
          task.status,
        ]
      );
    }

    // 3. Notas
    for (const grade of initialGrades) {
      await db.runAsync(
        `INSERT INTO grades (id, subject_id, name, grade, weight)
         VALUES (?, ?, ?, ?, ?)`,
        [grade.id, grade.subjectId, grade.name, grade.grade, grade.weight]
      );
    }

    // 4. Sessões de Estudo Pomodoro
    for (const session of initialStudySessions) {
      await db.runAsync(
        `INSERT INTO study_sessions (id, subject_id, subject_name, duration_minutes, timestamp, date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          session.id,
          session.subjectId || null,
          session.subjectName,
          session.durationMinutes,
          session.timestamp,
          session.date,
          session.notes ?? null,
        ]
      );
    }
  });
}

export async function clearAllTables(db: SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      DELETE FROM study_sessions;
      DELETE FROM grades;
      DELETE FROM tasks;
      DELETE FROM subjects;
    `);
  });
}

