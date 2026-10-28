# 📋 Roteiro de Apresentação — 5 Slides (Atividade Prática 02)

**Disciplina:** Desenvolvimento de Aplicativos Móveis  
**Docente:** Prof. Diego Fiori  
**Projeto:** Controle de Estudos  
**Grupo:** Bruno Rafael Barbosa (RA: 112944) e João Pedro Magrin (RA: 113164)  
**Repositório:** [https://github.com/jpmfho22/academy](https://github.com/jpmfho22/academy)

---

### Slide 1: Identificação do Projeto
* **Título do Projeto:** Controle de Estudos — Assistente Pessoal Acadêmico
* **Integrantes do Grupo:**
  * Bruno Rafael Barbosa — RA: 112944
  * João Pedro Magrin — RA: 113164
* **Tecnologia Escolhida:** React Native (com TypeScript e plataforma Expo)
* **Objetivo Geral:** Centralizar horários de aulas, tarefas com prazos, simulação de aprovação em notas e controle de tempo dedicado a estudos em um aplicativo mobile prático e intuitivo.

---

### Slide 2: Problema e Definição do MVP
* **Contextualização do Problema (GAP):**
  * Estudantes sofrem com a dispersão de dados (prazos anotados à mão, salas em avisos murais, notas soltas em portais e perda de controle sobre quanto tempo realmente estudam).
* **Problema Resolvido:** Eliminar a sobrecarga mental de prazos e notas, fornecendo visão em tempo real do que fazer hoje e onde estar.
* **Funcionalidades Priorizadas no MVP:**
  1. *Dashboard com resumo do dia e próxima aula;*
  2. *Cadastro e gestão de disciplinas, docentes e salas de aula;*
  3. *Agenda de avaliações e tarefas com status (Pendente, Em Andamento, Concluído);*
  4. *Boletim com simulador de nota necessária na Prova Final;*
  5. *Cronômetro Pomodoro com métricas de horas de dedicação.*

---

### Slide 3: Arquitetura e Telas da Aplicação
* **Fluxo de Navegação:**
  * Navegação por abas inferiores (*Bottom Navigation*) permitindo alternar instantaneamente entre os 5 módulos principais sem perda de estado.
* **Estrutura de Pastas e Componentes (Padrão de Mercado):**
  * `src/components/`: Componentes atômicos e reutilizáveis (Cards, Badges, Botões, ProgressBar, Header, Modais).
  * `src/context/`: Estado global unificado (`AppContext`) e persistência.
  * `src/screens/`: 5 telas funcionais (`Dashboard`, `Subjects`, `Tasks`, `Grades`, `Focus`).
  * `src/services/`: Camada de dados e armazenamento local.
  * `src/theme/`: Design tokens padronizados (cores, espaçamentos, tipografia).
  * `src/types/`: Interfaces estritas em TypeScript.

---

### Slide 4: Ideias para Implementação e Decisões Técnicas
* **Decisões Técnicas:**
  * **React Native + Expo:** Garantem desenvolvimento ágil com execução nativa no celular (Android/iOS via Expo Go) e suporte a Web.
  * **TypeScript:** Previne erros de tempo de execução e garante tipagem sólida para modelos de disciplinas, notas e tarefas.
  * **Simulador Matemático Dinâmico:** Implementado para calcular automaticamente a nota necessária na Prova Final com base na média ponderada atual.
  * **Técnica Pomodoro Integrada:** Temporizador de 25 minutos de foco e pausas, que registra automaticamente o histórico de horas líquidas de estudo.

---

### Slide 5: Demonstração e Próximos Passos
* **Demonstração Prática:**
  * Exibição do app em execução navegando pelas 5 telas.
  * Teste do CRUD de matérias e tarefas (alteração de status em 1 toque).
  * Demonstração da calculadora dinâmica de notas.
  * Demonstração do timer Pomodoro.
* **Repositório GitHub:** `https://github.com/jpmfho22/academy`
* **Próximos Passos do Projeto:**
  * Notificações locais (push notifications) para alertar sobre prazos de entregas na véspera;
  * Integração com calendário do dispositivo (Google Calendar);
  * Exportação de relatórios de produtividade em PDF.
