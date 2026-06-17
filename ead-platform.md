# Plano do Projeto - EAD Help Platform

## Overview
A plataforma **EAD Help** é um ambiente virtual de aprendizado voltado para estudantes universitários, oferecendo resumos de matérias controlados e simulados de questões (provas oficiais AV/AVS e simulados comuns). 

O sistema possui duas personas:
- **Administrador**: Gerencia alunos, cursos/cadeiras, matérias, resumos (upload de PDFs), questões de provas (cadastro manual) e permissões individuais de acesso aos resumos, além de responder às mensagens de suporte.
- **Aluno**: Estuda através de resumos liberados especificamente para ele, responde a simulados de questões filtrados pelo seu nível de plano (Simulados públicos vs AV/AVS para assinantes Pro/Premium) e pode abrir chamados/mensagens diretas de suporte com o admin.

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
   - Questões do tipo `'simulado'` são públicas (visíveis a todos os alunos).
   - Questões do tipo `'av'` ou `'avs'` são restritas a alunos Pro/Premium.
3. **Persistência de Resumos em PDF**: Upload de arquivos de resumos armazenados com segurança no Supabase Storage Bucket.
4. **Sistema de Mensagens de Suporte**: Canal de comunicação direto entre aluno e admin, com status de leitura/resposta persistidos.
5. **Sem Bugs de Compilação/Estilo**: Build em produção sem avisos/erros de TypeScript ou linter.

---

## Tech Stack
- **Frontend**: React (Vite) + TypeScript + Tailwind CSS Puro (Design customizado e animado)
- **Banco de Dados & Autenticação**: Supabase (PostgreSQL, Row Level Security, Storage para resumos físicos em PDF)
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
  - **INPUT**: Modelo conceitual do banco atualizado.
  - **OUTPUT**: Script SQL em `supabase/migrations/20260617000000_schema.sql`.
  - **VERIFY**: Executar validação de esquema local.
- **Tarefa 1.2**: Implementação das Políticas de Segurança RLS (Row Level Security) e Bucket do Storage.
  - **Agente**: `security-auditor` | **Skill**: `vulnerability-scanner`
  - **INPUT**: Regras de negócio de acesso a resumos, mensagens e questões.
  - **OUTPUT**: Script SQL em `supabase/migrations/20260617000100_rls_policies.sql`.
  - **VERIFY**: Testar políticas com perfis simulados no Supabase e verificar segurança do bucket de PDFs.

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
  - **OUTPUT**: Visualização de métricas (incluindo número de pendências de suporte) e navegação exclusiva.
  - **VERIFY**: Alunos são redirecionados ao tentar acessar rotas admin.
- **Tarefa 3.2**: Tela de Gestão de Alunos e Concessão de Permissões de Resumo (`AdminStudents.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Tabelas `profiles`, `students` e `summary_access`.
  - **OUTPUT**: Lista de alunos, cadastro manual de novos alunos, controle de plano e formulário de liberação de PDFs.
  - **VERIFY**: O admin consegue selecionar o resumo, o aluno, e salvar a permissão com sucesso.
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
- **Tarefa 4.2**: Área de Resolução de Questões e Provas (`StudentExams.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Banco de questões (simulado aberto e AV/AVS pago) e respostas persistidas em `student_answers`.
  - **OUTPUT**: Interface interativa de perguntas, feedback instantâneo de correção e estatísticas de aproveitamento.
  - **VERIFY**: Aluno Básico visualiza apenas simulados comuns. Aluno Pro/Premium acessa AV/AVS.
- **Tarefa 4.3**: Tela de Suporte e Contato Direto (`StudentSupport.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Tabela `support_messages`.
  - **OUTPUT**: Histórico de chamados enviados, campo para enviar novas mensagens e exibição das respostas do administrador.
  - **VERIFY**: Mensagens enviadas aparecem instantaneamente para o aluno e ficam listadas no painel do administrador.

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
