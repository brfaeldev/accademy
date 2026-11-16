import { SQLiteDatabase } from 'expo-sqlite';

/**
 * Inicialização do banco de dados sem mock data hardcoded.
 * O aplicativo inicia limpo, permitindo que cada usuário cadastre suas próprias informações.
 */
export async function seedUsersIfEmpty(_db: SQLiteDatabase): Promise<void> {
  // Nenhum usuário hardcoded de partida
}

export async function seedDatabaseIfEmpty(_db: SQLiteDatabase): Promise<void> {
  // Nenhum registro mock (matérias, tarefas, notas, sessões) é imputado automaticamente
}

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
