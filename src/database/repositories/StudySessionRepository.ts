import { getDatabase } from '../database';
import { StudySession } from '../../types';
import { StudySessionRow, mapStudySessionFromRow } from '../types';
import { logSQL } from '../logger';
import { generateId } from '../../utils/formatters';

export const StudySessionRepository = {
  async getAll(userId?: string): Promise<StudySession[]> {
    const db = await getDatabase();
    if (userId) {
      const sql = 'SELECT * FROM study_sessions WHERE user_id = ? ORDER BY timestamp DESC';
      logSQL('SELECT_USER_SESSIONS', sql, [userId]);
      const rows = await db.getAllAsync<StudySessionRow>(sql, [userId]);
      return rows.map(mapStudySessionFromRow);
    }

    const sql = 'SELECT * FROM study_sessions ORDER BY timestamp DESC';
    logSQL('SELECT_ALL_SESSIONS', sql);
    const rows = await db.getAllAsync<StudySessionRow>(sql);
    return rows.map(mapStudySessionFromRow);
  },

  async create(session: Omit<StudySession, 'id'>, userId?: string): Promise<StudySession> {
    const db = await getDatabase();
    const id = generateId('sess');
    const targetUserId = userId || session.userId;

    const newSession: StudySession = {
      ...session,
      id,
      userId: targetUserId,
    };

    const sql = `INSERT INTO study_sessions (id, user_id, subject_id, subject_name, duration_minutes, timestamp, date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      newSession.id,
      newSession.userId ?? null,
      newSession.subjectId || null,
      newSession.subjectName,
      newSession.durationMinutes,
      newSession.timestamp,
      newSession.date,
      newSession.notes ?? null,
    ];
    logSQL('INSERT_SESSION', sql, params);
    await db.runAsync(sql, params);

    return newSession;
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    const sql = 'DELETE FROM study_sessions WHERE id = ?';
    logSQL('DELETE_SESSION', sql, [id]);
    await db.runAsync(sql, [id]);
  },
};
