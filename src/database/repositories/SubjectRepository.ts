import { getDatabase } from '../database';
import { Subject } from '../../types';
import { SubjectRow, mapSubjectFromRow } from '../types';
import { logSQL } from '../logger';

export const SubjectRepository = {
  async getAll(): Promise<Subject[]> {
    const db = await getDatabase();
    const sql = 'SELECT * FROM subjects ORDER BY name ASC';
    logSQL('SELECT', sql);
    const rows = await db.getAllAsync<SubjectRow>(sql);
    return rows.map(mapSubjectFromRow);
  },

  async getById(id: string): Promise<Subject | null> {
    const db = await getDatabase();
    const sql = 'SELECT * FROM subjects WHERE id = ?';
    logSQL('SELECT_ONE', sql, [id]);
    const row = await db.getFirstAsync<SubjectRow>(sql, [id]);
    return row ? mapSubjectFromRow(row) : null;
  },

  async create(subject: Omit<Subject, 'id'>): Promise<Subject> {
    const db = await getDatabase();
    const id = `sub-${Date.now()}`;
    const newSubject: Subject = {
      ...subject,
      id,
      targetGrade: subject.targetGrade ?? 7.0,
    };

    const sql = `INSERT INTO subjects (id, name, code, professor, professor_email, location, schedule, color, target_grade)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      newSubject.id,
      newSubject.name,
      newSubject.code,
      newSubject.professor,
      newSubject.professorEmail,
      newSubject.location,
      newSubject.schedule,
      newSubject.color,
      newSubject.targetGrade ?? 7.0,
    ];
    logSQL('INSERT', sql, params);
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
    logSQL('UPDATE', sql, params);
    await db.runAsync(sql, params);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    const sql = 'DELETE FROM subjects WHERE id = ?';
    logSQL('DELETE', sql, [id]);
    await db.runAsync(sql, [id]);
  },
};
