# Plano do Projeto - EAD Help Platform

## Overview
A plataforma **EAD Help** é um ambiente virtual de aprendizado voltado para estudantes universitários, oferecendo resumos de matérias em PDF, quizzes interativos de simulados e provas, e o **Banco de Questões (BDQ)** - uma ferramenta onde o aluno visualiza e faz download de questões contendo apenas o enunciado e a resposta correta para estudo direcionado.

O sistema possui duas personas:
- **Administrador**: Gerencia alunos, cursos, matérias, resumos (PDF), questões (cadastro manual) e responde às mensagens de suporte.
- **Aluno**: Estuda através de resumos liberados, joga Quizzes interativos (gratuitos/pagos), baixa os BDQs (conforme seu plano) e envia mensagens ao suporte.

---

## Project Type
**WEB** (Web Application)
- Agente Principal: `frontend-specialist`
- Agente do Banco de Dados: `database-architect`
- Agente de Segurança: `security-auditor`

---

## Success Criteria
1. **Diferenciação Quiz vs BDQ**:
   - **Modo Quiz**: Múltipla escolha interativa com feedback de acerto/erro.
   - **Modo BDQ**: Lista limpa de questões mostrando apenas enunciado + resposta correta (sem alternativas incorretas) otimizada para download/impressão.
2. **Restrição de Acesso por Planos**:
   - **Aluno Básico**: Quiz de Simulado (grátis).
   - **Aluno Pro**: Quiz de Simulado, Quiz de Provas, BDQ de Simulado.
   - **Aluno Premium**: Quiz de Simulado, Quiz de Provas, BDQ de Simulado, BDQ de Provas.
3. **Resumos (PDFs)**: Liberação individual realizada pelo administrador.
4. **Comunicação Aluno-Admin**: Envio de mensagens de suporte e respostas persistidas no banco.
5. **Sem Bugs de Compilação**: Build de produção limpa.

---

## Tech Stack
- **Frontend**: React (Vite) + TypeScript + Tailwind CSS Puro
- **Banco de Dados & Autenticação**: Supabase (PostgreSQL, RLS, Storage para resumos físicos em PDF)
- **Roteamento & Estado**: React Router DOM (v6), Context API.

---

## File Structure
```text
ead-help/
├── .agent/
├── .git/
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── postcss.config.js
├── tailwind.config.js
├── supabase/
│   └── migrations/
│       ├── 20260617000000_schema.sql
│       └── 20260617000100_rls_policies.sql
└── src/
    ├── main.tsx
    ├── index.css
    ├── lib/
    │   └── supabaseClient.ts
    ├── contexts/
    │   └── AuthContext.tsx
    ├── components/
    │   ├── Layout.tsx
    │   └── ProtectedRoute.tsx
    ├── pages/
    │   ├── Login.tsx
    │   ├── StudentDashboard.tsx
    │   ├── StudentExams.tsx
    │   ├── StudentBDQ.tsx
    │   ├── StudentSupport.tsx
    │   ├── AdminDashboard.tsx
    │   ├── AdminStudents.tsx
    │   ├── AdminContent.tsx
    │   └── AdminQuestions.tsx
    └── types/
        └── index.ts
```

---

## Task Breakdown

### Fase 1: Fundação do Banco de Dados & Infra (Supabase)
- **Tarefa 1.1**: Criação do esquema de banco de dados (`profiles`, `students`, `courses`, `subjects`, `summaries`, `summary_access`, `questions`, `student_answers`, `support_messages`).
  - **Agente**: `database-architect` | **Skill**: `database-design`
  - **INPUT**: Modelo de dados atualizado.
  - **OUTPUT**: Script SQL em `supabase/migrations/20260617000000_schema.sql`.
  - **VERIFY**: Executar validação de esquema local.
- **Tarefa 1.2**: Políticas RLS para visualização condicional de questões (Simulado vs Prova) e segurança de PDFs.
  - **Agente**: `security-auditor` | **Skill**: `vulnerability-scanner`
  - **INPUT**: Regras de negócio de visibilidade.
  - **OUTPUT**: Script SQL em `supabase/migrations/20260617000100_rls_policies.sql`.
  - **VERIFY**: Validar isolamento das queries utilizando perfis de diferentes níveis.

