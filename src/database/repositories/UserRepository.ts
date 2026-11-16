import { getDatabase } from '../database';
import { User } from '../../types';
import { UserRow, mapUserFromRow } from '../types';
import { logSQL } from '../logger';

export const UserRepository = {
  /**
   * Retorna todas as contas cadastradas no banco de dados
   */
  async getAll(): Promise<User[]> {
    const db = await getDatabase();
    const sql = 'SELECT * FROM users ORDER BY name ASC';
    logSQL('SELECT_USERS', sql);
    const rows = await db.getAllAsync<UserRow>(sql);
    return rows.map(mapUserFromRow);
  },

  /**
   * Busca um usuário pelo ID
   */
  async getById(id: string): Promise<User | null> {
    const db = await getDatabase();
    const sql = 'SELECT * FROM users WHERE id = ?';
    logSQL('SELECT_USER_BY_ID', sql, [id]);
    const row = await db.getFirstAsync<UserRow>(sql, [id]);
    return row ? mapUserFromRow(row) : null;
  },

  /**
   * Busca um usuário pelo e-mail no banco de dados
   */
  async getByEmail(email: string): Promise<User | null> {
    const db = await getDatabase();
    const cleanEmail = email.trim().toLowerCase();
    const sql = 'SELECT * FROM users WHERE LOWER(email) = ?';
    logSQL('SELECT_USER_BY_EMAIL', sql, [cleanEmail]);
    const row = await db.getFirstAsync<UserRow>(sql, [cleanEmail]);
    return row ? mapUserFromRow(row) : null;
  },

  /**
   * Cria uma nova conta no banco de dados SQLite
   */
  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const db = await getDatabase();
    const cleanEmail = user.email.trim().toLowerCase();

    // Valida se já existe uma conta cadastrada com este e-mail
    const existing = await this.getByEmail(cleanEmail);
    if (existing) {
      throw new Error('Já existe uma conta cadastrada com este e-mail no banco de dados.');
    }

    const id = `user-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const newUser: User = {
      id,
      name: user.name.trim(),
      email: cleanEmail,
      password: user.password,
      course: user.course?.trim() || undefined,
      createdAt,
    };

    const sql = `INSERT INTO users (id, name, email, password, course, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [
      newUser.id,
      newUser.name,
      newUser.email,
      newUser.password ?? '',
      newUser.course ?? null,
      newUser.createdAt,
    ];

    logSQL('INSERT_USER', sql, [newUser.id, newUser.name, newUser.email, '***', newUser.course, newUser.createdAt]);
    await db.runAsync(sql, params);

    return newUser;
  },

  /**
   * Valida credenciais buscando contas existentes no banco de dados SQLite.
   * Permite login SOMENTE se a conta existir no banco e a senha conferir.
   */
  async authenticate(email: string, password: string): Promise<User> {
    const db = await getDatabase();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Busca a conta existente no banco de dados
    const sql = 'SELECT * FROM users WHERE LOWER(email) = ?';
    logSQL('AUTH_VERIFY_USER', sql, [cleanEmail]);
    const row = await db.getFirstAsync<UserRow>(sql, [cleanEmail]);

    if (!row) {
      throw new Error('Conta não encontrada no banco de dados! Apenas contas previamente cadastradas podem efetuar login.');
    }

    // 2. Valida a senha informada
    if (row.password !== password) {
      throw new Error('Senha incorreta! Verifique os dados e tente novamente.');
    }

    return mapUserFromRow(row);
  },

  /**
   * Retorna a quantidade total de usuários cadastrados
   */
  async count(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM users');
    return result?.count ?? 0;
  },
};

