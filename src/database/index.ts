/**
 * Ponto de Exportação da Camada de Banco de Dados (Barrel File)
 *
 * Centraliza e reexporta os módulos de conexão, schemas DDL, tipos de linhas
 * (rows) e todos os repositórios de acesso a dados da aplicação.
 */

export * from './database';
export * from './schema';
export * from './types';
export * from './seed';
export * from './repositories/SubjectRepository';
export * from './repositories/TaskRepository';
export * from './repositories/GradeRepository';
export * from './repositories/StudySessionRepository';
export * from './repositories/UserRepository';

