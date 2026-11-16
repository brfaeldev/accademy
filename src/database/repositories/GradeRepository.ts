import { getDatabase } from '../database';
import { GradeItem } from '../../types';
import { GradeRow, mapGradeFromRow } from '../types';
import { logSQL } from '../logger';
import { generateId } from '../../utils/formatters';

export const GradeRepository = {
  async getAll(userId?: string): Promise<GradeItem[]> {
    const db = await getDatabase();
    if (userId) {
      const sql = `SELECT g.* FROM grades g
        INNER JOIN subjects s ON g.subject_id = s.id
        WHERE s.user_id = ?
        ORDER BY g.name ASC`;
      logSQL('SELECT_USER_GRADES', sql, [userId]);
      const rows = await db.getAllAsync<GradeRow>(sql, [userId]);
      return rows.map(mapGradeFromRow);
    }

    const sql = 'SELECT * FROM grades ORDER BY name ASC';
    logSQL('SELECT_ALL_GRADES', sql);
    const rows = await db.getAllAsync<GradeRow>(sql);
    return rows.map(mapGradeFromRow);
  },

  async create(grade: Omit<GradeItem, 'id'>): Promise<GradeItem> {
    const db = await getDatabase();
    const id = generateId('gr');
    const newGrade: GradeItem = {
      ...grade,
      id,
    };

    const sql = 'INSERT INTO grades (id, subject_id, name, grade, weight) VALUES (?, ?, ?, ?, ?)';
    const params = [newGrade.id, newGrade.subjectId, newGrade.name, newGrade.grade, newGrade.weight];
    logSQL('INSERT_GRADE', sql, params);
    await db.runAsync(sql, params);

    return newGrade;
  },

  async update(grade: GradeItem): Promise<void> {
    const db = await getDatabase();
    const sql = 'UPDATE grades SET subject_id = ?, name = ?, grade = ?, weight = ? WHERE id = ?';
    const params = [grade.subjectId, grade.name, grade.grade, grade.weight, grade.id];
    logSQL('UPDATE_GRADE', sql, params);
    await db.runAsync(sql, params);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    const sql = 'DELETE FROM grades WHERE id = ?';
    logSQL('DELETE_GRADE', sql, [id]);
    await db.runAsync(sql, [id]);
  },
};
