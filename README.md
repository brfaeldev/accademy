# 📱 Controle de Estudos — Academy App

![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-SDK_58-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-expo--sqlite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Plataformas](https://img.shields.io/badge/Plataformas-Android_|_iOS_|_Web-4F46E5?style=for-the-badge)

Aplicativo móvel desenvolvido em **React Native** com **TypeScript** e **Expo**, voltado para a centralização, organização e acompanhamento da rotina acadêmica do estudante universitário.

Este projeto faz parte da disciplina de **Desenvolvimento de Aplicativos Móveis** (10º Semestre) — **FHO - Fundação Hermínio Ometto - Campus Araras**.

---

## 👥 Integrantes do Grupo
* **Bruno Rafael Barbosa** — RA: 112944
* **João Pedro Magrin** — RA: 113164
* **Docente Responsável:** Prof. Diego Fiori (`dfiori@fho.edu.br`)
* **Repositório Oficial:** [github.com/brfaeldev/accademy](https://github.com/brfaeldev/accademy)

---

## 🎯 Problema Resolvido (GAP) e Solução

A dispersão de informações acadêmicas (prazos anotados em cadernos, salas de aula em murais, materiais em links avulsos e falta de clareza nas metas de aprovação) prejudica o rendimento do aluno universitário.

O **Controle de Estudos** resolve esse problema reunindo em uma única interface intuitiva:
1. **Planejamento de Aulas e Horários:** Localização de salas, blocos e contatos dos professores;
2. **Agenda e Acompanhamento de Prazos:** Tarefas, provas e trabalhos com status de entrega em tempo real;
3. **Boletim Dinâmico e Simulador de Notas:** Acompanhamento de médias ponderadas e cálculo automático da nota necessária na Prova Final;
4. **Central de Foco (Pomodoro):** Cronômetro de estudo com métricas de tempo líquido dedicado cruzadas com as matérias.

---

## 🚀 Telas e Funcionalidades Desenvolvidas (MVP)

O aplicativo conta com **5 telas completas e navegáveis**:

1. **Dashboard (Tela Inicial):**
   * Resumo diário do estudante com data e boas-vindas contextuais;
   * Cards rápidos com dados da próxima aula (local, sala/bloco, horários e professor);
   * Lista de tarefas e provas dos próximos 7 dias com alertas visuais de prazo;
   * **Botão Flutuante (FAB)** para iniciar rapidamente o cronômetro de estudos.

2. **Gestão Acadêmica (Disciplinas e Contatos):**
   * Lista de matérias do semestre atual com etiquetas e cores personalizadas;
   * Detalhes de docentes responsáveis, e-mail institucional e localização física/remota das aulas;
   * **CRUD Completo:** Criação, edição e exclusão de matérias com confirmação segura.

3. **Agenda e Prazos (Controle de Tarefas):**
   * Visualização com filtros por status: `Pendente`, `Em Andamento` e `Concluído`;
   * Cards com tipo de atividade (Prova, Trabalho, Lista, Seminário), pesos acadêmicos e datas de entrega;
   * **CRUD Completo:** Cadastro de novas avaliações e alternância rápida de status em 1 toque.

4. **Boletim e Simulador de Notas:**
   * Barras de progresso visuais com percentual da média atingida em cada disciplina;
   * **Calculadora Dinâmica Interativa:** Simula automaticamente *"Quanto preciso tirar na Prova Final para passar com média 7.0?"* baseado nas notas e pesos atuais;
   * Lançamento de notas parciais com pesos ponderados customizáveis.

5. **Central de Foco (Tempo de Estudo):**
   * Cronômetro interativo com modo **Pomodoro (25m Foco / 5m Pausa Curta / 15m Pausa Longa)** com controles de Play, Pause e Reset;
   * Vinculação da sessão à disciplina estudada para rastreamento de esforço;
   * **Relatórios de Produtividade:** Barras de horas líquidas dedicadas por disciplina cruzadas com o rendimento acadêmico;
   * Histórico detalhado de sessões de estudo realizadas.

---

## 🗄️ Modelagem de Dados Relacional (SQLite)

O aplicativo utiliza banco de dados **SQLite relacional local** gerenciado via biblioteca `expo-sqlite`, com chaves estrangeiras ativadas (`PRAGMA foreign_keys = ON;`), integridade referencial com exclusão em cascata e índices para consultas de alta performance.

### Esquema das Tabelas

| Tabela | Colunas Principais | Relacionamentos e Regras |
| :--- | :--- | :--- |
| **`subjects`** | `id` (PK), `name`, `code`, `professor`, `professor_email`, `location`, `schedule`, `color`, `target_grade` | Tabela mãe de matérias do semestre acadêmico. |
| **`tasks`** | `id` (PK), `subject_id` (FK), `title`, `description`, `type`, `due_date`, `weight`, `status` | `FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE`. Índices em `subject_id` e `due_date`. |
| **`grades`** | `id` (PK), `subject_id` (FK), `name`, `grade`, `weight` | `FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE`. Índice em `subject_id`. |
| **`study_sessions`** | `id` (PK), `subject_id` (FK), `subject_name`, `duration_minutes`, `timestamp`, `date`, `notes` | `FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL`. Índice em `date`. |

```sql
-- Exemplo DDL da integridade e índices relacionais
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY NOT NULL,
  subject_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  due_date TEXT NOT NULL,
  weight REAL NOT NULL,
  status TEXT NOT NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_subject_id ON tasks(subject_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
```

---

## 🧮 Regras de Negócio e Fórmulas Acadêmicas

### 1. Cálculo da Média Ponderada Atual
A média de cada disciplina considera todas as avaliações lançadas com seus respectivos pesos:

$$\text{Média Atual} = \frac{\sum (\text{Nota}_i \times \text{Peso}_i)}{\sum \text{Peso}_i}$$

### 2. Simulador de Nota na Prova Final
O sistema calcula matematicamente a pontuação exata que o estudante precisa atingir na Prova Final para alcançar a meta de aprovação ($\text{Meta} = 7.0$):

$$\text{Nota Necessária} = \frac{\text{Meta} \times (\text{Peso Total} + \text{Peso Final}) - (\text{Média Atual} \times \text{Peso Total})}{\text{Peso Final}}$$

* Se a média já for superior à meta, o resultado retorna automaticamente **0.0** com indicação visual de que o aluno já atingiu os critérios de aprovação.

### 3. Ciclos de Foco (Pomodoro)
* **Foco:** Bloco de 25 minutos de estudo ininterrupto;
* **Pausa Curta:** Intervalo de 5 minutos;
* **Pausa Longa:** Intervalo de 15 minutos;
* Cada sessão concluída grava a duração líquida e associa à matéria selecionada, alimentando os gráficos de dedicação do estudante.

---

## 🎨 Design System e Identidade Visual

A interface foi projetada com base em tokens semânticos centralizados em `src/theme/theme.ts`:

* **Cores Primárias:** Indigo (`#4F46E5`), Roxo (`#8B5CF6`) e fundo Slate suave (`#F8FAFC`);
* **Cores de Feedback:**
  * 🟢 **Sucesso:** Emerald (`#10B981`) para tarefas concluídas e aprovação em disciplinas;
  * 🟡 **Alerta:** Amber (`#F59E0B`) para tarefas em andamento e notas no limiar;
  * 🔴 **Perigo:** Red (`#EF4444`) para tarefas pendentes, atrasos e reprovação;
  * 🔵 **Informação:** Sky (`#0284C7`) para avisos e dicas de estudo.
* **Componentes Reutilizáveis:**
  * `Badge`: Tags coloridas e semânticas para tipos de tarefas e status;
  * `Button`: Suporte a múltiplos tamanhos, estados de carregamento e variantes (primário, secundário, outline);
  * `Card`: Contêiner padrão com sombras suaves e bordas consistentes;
  * `ProgressBar`: Barras de progresso com gradiente e indicação percentual;
  * `ModalWrapper`: Janelas modais responsivas para cadastro e edição rápida;
  * `TabBar`: Barra inferior com ícones vetoriais e realce de aba ativa.

---

## 🏗️ Arquitetura e Padrão de Mercado

O projeto foi estruturado seguindo as melhores práticas de mercado (arquitetura em camadas, separação de responsabilidades, Repository Pattern e componentização):

```text
academy/
├── assets/                 # Ícones, splash screen e identidade visual do app
├── docs/                   # Documentação da disciplina, PDFs e roteiros de apresentação
├── public/                 # Recursos estáticos e manifesto para suporte Web/PWA
├── src/
│   ├── components/         # Componentes modulares da interface
│   │   ├── common/         # Componentes visuais reutilizáveis (Badge, Button, Card, Header, ProgressBar, Modal, FAB)
│   │   └── navigation/     # Componentes de navegação (TabBar inferior customizada)
│   ├── context/            # Gerenciamento de estado global com React Context API (AppContext)
│   ├── database/           # Camada de banco de dados SQLite relacional (expo-sqlite)
│   │   ├── database.ts     # Conexão singleton e controle de transações/chaves estrangeiras
│   │   ├── logger.ts       # Utilitário de auditoria e log colorido/formatado de queries SQL
│   │   ├── schema.ts       # DDL das tabelas relacionais, foreign keys com CASCADE e índices
│   │   ├── seed.ts         # Carga inicial com dados acadêmicos caso o banco esteja vazio
│   │   ├── types.ts        # Tipagens específicas da camada SQLite e mapeadores Row <-> Entidade
│   │   ├── index.ts        # Ponto de exportação unificado da camada de dados
│   │   └── repositories/   # Repositórios especializados (Repository Pattern)
│   │       ├── SubjectRepository.ts       # CRUD e consultas de matérias/disciplinas
│   │       ├── TaskRepository.ts          # CRUD, ordenação e filtros de tarefas/provas
│   │       ├── GradeRepository.ts         # Lançamento de notas parciais e cálculo de médias
│   │       └── StudySessionRepository.ts  # Registro e relatórios de sessões Pomodoro
│   ├── screens/            # As 5 telas navegáveis do MVP
│   │   ├── DashboardScreen.tsx  # Visão geral diária, próximas aulas, prazos e atalho FAB
│   │   ├── SubjectsScreen.tsx   # Gestão de matérias, cores, docentes e salas
│   │   ├── TasksScreen.tsx      # Agenda de tarefas e provas com filtros de status
│   │   ├── GradesScreen.tsx     # Boletim acadêmico e simulador de nota para prova final
│   │   └── FocusScreen.tsx      # Cronômetro Pomodoro e métricas de dedicação líquida
│   ├── services/           # Serviços de dados auxiliares e persistência
│   │   ├── mockData.ts     # Massa de dados padrão para seed do banco e testes
│   │   └── storage.ts      # Armazenamento e fallback em cache / AsyncStorage
│   ├── theme/              # Design System (tokens de cores, tipografia, espaçamentos e sombras)
│   └── types/              # Definições de tipos, contratos e interfaces TypeScript
├── App.tsx                 # Entrada e orquestrador principal de contexto e navegação
├── app.json                # Configurações do Expo (identificadores, splash, orientação e tema)
├── index.ts                # Ponto de inicialização do Expo (registerRootComponent)
├── metro.config.js         # Configurações do empacotador Metro
├── package.json            # Dependências, scripts e metadados do projeto
└── tsconfig.json           # Configurações de compilação do TypeScript
```

---

## 💻 Como Executar o Projeto

### 📋 Pré-requisitos
* **Node.js** (versão 18.x ou 20.x LTS recomendada)
* **npm** (ou **yarn**)
* **Git** instalado
* *(Opcional)* Aplicativo **Expo Go** instalado no smartphone:
  * [Google Play Store (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)
  * [Apple App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)

---

### 🚀 Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/brfaeldev/accademy.git
   cd accademy
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npx expo start
   ```
   *(ou utilize `npm start`)*

4. **Abra a aplicação na plataforma de sua preferência:**
   * 📱 **Android físico:** Abra o app **Expo Go** e escaneie o QR Code exibido no terminal.
   * 🍎 **iOS físico (iPhone):** Abra o aplicativo nativo da **Câmera**, aponte para o QR Code e toque no banner para abrir no Expo Go.
   * 🌐 **Navegador Web:** Pressione a tecla `w` no terminal ou execute `npm run web` (o projeto possui suporte a SQLite via WASM e cabeçalhos de isolamento de memória no Metro).
   * 🤖 **Emulador Android:** Pressione a tecla `a` no terminal (requer Android Studio com AVD configurado).
   * 🍏 **Simulador iOS:** Pressione a tecla `i` no terminal (requer macOS com Xcode).

---

### 🛠️ Scripts Úteis

| Comando | Descrição |
| :--- | :--- |
| `npm start` ou `npx expo start` | Inicia o Metro Bundler interativo do Expo |
| `npm run web` | Inicia a aplicação diretamente no navegador padrão |
| `npm run android` | Inicia e conecta ao emulador Android ativo |
| `npm run ios` | Inicia e conecta ao simulador iOS (macOS) |
| `npm run lint` | Executa o linter ESLint para validação de código |

---

### 💡 Dicas e Solução de Problemas

* **Wi-Fi com isolamento de rede ou firewall (comum em redes institucionais)?**  
  Se o smartphone e o computador não conseguirem se comunicar na mesma rede local, inicie o Expo com o modo de túnel:
  ```bash
  npx expo start --tunnel
  ```
* **Limpar cache do Metro Bundler:**  
  Caso ocorra algum comportamento inesperado de cache após alterações de pacotes:
  ```bash
  npx expo start -c
  ```
* **Carga de Dados Automática (Seed):**  
  Na primeira inicialização, o banco de dados relacional SQLite (`academy.db`) é criado e populado automaticamente com matérias, tarefas, avaliações e sessões de estudo simuladas, permitindo testar todas as telas e cálculos de aprovação imediatamente.

---

## 🔮 Roadmap e Evoluções Futuras

* [ ] **Notificações Push Locais:** Avisos automáticos no smartphone 24h e 2h antes do prazo final de tarefas e provas;
* [ ] **Integração com Google Calendar:** Sincronização automática das datas de aulas e avaliações com a agenda do celular;
* [ ] **Exportação de Relatórios (PDF / CSV):** Geração de histórico acadêmico consolidado e relatório de dedicação líquida para envio a professores ou tutores;
* [ ] **Sincronização em Nuvem (Cloud Sync):** Autenticação multiusuário com sincronização em nuvem e suporte nativo *offline-first*;
* [ ] **Modo Escuro (Dark Mode):** Alternância automática conforme a preferência do sistema operacional.

---

## 📊 Roteiro para a Apresentação (5 Slides da Atividade Prática 02)

1. **Slide 1 — Identificação:** Nome do Projeto (*Controle de Estudos*), Integrantes (Bruno Rafael Barbosa, João Pedro Magrin) e Tecnologias (*React Native, TypeScript, Expo*).
2. **Slide 2 — Problema e MVP:** O GAP da dispersão de prazos e notas acadêmicas; as 4 prioridades atendidas no MVP (Agenda, Grade, Notas e Foco).
3. **Slide 3 — Arquitetura e Telas:** Fluxo de navegação em abas, estrutura de pastas e componentes modulares.
4. **Slide 4 — Decisões Técnicas e Recursos:** Simulação dinâmica de nota final, cronômetro Pomodoro com persistência e design system limpo.
5. **Slide 5 — Demonstração e Próximos Passos:** Demonstração prática do app rodando no Expo Go e link do GitHub.

---

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos sob a licença **MIT** — consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
