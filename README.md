# 📱 Controle de Estudos — Academy App

Aplicativo multiplataforma (**Android, iOS e Web/PWA**) desenvolvido em **React Native**, **TypeScript** e **Expo**, voltado para a organização e acompanhamento da rotina acadêmica universitária.

Projeto desenvolvido para a disciplina de **Desenvolvimento de Aplicativos Móveis** (10º Semestre) — **FHO - Fundação Hermínio Ometto (Campus Araras)**.

## 👥 Identificação
* **Bruno Rafael Barbosa** — RA: 112944
* **João Pedro Magrin** — RA: 113164
* **Docente Responsável:** Prof. Diego Fiori (`dfiori@fho.edu.br`)
* **Repositório:** [github.com/brfaeldev/accademy](https://github.com/brfaeldev/accademy)

---

## 🚀 Telas e Funcionalidades

O aplicativo possui **6 telas** integradas ao banco de dados local:

1. **Autenticação (`AuthScreen`):**
   * Cadastro e login local com isolamento de dados por estudante (`user_id`);
   * Senhas armazenadas com hash **SHA-256** no SQLite e sessão persistida via `AsyncStorage`.
2. **Dashboard (`DashboardScreen`):**
   * Resumo diário de tarefas ativas, média global ponderada e horas de foco;
   * Identificação dinâmica da próxima aula com base no dia da semana;
   * Lista de entregas vencendo nos próximos 7 dias ou em atraso.
3. **Disciplinas (`SubjectsScreen`):**
   * CRUD completo de matérias com código, docente, e-mail, local/link, horários, cor de identificação e meta de aprovação configurável (`targetGrade`, padrão `7.0`).
4. **Agenda e Prazos (`TasksScreen`):**
   * CRUD completo de provas, trabalhos, listas e seminários com filtro por status (`Pendente`, `Em Andamento`, `Concluído`), máscara/validação de data (`DD/MM/AAAA`) e alternância rápida de status com rollback em caso de falha.
5. **Boletim e Simulador (`GradesScreen`):**
   * Lançamento, edição e exclusão de notas e pesos por disciplina;
   * Simulador dinâmico que calcula a nota mínima necessária na Prova Final para atingir a meta de aprovação.
6. **Central de Foco (`FocusScreen`):**
   * Cronômetro **Pomodoro** (`25m` Foco / `5m` Pausa Curta / `15m` Pausa Longa) mantido no contexto global (continua ativo ao trocar de aba e sincroniza com o relógio do sistema em segundo plano via `AppState`);
   * Registro automático ou manual (`+30 min`) de sessões vinculadas às matérias e relatório de horas dedicadas vs. média acadêmica.

---

## 🗄️ Banco de Dados Relacional (SQLite)

Persistência local gerenciada via `expo-sqlite` (`academy.db`) com `PRAGMA foreign_keys = ON`, índices relacionais e integridade referencial:

| Tabela | Colunas | Relacionamentos |
| :--- | :--- | :--- |
| **`users`** | `id` (PK), `name`, `email` (UNIQUE), `password` (SHA-256), `course`, `created_at` | Conta do estudante (índice único em `email`). |
| **`subjects`** | `id` (PK), `user_id` (FK), `name`, `code`, `professor`, `professor_email`, `location`, `schedule`, `color`, `target_grade` | `user_id -> users(id) ON DELETE CASCADE`. |
| **`tasks`** | `id` (PK), `subject_id` (FK), `title`, `description`, `type`, `due_date`, `weight`, `status` | `subject_id -> subjects(id) ON DELETE CASCADE`. |
| **`grades`** | `id` (PK), `subject_id` (FK), `name`, `grade`, `weight` | `subject_id -> subjects(id) ON DELETE CASCADE`. |
| **`study_sessions`** | `id` (PK), `user_id` (FK), `subject_id` (FK), `subject_name`, `duration_minutes`, `timestamp`, `date`, `notes` | `user_id -> users(id) ON DELETE CASCADE` e `subject_id -> subjects(id) ON DELETE SET NULL`. |

---

## 🧮 Fórmulas Acadêmicas

* **Média Ponderada por Disciplina:**
  $$\text{Média Atual} = \frac{\sum (\text{Nota}_i \times \text{Peso}_i)}{\sum \text{Peso}_i}$$

* **Nota Necessária na Prova Final:**
  $$\text{Nota Necessária} = \max\left(0,\; \frac{\text{Meta} \times (\text{Peso Total} + \text{Peso Final}) - (\text{Média Atual} \times \text{Peso Total})}{\text{Peso Final}}\right)$$

---

## 🏗️ Estrutura do Projeto

```text
academy/
├── assets/                 # Ícones e splash screen do aplicativo
├── public/                 # Manifesto, ícones e Service Worker para suporte Web/PWA
├── src/
│   ├── components/
│   │   ├── common/         # Componentes base (Badge, Button, Card, ChipSelector, ConfirmModal, EmptyState, FloatingActionButton, FormField, Header, ModalWrapper, ProgressBar, SubjectSelector)
│   │   ├── domain/         # Componentes de domínio e modais (DedicationReportCard, FinalExamSimulatorCard, GradeFormModal, LoginForm, PomodoroTimerCard, RegisterForm, SavedAccountsList, SubjectCard, SubjectFormModal, SubjectGradeCard, TaskCard, TaskFormModal)
│   │   └── navigation/     # Barra de navegação inferior (TabBar)
│   ├── context/            # Estado global e orquestração (AppContext)
│   ├── database/           # Conexão SQLite, schema DDL, migrações, logger e repositories
│   │   └── repositories/   # UserRepository, SubjectRepository, TaskRepository, GradeRepository, StudySessionRepository
│   ├── hooks/              # Hook do cronômetro Pomodoro (usePomodoroTimer)
│   ├── screens/            # Telas da aplicação (Auth, Dashboard, Subjects, Tasks, Grades, Focus)
│   ├── theme/              # Tokens de cores, espaçamentos, bordas e sombras (theme.ts)
│   ├── types/              # Contratos e interfaces TypeScript
│   └── utils/              # Funções puras (crypto, dateUtils, formatters, gradeCalculations)
├── App.tsx                 # Componente raiz e controle de navegação
├── app.json                # Configurações do Expo
├── index.ts                # Entrada da aplicação e registro do Service Worker na Web
├── metro.config.js         # Suporte a WASM e headers COOP/COEP para expo-sqlite na Web
├── package.json            # Dependências e scripts
└── tsconfig.json           # Configuração do TypeScript (strict mode)
```

---

## 💻 Como Executar

### Pré-requisitos
* **Node.js** (18+ ou 20+ LTS)
* Aplicativo **Expo Go** (opcional, para teste em dispositivo físico Android/iOS)

### Instalação e Execução

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor de desenvolvimento
npx expo start
```

### Comandos Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm start` | Inicia o Metro Bundler interativo |
| `npm run web` | Inicia a aplicação no navegador Web (com SQLite via WASM) |
| `npm run android` | Abre no emulador/dispositivo Android |
| `npm run ios` | Abre no simulador iOS (macOS) |
| `npm run lint` | Executa a verificação estática com ESLint (`expo lint`) |
| `npx tsc --noEmit` | Executa a checagem de tipos do TypeScript |

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
