-- Habilitar a extensão pgvector para armazenamento de vetores da IA
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Tabela de Perfis de Usuários (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text NOT NULL,
    full_name text,
    role text NOT NULL CHECK (role IN ('admin', 'student')) DEFAULT 'student',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Tabela de Alunos (Students)
CREATE TABLE IF NOT EXISTS public.students (
    id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    plan text NOT NULL CHECK (plan IN ('basic', 'pro', 'premium')) DEFAULT 'basic',
    lgpd_ranking_consent boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS na tabela students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 3. Tabela de Cursos (Courses)
CREATE TABLE IF NOT EXISTS public.courses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS na tabela courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 4. Tabela de Matérias (Subjects)
CREATE TABLE IF NOT EXISTS public.subjects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS na tabela subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- 5. Tabela de Resumos (Summaries)
CREATE TABLE IF NOT EXISTS public.summaries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text,
    pdf_url text NOT NULL,
    is_free boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS na tabela summaries
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

-- 6. Tabela de Controle de Acesso Individual a Resumos (Summary Access)
CREATE TABLE IF NOT EXISTS public.summary_access (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    summary_id uuid REFERENCES public.summaries(id) ON DELETE CASCADE NOT NULL,
    granted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, summary_id)
);

-- Habilitar RLS na tabela summary_access
ALTER TABLE public.summary_access ENABLE ROW LEVEL SECURITY;

-- 7. Tabela de Questões (Questions)
CREATE TABLE IF NOT EXISTS public.questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    text text NOT NULL,
    type text NOT NULL CHECK (type IN ('simulado', 'prova')) DEFAULT 'simulado',
    difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    options jsonb NOT NULL, -- Array de strings das opções (múltipla escolha)
    correct_option_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS na tabela questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- 8. Tabela de Sessões de Quiz (Quiz Sessions)
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    started_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at timestamp with time zone,
    score integer DEFAULT 0,
    is_completed boolean NOT NULL DEFAULT false
);

-- Habilitar RLS na tabela quiz_sessions
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- 9. Tabela de Respostas de Estudantes (Student Answers)
CREATE TABLE IF NOT EXISTS public.student_answers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id uuid REFERENCES public.quiz_sessions(id) ON DELETE CASCADE NOT NULL,
    question_id uuid REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    selected_option_index integer NOT NULL,
    is_correct boolean NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(session_id, question_id)
);

-- Habilitar RLS na tabela student_answers
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

-- 10. Tabela de Mensagens de Suporte (Support Messages)
CREATE TABLE IF NOT EXISTS public.support_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS na tabela support_messages
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- 11. Tabela de Arquivos de Conhecimento da IA (AI Knowledge Files)
CREATE TABLE IF NOT EXISTS public.ai_knowledge_files (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    url text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS na tabela ai_knowledge_files
ALTER TABLE public.ai_knowledge_files ENABLE ROW LEVEL SECURITY;

-- 12. Tabela de Trechos do Conhecimento da IA (AI Knowledge Chunks)
CREATE TABLE IF NOT EXISTS public.ai_knowledge_chunks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    file_id uuid REFERENCES public.ai_knowledge_files(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    embedding vector(1536), -- Vector embedding para RAG
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS na tabela ai_knowledge_chunks
ALTER TABLE public.ai_knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- 13. Tabela de Permissão Individual para Consultor IA (AI Consultant Access)
CREATE TABLE IF NOT EXISTS public.ai_consultant_access (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    granted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id)
);

-- Habilitar RLS na tabela ai_consultant_access
ALTER TABLE public.ai_consultant_access ENABLE ROW LEVEL SECURITY;

-- 14. Tabela de Conversas com IA (AI Conversations)
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    title text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS na tabela ai_conversations
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- 15. Tabela de Mensagens da IA (AI Messages)
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id uuid REFERENCES public.ai_conversations(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS na tabela ai_messages
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- 16. Trigger para criar perfil automaticamente ao cadastrar um usuário na tabela nativa auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    CASE 
      WHEN new.email = 'admin@eadhelp.com' THEN 'admin'::text
      ELSE 'student'::text
    END
  );

  -- Se não for administrador, criamos automaticamente o perfil do estudante com plano básico
  IF (new.email != 'admin@eadhelp.com') THEN
    INSERT INTO public.students (id, plan, lgpd_ranking_consent)
    VALUES (new.id, 'basic'::text, false);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger associado
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
