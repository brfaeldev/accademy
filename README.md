# 📱 Controle de Estudos — Academy App

Aplicativo móvel desenvolvido em **React Native** com **TypeScript** e **Expo**, voltado para a centralização, organização e acompanhamento da rotina acadêmica do estudante universitário.

Este projeto faz parte da disciplina de **Desenvolvimento de Aplicativos Móveis** (4º Bimestre) — **FHO**.

---

## 👥 Integrantes do Grupo
* **Bruno Rafael Barbosa** — RA: 112944
* **João Pedro Magrin** — RA: 113164
* **Docente Responsável:** Prof. Diego Fiori (`dfiori@fho.edu.br`)
* **Repositório Oficial:** [github.com/jpmfho22/academy](https://github.com/jpmfho22/academy)

---

## 🎯 Problema Resolvido (GAP) e Solução

A dispersão de informações acadêmicas (prazos anotados em cadernos, salas de aula em murais, materiais em links avulsos e falta de clareza nas metas de aprovação) prejudica o rendimento do aluno. 

O **Controle de Estudos** resolve esse problema reunindo em uma única interface intuitiva:
1. Planejamento de horários e salas de aula;
2. Agenda e acompanhamento de tarefas/provas com status de entrega;
3. Boletim dinâmico com simulador de aprovação na prova final;
4. Cronômetro Pomodoro com métricas de dedicação líquida conectadas ao rendimento das disciplinas.

---

## 🚀 Telas e Funcionalidades Desenvolvidas (MVP)

O aplicativo conta com **5 telas completas e navegáveis**:

1. **Dashboard (Tela Inicial):**
   * Resumo diário do estudante;
   * Cards rápidos com dados da próxima aula (local, sala/bloco, horários e professor);
   * Lista de tarefas e provas dos próximos 7 dias com alertas de prazo;
   * **Botão Flutuante (FAB)** para iniciar rapidamente o cronômetro de estudos.

2. **Gestão Acadêmica (Disciplinas e Contatos):**
   * Lista de matérias do semestre atual com cores personalizadas;
   * Detalhes de docentes responsáveis, e-mail institucional e localização física/remota das aulas;
   * **CRUD Completo:** Criação, edição e exclusão de matérias.

3. **Agenda e Prazos (Controle de Tarefas):**
   * Visualização com filtros por status: `Pendente`, `Em Andamento` e `Concluído`;
   * Cards com tipo de atividade (Prova, Trabalho, Lista, Seminário), pesos acadêmicos e datas de entrega;
   * **CRUD Completo:** Cadastro de novas avaliações e alternância rápida de status em 1 clique.

4. **Boletim e Simulador de Notas:**
   * Barras de progresso visuais com percentual da média atingida em cada disciplina;
   * **Calculadora Dinâmica Interativa:** Simula automaticamente *"Quanto preciso tirar na Prova Final para passar com média 7.0?"* baseado nas notas e pesos atuais;
   * Lançamento de notas parciais e ponderadas.

5. **Central de Foco (Tempo de Estudo):**
   * Cronômetro interativo com modo **Pomodoro (25m Foco / 5m Pausa Curta / 15m Pausa Longa)** e controles de Play, Pause e Reset;
   * Vinculação da sessão à disciplina estudada;
   * **Relatórios de Produtividade:** Barras de horas líquidas dedicadas por disciplina cruzadas com o rendimento acadêmico;
   * Histórico de sessões de estudo realizadas.

---

## 🏗️ Arquitetura e Padrão de Mercado

O projeto foi estruturado seguindo as melhores práticas de mercado:

```text
academy/
├── docs/                   # Documentação da disciplina e roteiros de apresentação
├── src/
│   ├── components/         # Componentes reutilizáveis (Card, Badge, Button, Header, ProgressBar, etc.)
│   ├── context/            # Gerenciamento de estado global com React Context API (AppContext)
│   ├── navigation/         # Componente de navegação inferior (TabBar)
│   ├── screens/            # As 5 telas do MVP (Dashboard, Subjects, Tasks, Grades, Focus)
│   ├── services/           # Camada de armazenamento e dados iniciais (AsyncStorage com fallback)
│   ├── theme/              # Tokens de design do sistema (paleta de cores, tipografia, espaçamentos)
│   └── types/              # Definições de tipos e interfaces em TypeScript
├── App.tsx                 # Entrada principal e roteamento do aplicativo
├── app.json                # Configuração do Expo
├── package.json            # Dependências e scripts do projeto
└── tsconfig.json           # Configuração do compilador TypeScript
```

---

## 💻 Como Executar o Projeto

### Pré-requisitos
* **Node.js** (versão 18 ou superior)
* **npm** ou **yarn**
* Aplicativo **Expo Go** instalado no celular (disponível na [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) e [Apple App Store](https://apps.apple.com/app/expo-go/id982107779))

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/jpmfho22/academy.git
   cd academy
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npx expo start
   ```

4. **Abra o aplicativo:**
   * **No celular:** Abra o aplicativo **Expo Go** e escaneie o QR Code exibido no terminal.
   * **No navegador (Web):** Pressione `w` no terminal para abrir no navegador.
   * **No emulador Android:** Pressione `a` no terminal.
   * **No simulador iOS (macOS):** Pressione `i` no terminal.

---

## 📊 Roteiro para a Apresentação (5 Slides da Atividade Prática 02)

1. **Slide 1 — Identificação:** Nome do Projeto (*Controle de Estudos*), Integrantes (Bruno Rafael Barbosa, João Pedro Magrin) e Tecnologias (*React Native, TypeScript, Expo*).
2. **Slide 2 — Problema e MVP:** O GAP da dispersão de prazos e notas acadêmicas; as 4 prioridades atendidas no MVP (Agenda, Grade, Notas e Foco).
3. **Slide 3 — Arquitetura e Telas:** Fluxo de navegação em abas, estrutura de pastas e componentes modulares.
4. **Slide 4 — Decisões Técnicas e Recursos:** Simulação dinâmica de nota final, cronômetro Pomodoro com persistência e design system limpo.
5. **Slide 5 — Demonstração e Próximos Passos:** Demonstração prática do app rodando no Expo Go e link do GitHub.
