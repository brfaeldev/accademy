/**
 * Logger de Queries SQL (logger.ts)
 *
 * Registra no console de desenvolvimento as instruções SQL executadas,
 * facilitando a auditoria de queries e depuração das operações no banco.
 */

import { Platform } from 'react-native';

export function logSQL(action: string, sql: string, params?: unknown[]) {
  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    return;
  }

  const cleanSql = sql.replace(/\s+/g, ' ').trim();

  if (Platform.OS === 'web') {
    console.log(
      `%c[SQLITE 🗄️] %c${action}%c ${cleanSql}`,
      'color: #4F46E5; font-weight: bold;',
      'color: #059669; font-weight: bold;',
      'color: #374151;',
      params && params.length > 0 ? { params } : ''
    );
  } else {
    console.log(`[SQLITE] [${action}] ${cleanSql}`, params ? JSON.stringify(params) : '');
  }
}
