import { getDatabase } from '../database';
import { Subject } from '../../types';
import { SubjectRow, mapSubjectFromRow } from '../types';
import { logSQL } from '../logger';
import { generateId } from '../../utils/formatters';

export const SubjectRepository = {
  async getAll(userId?: string): Promise<Subject[]> {
    const db = await getDatabase();
    if (userId) {
      const sql = 'SELECT * FROM subjects WHERE user_id = ? ORDER BY name ASC';
      logSQL('SELECT_USER_SUBJECTS', sql, [userId]);
      const rows = await db.getAllAsync<SubjectRow>(sql, [userId]);
      return rows.map(mapSubjectFromRow);
    }
    const sql = 'SELECT * FROM subjects ORDER BY name ASC';
    logSQL('SELECT_ALL_SUBJECTS', sql);
    const rows = await db.getAllAsync<SubjectRow>(sql);
    return rows.map(mapSubjectFromRow);
  },

  async create(subject: Omit<Subject, 'id'>, userId?: string): Promise<Subject> {
    const db = await getDatabase();
    const id = generateId('sub');
    const targetUserId = userId || subject.userId;

    const newSubject: Subject = {
      ...subject,
      id,
      userId: targetUserId,
      targetGrade: subject.targetGrade ?? 7.0,
    };

    const sql = `INSERT INTO subjects (id, user_id, name, code, professor, professor_email, location, schedule, color, target_grade)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      newSubject.id,
      newSubject.userId ?? null,
      newSubject.name,
      newSubject.code,
      newSubject.professor,
      newSubject.professorEmail,
      newSubject.location,
      newSubject.schedule,
      newSubject.color,
      newSubject.targetGrade ?? 7.0,
    ];
    logSQL('INSERT_SUBJECT', sql, params);
    await db.runAsync(sql, params);

    return newSubject;
  },

  async update(subject: Subject): Promise<void> {
    const db = await getDatabase();
    const sql = `UPDATE subjects 
       SET name = ?, code = ?, professor = ?, professor_email = ?, location = ?, schedule = ?, color = ?, target_grade = ?
       WHERE id = ?`;
    const params = [
      subject.name,
      subject.code,
      subject.professor,
      subject.professorEmail,
      subject.location,
      subject.schedule,
      subject.color,
      subject.targetGrade ?? 7.0,
      subject.id,
    ];
    logSQL('UPDATE_SUBJECT', sql, params);
    await db.runAsync(sql, params);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    const sql = 'DELETE FROM subjects WHERE id = ?';
    logSQL('DELETE_SUBJECT', sql, [id]);
    await db.runAsync(sql, [id]);
  },
};
