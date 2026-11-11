import { getDatabase } from '../database';
import { StudySession } from '../../types';
import { StudySessionRow, mapStudySessionFromRow } from '../types';
import { logSQL } from '../logger';

export const StudySessionRepository = {
  async getAll(): Promise<StudySession[]> {
    const db = await getDatabase();
    const sql = 'SELECT * FROM study_sessions ORDER BY timestamp DESC';
    logSQL('SELECT', sql);
    const rows = await db.getAllAsync<StudySessionRow>(sql);
    return rows.map(mapStudySessionFromRow);
  },

  async getBySubjectId(subjectId: string): Promise<StudySession[]> {
    const db = await getDatabase();
    const sql = 'SELECT * FROM study_sessions WHERE subject_id = ? ORDER BY timestamp DESC';
    logSQL('SELECT_BY_SUBJECT', sql, [subjectId]);
    const rows = await db.getAllAsync<StudySessionRow>(sql, [subjectId]);
    return rows.map(mapStudySessionFromRow);
  },

  async create(session: Omit<StudySession, 'id'>): Promise<StudySession> {
    const db = await getDatabase();
    const id = `sess-${Date.now()}`;
    const newSession: StudySession = {
      ...session,
      id,
    };

    const sql = `INSERT INTO study_sessions (id, subject_id, subject_name, duration_minutes, timestamp, date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      newSession.id,
      newSession.subjectId || null,
      newSession.subjectName,
      newSession.durationMinutes,
      newSession.timestamp,
      newSession.date,
      newSession.notes ?? null,
    ];
    logSQL('INSERT', sql, params);
    await db.runAsync(sql, params);

    return newSession;
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    const sql = 'DELETE FROM study_sessions WHERE id = ?';
    logSQL('DELETE', sql, [id]);
    await db.runAsync(sql, [id]);
  },
};
