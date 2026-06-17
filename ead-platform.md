# Plano do Projeto - EAD Help Platform

## Overview
A plataforma **EAD Help** é um ambiente virtual de aprendizado voltado para estudantes universitários, oferecendo resumos de matérias em PDF, quizzes interativos de simulados e provas, e o **Banco de Questões (BDQ)** - uma ferramenta onde o aluno visualiza e faz download de questões contendo apenas o enunciado e a resposta correta para estudo direcionado.
Como diferenciais de tecnologia e engajamento, a plataforma integra:
- **Consultor Jurídico via IA**: Sistema baseado em RAG para responder dúvidas com base em PDFs carregados pelo admin.
- **Ranking Geral de Alunos**: Gamificação com ranking de desempenho baseado em sessões completas de 10 questões, totalmente adequado à LGPD.

O sistema possui duas personas:
- **Administrador**: Gerencia alunos, cursos, matérias, resumos (PDF), questões (cadastro manual), mensagens de suporte e a base de PDFs que alimentam a IA do Consultor Jurídico.
- **Aluno**: Estuda através de resumos liberados, joga Quizzes interativos em ciclos de 10 questões, visualiza o Ranking Geral (caso dê consentimento LGPD), baixa os BDQs (conforme seu plano), envia mensagens ao suporte e interage com o Consultor Jurídico via IA.

---

## Project Type
**WEB** (Web Application)
- Agente Principal: `frontend-specialist`
- Agente do Banco de Dados: `database-architect`
- Agente de Segurança: `security-auditor`

---

## Success Criteria
1. **Diferenciação Quiz vs BDQ**:
   - **Modo Quiz**: Ciclos de 10 questões de múltipla escolha interativa com feedback de acerto/erro.
   - **Modo BDQ**: Lista limpa de questões mostrando apenas enunciado + resposta correta (sem alternativas incorretas) otimizada para download/impressão.
2. **Ciclos de 10 Questões & Ranking**:
   - Uma rodada de quiz sempre consiste de 10 questões.
   - Sessões interrompidas antes de completar a décima questão não geram pontuação no ranking.
   - Apenas alunos que deram o aceite explícito à LGPD (`lgpd_ranking_consent = true`) aparecem no Ranking Geral.
3. **Consultor Jurídico via IA (RAG)**:
   - Respostas da IA baseadas estritamente nos PDFs de leis/diretrizes carregados pelo admin.
4. **Restrição de Acesso por Planos & Compras**:
   - **Aluno Básico**: Quiz de Simulado (grátis).
   - **Aluno Pro**: Quiz de Simulado, Quiz de Provas, BDQ de Simulado.
   - **Aluno Premium**: Quiz de Simulado, Quiz de Provas, BDQ de Simulado, BDQ de Provas.
   - **IA / Resumos**: Liberação avulsa concedida de forma individual pelo administrador.
5. **Comunicação Aluno-Admin**: Envio de mensagens de suporte e respostas persistidas no banco.

---

## Tech Stack
- **Frontend**: React (Vite) + TypeScript + Tailwind CSS Puro
- **Banco de Dados & Autenticação**: Supabase (PostgreSQL com extensão `vector`, RLS, Storage para PDFs de resumos e base da IA)
- **Edge Functions**: Deno + TypeScript para processamento RAG (ingestão e chat com Gemini API)
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
│   ├── functions/
│   │   ├── ingest-knowledge/
│   │   │   └── index.ts
│   │   └── chat-ai/
│   │       └── index.ts
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
    │   ├── StudentAIConsultant.tsx
    │   ├── StudentRanking.tsx
    │   ├── AdminDashboard.tsx
    │   ├── AdminStudents.tsx
    │   ├── AdminContent.tsx
    │   ├── AdminQuestions.tsx
    │   └── AdminAIKnowledge.tsx
    └── types/
        └── index.ts
