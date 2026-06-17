# Plano do Projeto - EAD Help Platform

## Overview
A plataforma **EAD Help** é um ambiente virtual de aprendizado voltado para estudantes universitários, oferecendo resumos de matérias controlados e simulados de questões (provas oficiais AV/AVS e simulados comuns). 

O sistema possui duas personas:
- **Administrador**: Gerencia alunos, cursos/cadeiras, matérias, resumos, questões de provas e permissões individuais de acesso aos resumos.
- **Aluno**: Estuda através de resumos liberados especificamente para ele e responde a simulados de questões filtrados pelo seu nível de plano (Básico, Pro, Premium).

---

## Project Type
**WEB** (Web Application)
- Agente Principal: `frontend-specialist`
- Agente do Banco de Dados: `database-architect`
- Agente de Segurança: `security-auditor`

---

## Success Criteria
1. **Segurança de Acesso**: Alunos só conseguem ler ou fazer download de resumos cujas permissões foram concedidas pelo admin na tabela `summary_access`.
2. **Restrição de Conteúdo por Plano**:
   - Aluno Básico visualiza apenas questões Básicas.
   - Aluno Pro visualiza questões Básicas e Pro.
   - Aluno Premium visualiza questões de todos os planos.
3. **Persistência das Respostas**: Respostas dos simulados salvas no banco de dados com feedback imediato de correção para o aluno.
4. **Sem Bugs de Compilação/Estilo**: Build em produção sem avisos/erros de TypeScript ou linter.

---

## Tech Stack
- **Frontend**: React (Vite) + TypeScript + Tailwind CSS
- **Banco de Dados & Autenticação**: Supabase (PostgreSQL, Row Level Security, Storage para resumos físicos)
- **Roteamento & Estado**: React Router DOM (v6), Context API para Auth e dados locais.

---

## File Structure
```text
ead-help/
├── .agent/                  # Scripts e ferramentas de auditoria e testes
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
- **Tarefa 1.1**: Criação do esquema de banco de dados (`profiles`, `students`, `courses`, `subjects`, `summaries`, `summary_access`, `questions`, `student_answers`).
  - **Agente**: `database-architect` | **Skill**: `database-design`
  - **INPUT**: Modelo conceitual do banco.
  - **OUTPUT**: Script SQL em `supabase/migrations/20260617000000_schema.sql`.
  - **VERIFY**: Executar validação de esquema ou testes locais de queries.
- **Tarefa 1.2**: Implementação das Políticas de Segurança RLS (Row Level Security).
  - **Agente**: `security-auditor` | **Skill**: `vulnerability-scanner`
  - **INPUT**: Regras de negócio de acesso a resumos e questões.
  - **OUTPUT**: Script SQL em `supabase/migrations/20260617000100_rls_policies.sql`.
  - **VERIFY**: Testar leituras com perfis de alunos de diferentes níveis e garantir bloqueio/permissão.

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
  - **VERIFY**: Teste de login/logout com contas criadas no Supabase.

### Fase 3: Área Administrativa (Admin Pages)
- **Tarefa 3.1**: Criação do Painel Administrativo Geral e Roteamento de Admin.
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: `AuthContext` e `Layout.tsx`.
  - **OUTPUT**: Visualização de métricas e navegação exclusiva.
  - **VERIFY**: Usuários normais (alunos) são redirecionados ao tentar acessar as rotas admin.
- **Tarefa 3.2**: Tela de Gestão de Alunos e Concessão de Permissões de Resumo (`AdminStudents.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Tabelas `profiles`, `students` e `summary_access`.
  - **OUTPUT**: Lista de alunos, controle de plano (Básico/Pro/Premium) e formulário/modal de atribuição de resumos.
  - **VERIFY**: O admin consegue selecionar o resumo, o aluno, e salvar a permissão com sucesso.
- **Tarefa 3.3**: Cadastro de Cursos, Matérias e Resumos (`AdminContent.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Tabelas de cursos, matérias e resumos.
  - **OUTPUT**: Formulários de cadastro rápido e upload de arquivos.
  - **VERIFY**: Verificação de arquivo carregado no Supabase Storage Bucket.
- **Tarefa 3.4**: Cadastro de Questões com Opções e Gabarito (`AdminQuestions.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Tabela `questions`.
  - **OUTPUT**: Formulário com campos de enunciado, nível (plano), tipo (Simulado/AV/AVS) e opções dinâmicas.
  - **VERIFY**: Questão inserida no banco de dados com array JSON de opções e índice correto da resposta.

### Fase 4: Área do Aluno (Student Pages)
- **Tarefa 4.1**: Painel do Aluno e Visualização de Resumos (`StudentDashboard.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Matérias e resumos liberados para o aluno.
  - **OUTPUT**: Listagem de matérias, exibição dos resumos disponíveis e links para visualização.
  - **VERIFY**: Apenas os resumos cujo acesso foi explicitamente dado aparecem listados para o aluno selecionado.
- **Tarefa 4.2**: Área de Resolução de Questões e Provas (`StudentExams.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Banco de questões filtrado pelo plano e respostas persistidas em `student_answers`.
  - **OUTPUT**: Interface interativa de perguntas, feedback instantâneo de correção e persistência das tentativas.
  - **VERIFY**: Aluno Básico não consegue obter questões Premium da API do Supabase e o feedback de correção funciona em tempo real.

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
