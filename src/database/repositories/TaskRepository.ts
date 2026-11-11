import { getDatabase } from '../database';
import { Task, TaskStatus } from '../../types';
import { TaskRow, mapTaskFromRow } from '../types';
import { logSQL } from '../logger';

export const TaskRepository = {
  async getAll(): Promise<Task[]> {
    const db = await getDatabase();
    const sql = 'SELECT * FROM tasks ORDER BY due_date ASC';
    logSQL('SELECT', sql);
    const rows = await db.getAllAsync<TaskRow>(sql);
    return rows.map(mapTaskFromRow);
  },

  async getBySubjectId(subjectId: string): Promise<Task[]> {
    const db = await getDatabase();
    const sql = 'SELECT * FROM tasks WHERE subject_id = ? ORDER BY due_date ASC';
    logSQL('SELECT_BY_SUBJECT', sql, [subjectId]);
    const rows = await db.getAllAsync<TaskRow>(sql, [subjectId]);
    return rows.map(mapTaskFromRow);
  },

  async getById(id: string): Promise<Task | null> {
    const db = await getDatabase();
    const sql = 'SELECT * FROM tasks WHERE id = ?';
    logSQL('SELECT_ONE', sql, [id]);
    const row = await db.getFirstAsync<TaskRow>(sql, [id]);
    return row ? mapTaskFromRow(row) : null;
  },

  async create(task: Omit<Task, 'id'>): Promise<Task> {
    const db = await getDatabase();
    const id = `task-${Date.now()}`;
    const newTask: Task = {
      ...task,
      id,
    };

    const sql = `INSERT INTO tasks (id, subject_id, title, description, type, due_date, weight, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      newTask.id,
      newTask.subjectId,
      newTask.title,
      newTask.description ?? null,
      newTask.type,
      newTask.dueDate,
      newTask.weight,
      newTask.status,
    ];
    logSQL('INSERT', sql, params);
    await db.runAsync(sql, params);

    return newTask;
  },

  async update(task: Task): Promise<void> {
    const db = await getDatabase();
    const sql = `UPDATE tasks
       SET subject_id = ?, title = ?, description = ?, type = ?, due_date = ?, weight = ?, status = ?
       WHERE id = ?`;
    const params = [
      task.subjectId,
      task.title,
      task.description ?? null,
      task.type,
      task.dueDate,
      task.weight,
      task.status,
      task.id,
    ];
    logSQL('UPDATE', sql, params);
    await db.runAsync(sql, params);
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    const sql = 'DELETE FROM tasks WHERE id = ?';
    logSQL('DELETE', sql, [id]);
    await db.runAsync(sql, [id]);
  },

  async toggleStatus(id: string): Promise<TaskStatus | null> {
    const db = await getDatabase();
    const current = await this.getById(id);
    if (!current) return null;

    const order: TaskStatus[] = ['Pendente', 'Em Andamento', 'Concluído'];
    const nextIdx = (order.indexOf(current.status) + 1) % order.length;
    const nextStatus = order[nextIdx];

    const sql = 'UPDATE tasks SET status = ? WHERE id = ?';
    logSQL('UPDATE_STATUS', sql, [nextStatus, id]);
    await db.runAsync(sql, [nextStatus, id]);

    return nextStatus;
  },
};