### Fase 2: Configuração Inicial e Autenticação (Frontend)
- **Tarefa 2.1**: Inicialização do projeto React Vite com TypeScript e Tailwind CSS.
  - **Agente**: `frontend-specialist` | **Skill**: `app-builder`
  - **INPUT**: Pasta vazia.
  - **OUTPUT**: Arquivos de configuração de build, dependências de pacote e estrutura de pastas.
  - **VERIFY**: `npm run dev` inicia o servidor de desenvolvimento.
- **Tarefa 2.2**: Integração do cliente do Supabase e Contexto de Autenticação.
  - **Agente**: `frontend-specialist` | **Skill**: `clean-code`
  - **INPUT**: Chaves do Supabase.
  - **OUTPUT**: `src/lib/supabaseClient.ts` e `src/contexts/AuthContext.tsx`.
  - **VERIFY**: Teste de login/logout.

### Fase 3: Área Administrativa (Admin Pages)
- **Tarefa 3.1**: Criação do Painel Administrativo Geral e Roteamento de Admin.
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: `AuthContext` e `Layout.tsx`.
  - **OUTPUT**: Visualização de métricas e navegação exclusiva.
  - **VERIFY**: Usuários sem permissão administrativa são bloqueados.
- **Tarefa 3.2**: Tela de Gestão de Alunos e Concessão de Permissões de Resumo (`AdminStudents.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Tabelas de perfis, alunos e permissões.
  - **OUTPUT**: Lista de alunos, cadastro manual, controle de plano e formulário de liberação de PDFs.
  - **VERIFY**: Gravação de acesso individual a resumos com sucesso.
- **Tarefa 3.3**: Cadastro de Cursos, Matérias e Resumos (PDFs) (`AdminContent.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Tabelas de cursos, matérias e resumos + bucket do Supabase Storage.
  - **OUTPUT**: Formulários de cadastro rápido e upload de PDF para o bucket.
  - **VERIFY**: Upload do arquivo com link associado ao registro no banco.
- **Tarefa 3.4**: Cadastro de Questões com Opções e Gabarito (`AdminQuestions.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Tabela `questions`.
  - **OUTPUT**: Formulário com campos de enunciado, nível (plano), tipo (Simulado/AV/AVS) e opções dinâmicas.
  - **VERIFY**: Inserção no banco de dados com array JSON de opções e resposta correta.

### Fase 4: Área do Aluno (Student Pages)
- **Tarefa 4.1**: Painel do Aluno e Visualização de Resumos (`StudentDashboard.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Matérias e resumos (PDFs) autorizados para o aluno.
  - **OUTPUT**: Listagem de matérias, exibição dos resumos disponíveis e links para baixar o PDF.
  - **VERIFY**: Apenas os resumos liberados são exibidos.
- **Tarefa 4.2**: Área de Resolução de Quizzes Interativos (`StudentExams.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Banco de questões (simulado aberto e provas oficiais se Pro/Premium).
  - **OUTPUT**: Interface interativa de perguntas, feedback instantâneo de correção e estatísticas.
  - **VERIFY**: Aluno Básico não consegue obter questões do tipo AV/AVS.
- **Tarefa 4.3**: Tela de Download/Visualização de Banco de Questões - BDQ (`StudentBDQ.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Tabela `questions` filtrada pelo plano e renderizada apenas com enunciado + resposta correta.
  - **OUTPUT**: Visualização limpa com botão de impressão de PDF utilizando CSS `@media print`.
  - **VERIFY**: Aluno Básico não acessa. Aluno Pro acessa BDQ de Simulado. Aluno Premium acessa todos os BDQs.
- **Tarefa 4.4**: Tela de Suporte e Contato Direto (`StudentSupport.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Tabela `support_messages`.
  - **OUTPUT**: Histórico de chamados enviados, campo para enviar novas mensagens e exibição das respostas do administrador.
  - **VERIFY**: Envio de mensagens e respostas funcionando adequadamente.

---

## Phase X: Verification

### 1. Build & Linting
```bash
npm run build
npm run lint
npx tsc --noEmit
```

### 2. Manual Compliance Check
- [ ] O banco de dados Supabase possui RLS ativado em todas as tabelas.
- [ ] Não há códigos de cor roxo/violeta não solicitados (Purple Ban respeitado).
- [ ] A interface possui transições suaves, foco de acessibilidade e design responsivo.
- [ ] Testes de infiltração básica de rotas: Alunos normais não conseguem ler dados de admin ou resumos bloqueados mesmo alterando parâmetros na URL.
