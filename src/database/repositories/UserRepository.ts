import { getDatabase } from '../database';
import { User } from '../../types';
import { UserRow, mapUserFromRow } from '../types';
import { logSQL } from '../logger';
import { generateId } from '../../utils/formatters';
import { hashPassword, verifyPassword, isPasswordHashed } from '../../utils/crypto';

export const UserRepository = {
  /**
   * Retorna todas as contas cadastradas no banco de dados (omitindo o campo de senha por segurança)
   */
  async getAll(): Promise<User[]> {
    const db = await getDatabase();
    const sql = 'SELECT id, name, email, course, created_at FROM users ORDER BY name ASC';
    logSQL('SELECT_USERS', sql);
    const rows = await db.getAllAsync<UserRow>(sql);
    return rows.map(mapUserFromRow);
  },

  /**
   * Busca um usuário pelo ID (omitindo o campo de senha)
   */
  async getById(id: string): Promise<User | null> {
    const db = await getDatabase();
    const sql = 'SELECT id, name, email, course, created_at FROM users WHERE id = ?';
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
    const sql = 'SELECT id, name, email, course, created_at FROM users WHERE LOWER(email) = ?';
    logSQL('SELECT_USER_BY_EMAIL', sql, [cleanEmail]);
    const row = await db.getFirstAsync<UserRow>(sql, [cleanEmail]);
    return row ? mapUserFromRow(row) : null;
  },

  /**
   * Cria uma nova conta no banco de dados SQLite aplicando hash SHA-256 na senha
   */
  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const db = await getDatabase();
    const cleanEmail = user.email.trim().toLowerCase();

    // Valida se já existe uma conta cadastrada com este e-mail
    const existing = await this.getByEmail(cleanEmail);
    if (existing) {
      throw new Error('Já existe uma conta cadastrada com este e-mail no banco de dados.');
    }

    const id = generateId('user');
    const createdAt = new Date().toISOString();
    const passwordHash = hashPassword(user.password ?? '');

    const newUser: User = {
      id,
      name: user.name.trim(),
      email: cleanEmail,
      course: user.course?.trim() || undefined,
      createdAt,
    };

    const sql = `INSERT INTO users (id, name, email, password, course, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [
      newUser.id,
      newUser.name,
      newUser.email,
      passwordHash,
      newUser.course ?? null,
      newUser.createdAt,
    ];

    logSQL('INSERT_USER', sql, [
      newUser.id,
      newUser.name,
      newUser.email,
      '[SHA256_HASH]',
      newUser.course,
      newUser.createdAt,
    ]);
    await db.runAsync(sql, params);

    return newUser;
  },

  /**
   * Valida credenciais buscando contas existentes no banco de dados SQLite.
   * Verifica o hash da senha (e migra senhas antigas em texto puro automaticamente para SHA-256).
   */
  async authenticate(email: string, password: string): Promise<User> {
    const db = await getDatabase();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Busca a conta existente no banco de dados
    const sql = 'SELECT * FROM users WHERE LOWER(email) = ?';
    logSQL('AUTH_VERIFY_USER', sql, [cleanEmail]);
    const row = await db.getFirstAsync<UserRow>(sql, [cleanEmail]);

    if (!row) {
      throw new Error(
        'Conta não encontrada no banco de dados! Apenas contas previamente cadastradas podem efetuar login.'
      );
    }

    const storedPassword = row.password ?? '';

    // 2. Valida a senha informada (suporta SHA-256 e contas legadas)
    if (!verifyPassword(password, storedPassword)) {
      throw new Error('Senha incorreta! Verifique os dados e tente novamente.');
    }

    // 3. Caso a senha antiga estivesse em texto puro, migra automaticamente para hash SHA-256
    if (storedPassword && !isPasswordHashed(storedPassword)) {
      const upgradedHash = hashPassword(password);
      await db.runAsync('UPDATE users SET password = ? WHERE id = ?', [upgradedHash, row.id]);
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