```

---

## Task Breakdown

### Fase 1: Fundação do Banco de Dados & Infra (Supabase)
- **Tarefa 1.1**: Criação do esquema de banco de dados (`profiles`, `students`, `courses`, `subjects`, `summaries`, `summary_access`, `questions`, `student_answers`, `quiz_sessions`, `support_messages`, `ai_knowledge_files`, `ai_knowledge_chunks`, `ai_consultant_access`, `ai_conversations`, `ai_messages`).
  - **Agente**: `database-architect` | **Skill**: `database-design`
  - **INPUT**: Modelo de dados atualizado com ranking e IA.
  - **OUTPUT**: Script SQL em `supabase/migrations/20260617000000_schema.sql`.
  - **VERIFY**: Executar validação de esquema local e ativação de `pgvector`.
- **Tarefa 1.2**: Políticas RLS para ranking com base no consentimento LGPD, visibilidade condicional de questões e chat da IA.
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
- **Tarefa 3.2**: Tela de Gestão de Alunos, Permissões de Resumo e Liberação da IA (`AdminStudents.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Tabelas de perfis, alunos, permissões e acessos à IA.
  - **OUTPUT**: Lista de alunos, controle de plano, liberação de PDFs e chave do consultor IA.
  - **VERIFY**: Gravação de acessos com sucesso.
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
- **Tarefa 3.5**: Cadastro da Base de Conhecimento da IA (`AdminAIKnowledge.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Bucket do Supabase Storage e Edge Function `ingest-knowledge`.
  - **OUTPUT**: Tela de upload de PDFs legais, indexação dos arquivos e remoção.
  - **VERIFY**: Indexador dispara com sucesso ao subir o arquivo e preenche tabela de vetores.

### Fase 4: Área do Aluno (Student Pages)
- **Tarefa 4.1**: Painel do Aluno e Visualização de Resumos (`StudentDashboard.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Matérias e resumos (PDFs) autorizados para o aluno.
  - **OUTPUT**: Listagem de matérias, exibição dos resumos disponíveis e links para baixar o PDF.
  - **VERIFY**: Apenas os resumos liberados são exibidos.
- **Tarefa 4.2**: Resolução de Quizzes Interativos em Rodadas de 10 Questões (`StudentExams.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Banco de questões (simulado aberto e provas oficiais se Pro/Premium) e controle de sessão `quiz_sessions`.
  - **OUTPUT**: Interface interativa de rodada de 10 perguntas, salvamento apenas de rodadas finalizadas e tela de conclusão de rodada.
  - **VERIFY**: Rodadas incompletas não computam pontuação.
- **Tarefa 4.3**: Tela de Download/Visualização de Banco de Questões - BDQ (`StudentBDQ.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Tabela `questions` filtrada pelo plano e renderizada apenas com enunciado + resposta correta.
  - **OUTPUT**: Visualização limpa com botão de impressão de PDF utilizando CSS `@media print`.
  - **VERIFY**: Bloqueios por plano funcionando adequadamente.
- **Tarefa 4.4**: Tela de Suporte e Contato Direto (`StudentSupport.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Tabela `support_messages`.
  - **OUTPUT**: Histórico de chamados enviados, campo para enviar novas mensagens e exibição das respostas do administrador.
  - **VERIFY**: Envio de mensagens e respostas funcionando adequadamente.
- **Tarefa 4.5**: Chat com o Consultor Jurídico via IA (`StudentAIConsultant.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Verificação da tabela `ai_consultant_access` e Edge Function `chat-ai`.
  - **OUTPUT**: Interface de chat com streaming/digitação para alunos com acesso comprado; banner promocional de vendas para os demais.
  - **VERIFY**: Teste do fluxo promocional e chat de IA funcional.
- **Tarefa 4.6**: Ranking Geral de Alunos com Consentimento LGPD (`StudentRanking.tsx`).
  - **Agente**: `frontend-specialist` | **Skill**: `frontend-design`
  - **INPUT**: Dados consolidados de `quiz_sessions` de perfis com `lgpd_ranking_consent = true`.
  - **OUTPUT**: Tabela de liderança geral, botão/modal de consentimento e termos da LGPD.
  - **VERIFY**: Alunos sem consentimento ficam fora do ranking.

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
