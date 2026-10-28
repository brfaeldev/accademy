import { Subject, Task, GradeItem, StudySession } from '../types';

export const initialSubjects: Subject[] = [
  {
    id: 'sub-1',
    name: 'Desenvolvimento de Apps Móveis',
    code: 'DAM-4B',
    professor: 'Prof. Diego Fiori',
    professorEmail: 'dfiori@fho.edu.br',
    location: 'Lab Informática 3 (Bloco Central)',
    schedule: 'Terças e Quintas • 19h10 - 20h50',
    color: '#4F46E5',
    targetGrade: 7.0,
  },
  {
    id: 'sub-2',
    name: 'Estruturas de Dados Avançadas',
    code: 'EDA-4B',
    professor: 'Prof. Carlos Eduardo',
    professorEmail: 'c.eduardo@fho.edu.br',
    location: 'Bloco C • Sala 102',
    schedule: 'Segundas • 19h10 - 22h30',
    color: '#0284C7',
    targetGrade: 7.0,
  },
  {
    id: 'sub-3',
    name: 'Engenharia de Software',
    code: 'ES-4B',
    professor: 'Profa. Mariana Costa',
    professorEmail: 'mariana.costa@fho.edu.br',
    location: 'Bloco B • Sala 205',
    schedule: 'Quartas • 19h10 - 20h50',
    color: '#10B981',
    targetGrade: 7.0,
  },
  {
    id: 'sub-4',
    name: 'Banco de Dados II',
    code: 'BD2-4B',
    professor: 'Prof. Roberto Silva',
    professorEmail: 'rsilva@fho.edu.br',
    location: 'Lab Informática 1',
    schedule: 'Sextas • 19h10 - 22h30',
    color: '#F59E0B',
    targetGrade: 7.0,
  },
];

// Gera datas dinâmicas relativas para simulação realista
const today = new Date();
const formatDate = (daysAhead: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    subjectId: 'sub-1',
    title: 'Entrega do Protótipo Navegável (Ativ. 02)',
    description: 'Implementar as 5 telas interativas com navegação e componentes no GitHub.',
    type: 'Trabalho',
    dueDate: formatDate(3),
    weight: 3.0,
    status: 'Em Andamento',
  },
  {
    id: 'task-2',
    subjectId: 'sub-2',
    title: 'Lista de Exercícios: Árvores AVL e B-Trees',
    description: 'Resolver os 8 exercícios de balanceamento e complexidade assintótica.',
    type: 'Lista',
    dueDate: formatDate(5),
    weight: 2.0,
    status: 'Pendente',
  },
  {
    id: 'task-3',
    subjectId: 'sub-3',
    title: 'Apresentação Arquitetural e Requisitos',
    description: 'Diagramas UML de classes e casos de uso da sprint inicial.',
    type: 'Seminário',
    dueDate: formatDate(7),
    weight: 2.5,
    status: 'Pendente',
  },
  {
    id: 'task-4',
    subjectId: 'sub-4',
    title: 'Normalização e Scripts DDL PostgreSQL',
    description: 'Criação das tabelas relacionais com chaves estrangeiras e índices.',
    type: 'Trabalho',
    dueDate: formatDate(-2),
    weight: 2.5,
    status: 'Concluído',
  },
  {
    id: 'task-5',
    subjectId: 'sub-1',
    title: 'Avaliação Teórica Bimestral (P1)',
    description: 'Ciclo de vida de componentes React, Hooks e gerenciamento de estado.',
    type: 'Prova',
    dueDate: formatDate(12),
    weight: 4.0,
    status: 'Pendente',
  },
];

export const initialGrades: GradeItem[] = [
  { id: 'gr-1', subjectId: 'sub-1', name: 'Atividade 01 (Escopo)', grade: 9.5, weight: 2.0 },
  { id: 'gr-2', subjectId: 'sub-1', name: 'Avaliação Prática 1', grade: 7.5, weight: 3.0 },
  { id: 'gr-3', subjectId: 'sub-2', name: 'Trabalho de Grafos', grade: 6.5, weight: 3.0 },
  { id: 'gr-4', subjectId: 'sub-2', name: 'Prova P1', grade: 6.0, weight: 4.0 },
  { id: 'gr-5', subjectId: 'sub-3', name: 'Documentação SRS', grade: 9.0, weight: 3.5 },
  { id: 'gr-6', subjectId: 'sub-4', name: 'Modelagem Conceitual', grade: 8.0, weight: 3.0 },
];

export const initialStudySessions: StudySession[] = [
  {
    id: 'sess-1',
    subjectId: 'sub-1',
    subjectName: 'Desenvolvimento de Apps Móveis',
    durationMinutes: 50,
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    date: formatDate(-2),
    notes: 'Configuração do Expo e rotas de navegação',
  },
  {
    id: 'sess-2',
    subjectId: 'sub-2',
    subjectName: 'Estruturas de Dados Avançadas',
    durationMinutes: 75,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    date: formatDate(-1),
    notes: 'Revisão de percursos em árvore binária',
  },
  {
    id: 'sess-3',
    subjectId: 'sub-1',
    subjectName: 'Desenvolvimento de Apps Móveis',
    durationMinutes: 60,
    timestamp: new Date().toISOString(),
    date: formatDate(0),
    notes: 'Construção da tela de Timer Pomodoro e Dashboard',
  },
  {
    id: 'sess-4',
    subjectId: 'sub-3',
    subjectName: 'Engenharia de Software',
    durationMinutes: 45,
    timestamp: new Date().toISOString(),
    date: formatDate(0),
    notes: 'Estudo de boas práticas SOLID',
  },
];
