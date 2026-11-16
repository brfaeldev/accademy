import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { CREATE_TABLES_SQL, CREATE_INDEXES_SQL } from './schema';
import { seedDatabaseIfEmpty, clearAllTables } from './seed';
import { logSQL } from './logger';

const DATABASE_NAME = 'academy.db';

// Cache global no globalThis para evitar múltiplas aberturas e conflitos de VFS durante Hot Reload (HMR)
const g = globalThis as unknown as {
  __academy_sqlite_instance__?: SQLite.SQLiteDatabase | null;
  __academy_sqlite_promise__?: Promise<SQLite.SQLiteDatabase> | null;
  __academy_sqlite_init_promise__?: Promise<SQLite.SQLiteDatabase> | null;
};

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (g.__academy_sqlite_instance__) {
    return g.__academy_sqlite_instance__;
  }

  if (g.__academy_sqlite_promise__) {
    return await g.__academy_sqlite_promise__;
  }

  g.__academy_sqlite_promise__ = (async () => {
    let db: SQLite.SQLiteDatabase;
    try {
      db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await db.execAsync('PRAGMA foreign_keys = ON;');
    } catch (err: any) {
      const msg = err?.message || String(err);
      const isLockError =
        msg.includes('createSyncAccessHandle') ||
        msg.includes('Access Handles') ||
        msg.includes('Invalid VFS state');

      if (isLockError && Platform.OS === 'web') {
        console.warn(
          '⚠️ SQLite OPFS bloqueado por outra aba aberta ou Hot Reload. Utilizando modo em memória temporário para manter o sistema operacional sem travar.'
        );
        // Fallback para memória em caso de bloqueio exclusivo de OPFS do navegador
        db = await SQLite.openDatabaseAsync(':memory:');
        await db.execAsync('PRAGMA foreign_keys = ON;');
      } else {
        throw err;
      }
    }
    g.__academy_sqlite_instance__ = db;
    return db;
  })();

  try {
    const db = await g.__academy_sqlite_promise__;
    return db;
  } catch (e) {
    g.__academy_sqlite_promise__ = null;
    throw e;
  }
}

async function ensureColumnExists(
  db: SQLite.SQLiteDatabase,
  tableName: string,
  columnName: string,
  columnDef: string
): Promise<void> {
  try {
    const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName});`);
    const exists = columns.some((c) => c.name.toLowerCase() === columnName.toLowerCase());
    if (!exists) {
      await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef};`);
      logSQL('MIGRATION', `Coluna "${columnName}" adicionada com sucesso à tabela "${tableName}".`);
    }
  } catch {
    try {
      await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef};`);
    } catch {
      // Coluna já existe ou tabela inexistente
    }
  }
}

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (g.__academy_sqlite_init_promise__) {
    return await g.__academy_sqlite_init_promise__;
  }

  g.__academy_sqlite_init_promise__ = (async () => {
    const db = await getDatabase();
    logSQL('INIT', 'Criando tabelas e índices relacionais...');

    // 1. Cria as tabelas se ainda não existirem
    await db.execAsync(CREATE_TABLES_SQL);

    // 2. Executa migrações seguras de colunas para bancos já criados anteriormente
    await ensureColumnExists(db, 'users', 'course', 'TEXT');
    await ensureColumnExists(db, 'subjects', 'user_id', 'TEXT');
    await ensureColumnExists(db, 'subjects', 'target_grade', 'REAL DEFAULT 7.0');
    await ensureColumnExists(db, 'study_sessions', 'user_id', 'TEXT');

    // 3. Cria os índices relacionais após garantir que as colunas existem
    try {
      await db.execAsync(CREATE_INDEXES_SQL);
    } catch (indexError) {
      console.warn('Aviso ao criar índices relacionais:', indexError);
    }

    // 4. Remove resquícios de dados mock hardcoded de execuções anteriores
    try {
      await db.runAsync("DELETE FROM tasks WHERE id IN ('task-1', 'task-2', 'task-3', 'task-4', 'task-5')");
      await db.runAsync("DELETE FROM grades WHERE id IN ('grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6', 'grade-7')");
      await db.runAsync("DELETE FROM study_sessions WHERE id IN ('session-1', 'session-2', 'session-3', 'session-4') OR user_id IS NULL");
      await db.runAsync("DELETE FROM subjects WHERE id IN ('sub-1', 'sub-2', 'sub-3', 'sub-4') OR user_id IS NULL");
      await db.runAsync("DELETE FROM users WHERE id IN ('user-1', 'user-2')");
    } catch (e) {
      console.warn('Limpeza de dados legados do mock:', e);
    }

    return db;
  })();

  try {
    const db = await g.__academy_sqlite_init_promise__;
    return db;
  } catch (e) {
    g.__academy_sqlite_init_promise__ = null;
    throw e;
  }
}

export async function resetDatabase(): Promise<void> {
  g.__academy_sqlite_init_promise__ = null;
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
  const users = await db.getAllAsync('SELECT id, name, email, course, created_at FROM users');
  const subjects = await db.getAllAsync('SELECT * FROM subjects');
  const tasks = await db.getAllAsync('SELECT * FROM tasks');
  const grades = await db.getAllAsync('SELECT * FROM grades');
  const sessions = await db.getAllAsync('SELECT * FROM study_sessions');

  console.log('\n%c=== 🗄️ DADOS SALVOS NAS TABELAS ===', 'color: #4F46E5; font-size: 14px; font-weight: bold;');
  console.log('%c👤 TABELA: users (Contas cadastradas)', 'color: #0284C7; font-weight: bold;');
  console.table(users);
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
  const db = g.__academy_sqlite_instance__;
  if (Platform.OS !== 'web' || !db) {
    console.warn('O download só está disponível no navegador e com banco aberto.');
    return;
  }
  try {
    const bytes = db.serializeSync();
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

// Expõe comandos globais no console do navegador (F12) apenas em ambiente de desenvolvimento
if (
  (typeof __DEV__ === 'undefined' || __DEV__) &&
  Platform.OS === 'web' &&
  typeof window !== 'undefined'
) {
  const w = window as unknown as Record<string, unknown>;
  w.debugSQLite = async () => {
    await showDatabaseStructure();
    await dumpDatabase();
  };
  w.verEstrutura = showDatabaseStructure;
  w.verDados = dumpDatabase;
  w.baixarBanco = downloadDatabaseFile;
  w.resetarOPFS = async () => {
    try {
      if ('storage' in navigator && navigator.storage.getDirectory) {
        const root = await navigator.storage.getDirectory();
        await root.removeEntry('expo-sqlite', { recursive: true });
        console.log('✅ Armazenamento OPFS do SQLite resetado com sucesso! Recarregue a página (F5).');
      }
    } catch (e) {
      console.error('Erro ao resetar OPFS:', e);
    }
  };
}
