import { getDatabase } from '../database';
import { GradeItem } from '../../types';
import { GradeRow, mapGradeFromRow } from '../types';
import { logSQL } from '../logger';

export const GradeRepository = {
  async getAll(): Promise<GradeItem[]> {
    const db = await getDatabase();
    const sql = 'SELECT * FROM grades ORDER BY name ASC';
    logSQL('SELECT', sql);
    const rows = await db.getAllAsync<GradeRow>(sql);
    return rows.map(mapGradeFromRow);
  },

  async getBySubjectId(subjectId: string): Promise<GradeItem[]> {
    const db = await getDatabase();
    const sql = 'SELECT * FROM grades WHERE subject_id = ? ORDER BY name ASC';
    logSQL('SELECT_BY_SUBJECT', sql, [subjectId]);
    const rows = await db.getAllAsync<GradeRow>(sql, [subjectId]);
    return rows.map(mapGradeFromRow);
  },

  async create(grade: Omit<GradeItem, 'id'>): Promise<GradeItem> {
    const db = await getDatabase();
    const id = `gr-${Date.now()}`;
    const newGrade: GradeItem = {
      ...grade,
      id,
    };

    const sql = 'INSERT INTO grades (id, subject_id, name, grade, weight) VALUES (?, ?, ?, ?, ?)';
    const params = [newGrade.id, newGrade.subjectId, newGrade.name, newGrade.grade, newGrade.weight];
    logSQL('INSERT', sql, params);
    await db.runAsync(sql, params);

    return newGrade;
  },

  async update(grade: GradeItem): Promise<void> {
    const db = await getDatabase();
    const sql = 'UPDATE grades SET subject_id = ?, name = ?, grade = ?, weight = ? WHERE id = ?';
    const params = [grade.subjectId, grade.name, grade.grade, grade.weight, grade.id];
    logSQL('UPDATE', sql, params);
    await db.runAsync(sql, params);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    const sql = 'DELETE FROM grades WHERE id = ?';
    logSQL('DELETE', sql, [id]);
    await db.runAsync(sql, [id]);
  },
};
