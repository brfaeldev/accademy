import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { CREATE_TABLES_SQL } from './schema';
import { seedDatabaseIfEmpty, clearAllTables } from './seed';
import { logSQL } from './logger';

const DATABASE_NAME = 'academy.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await dbInstance.execAsync('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
}

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await getDatabase();
  logSQL('INIT', 'Criando tabelas e índices relacionais...');
  await db.execAsync(CREATE_TABLES_SQL);
  await seedDatabaseIfEmpty(db);
  return db;
}

export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  logSQL('RESET', 'Limpando tabelas e recriando seed inicial...');
  await clearAllTables(db);
  await seedDatabaseIfEmpty(db);
}

/**
 * Exibe toda a estrutura DDL, colunas, chaves primárias e chaves estrangeiras
 */
export async function showDatabaseStructure(): Promise<void> {
  const db = await getDatabase();

  console.log('%c=================================================================', 'color: #4F46E5;');
  console.log('%c🏗️  ESTRUTURA RELACIONAL DO BANCO DE DADOS (SQLITE DDL & SCHEMA)', 'color: #4F46E5; font-size: 15px; font-weight: bold;');
  console.log('%c=================================================================', 'color: #4F46E5;');

  const tables = await db.getAllAsync<{ name: string; sql: string }>(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC;"
  );

  for (const t of tables) {
    console.log(`\n%c📁 TABELA: ${t.name}`, 'color: #0284C7; font-size: 14px; font-weight: bold;');
    
    // Detalhes das colunas: tipo, not null, pk
    const columns = await db.getAllAsync<{
      cid: number;
      name: string;
      type: string;
      notnull: number;
      dflt_value: string | null;
      pk: number;
    }>(`PRAGMA table_info(${t.name});`);
    console.table(columns);

    // Chaves Estrangeiras (Foreign Keys)
    const fks = await db.getAllAsync<{
      id: number;
      seq: number;
      table: string;
      from: string;
      to: string;
      on_update: string;
      on_delete: string;
    }>(`PRAGMA foreign_key_list(${t.name});`);

    if (fks && fks.length > 0) {
      console.log(`%c  🔗 Chaves Estrangeiras (Foreign Keys com ON DELETE CASCADE):`, 'color: #059669; font-weight: bold;');
      console.table(fks);
    }
  }

  // Índices criados
  const indexes = await db.getAllAsync<{ name: string; tbl_name: string }>(
    "SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%';"
  );
  if (indexes && indexes.length > 0) {
    console.log('\n%c⚡ ÍNDICES CRIADOS:', 'color: #7C3AED; font-weight: bold;');
    console.table(indexes);
  }
}

/**
 * Exibe os dados das tabelas
 */
export async function dumpDatabase(): Promise<void> {
  const db = await getDatabase();
  const subjects = await db.getAllAsync('SELECT * FROM subjects');
  const tasks = await db.getAllAsync('SELECT * FROM tasks');
  const grades = await db.getAllAsync('SELECT * FROM grades');
  const sessions = await db.getAllAsync('SELECT * FROM study_sessions');

  console.log('\n%c=== 🗄️ DADOS SALVOS NAS TABELAS ===', 'color: #4F46E5; font-size: 14px; font-weight: bold;');
  console.log('%c📚 TABELA: subjects', 'color: #0284C7; font-weight: bold;');
  console.table(subjects);
  console.log('%c📋 TABELA: tasks', 'color: #0284C7; font-weight: bold;');
  console.table(tasks);
  console.log('%c📊 TABELA: grades', 'color: #0284C7; font-weight: bold;');
  console.table(grades);
  console.log('%c⏱️ TABELA: study_sessions', 'color: #0284C7; font-weight: bold;');
  console.table(sessions);
}

/**
 * Faz download do arquivo físico academy.db no navegador
 */
export function downloadDatabaseFile(): void {
  if (Platform.OS !== 'web' || !dbInstance) {
    console.warn('O download só está disponível no navegador.');
    return;
  }
  try {
    const bytes = dbInstance.serializeSync();
    const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'academy.db';
    a.click();
    URL.revokeObjectURL(url);
    console.log('%c✅ Arquivo "academy.db" baixado com sucesso! Você pode abri-lo no DB Browser for SQLite ou em https://sqliteviewer.app', 'color: #059669; font-weight: bold;');
  } catch (e) {
    console.error('Erro ao exportar arquivo do banco:', e);
  }
}

// Expõe comandos globais no console do navegador (F12)
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const w = window as unknown as Record<string, unknown>;
  w.debugSQLite = async () => {
    await showDatabaseStructure();
    await dumpDatabase();
  };
  w.verEstrutura = showDatabaseStructure;
  w.verDados = dumpDatabase;
  w.baixarBanco = downloadDatabaseFile;
}
