-- 1. Criar tabela de configuração de planos
CREATE TABLE IF NOT EXISTS public.plans_config (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_type text NOT NULL UNIQUE CHECK (plan_type IN ('basic', 'pro', 'premium')),
    name text NOT NULL,
    price_monthly numeric(10,2) NOT NULL DEFAULT 0.00,
    price_quarterly numeric(10,2) NOT NULL DEFAULT 0.00,
    max_subjects integer NOT NULL DEFAULT 0,
    included_premium_summaries integer NOT NULL DEFAULT 0,
    additional_subject_price numeric(10,2) NOT NULL DEFAULT 19.90,
    additional_summary_price numeric(10,2) NOT NULL DEFAULT 29.90,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS em plans_config
ALTER TABLE public.plans_config ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para plans_config
CREATE POLICY "Allow authenticated read plans_config" ON public.plans_config
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin full access to plans_config" ON public.plans_config
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Inserir dados iniciais dos planos
INSERT INTO public.plans_config (plan_type, name, price_monthly, price_quarterly, max_subjects, included_premium_summaries, additional_subject_price, additional_summary_price)
VALUES 
('basic', 'Gratuito', 0.00, 0.00, 0, 0, 19.90, 29.90),
('pro', 'Start', 39.90, 99.90, 3, 1, 19.90, 29.90),
('premium', 'Aprovação', 69.90, 179.90, 5, 2, 19.90, 29.90)
ON CONFLICT (plan_type) DO UPDATE SET
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly,
    price_quarterly = EXCLUDED.price_quarterly,
    max_subjects = EXCLUDED.max_subjects,
    included_premium_summaries = EXCLUDED.included_premium_summaries;

-- 2. Criar tabela de disciplinas do estudante
CREATE TABLE IF NOT EXISTS public.student_subjects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    is_additional boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, subject_id)
);

-- Habilitar RLS em student_subjects
ALTER TABLE public.student_subjects ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para student_subjects
CREATE POLICY "Allow students to read their own subjects" ON public.student_subjects
    FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Allow students to choose their initial subjects" ON public.student_subjects
    FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() OR public.is_admin(auth.uid()));

-- O próprio aluno pode deletar suas disciplinas contratadas? Não, as regras dizem que não há troca. Então somente o admin pode deletar/atualizar.
CREATE POLICY "Allow admin full access to student_subjects" ON public.student_subjects
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 3. Atualizar a tabela de acesso aos resumos para adicionar o tipo de acesso
ALTER TABLE public.summary_access ADD COLUMN IF NOT EXISTS access_type text NOT NULL DEFAULT 'admin' CHECK (access_type IN ('admin', 'benefit', 'purchased'));
