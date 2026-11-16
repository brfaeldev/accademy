import { SQLiteDatabase } from 'expo-sqlite';

/**
 * Utilitário transacional para limpeza completa das tabelas do banco de dados SQLite.
 */
export async function clearAllTables(db: SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      DELETE FROM study_sessions;
      DELETE FROM grades;
      DELETE FROM tasks;
      DELETE FROM subjects;
      DELETE FROM users;
    `);
  });
}

