-- Migração: Adição de CPF/Telefone em perfis, metadados de prática na IA e agendamento pg_cron para exclusão de chats após 7 dias.

-- 1. Adicionar colunas de CPF e Telefone na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- 2. Atualizar a trigger de novo usuário para processar CPF e Telefone vindos do cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, cpf, phone)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    CASE 
      WHEN new.email = 'admin@eadhelp.com' THEN 'admin'::text
      ELSE 'student'::text
    END,
    new.raw_user_meta_data->>'cpf',
    new.raw_user_meta_data->>'phone'
  );

  -- Se não for administrador, criamos automaticamente o perfil do estudante com plano básico
  IF (new.email != 'admin@eadhelp.com') THEN
    INSERT INTO public.students (id, plan, lgpd_ranking_consent)
    VALUES (new.id, 'basic'::text, false);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Estender a tabela ai_knowledge_files com suporte a disciplinas práticas e categorias de material
ALTER TABLE public.ai_knowledge_files ADD COLUMN IF NOT EXISTS discipline text CHECK (discipline IN ('civil', 'penal', 'trabalhista'));
ALTER TABLE public.ai_knowledge_files ADD COLUMN IF NOT EXISTS category text CHECK (category IN ('template_estrutural', 'checklist', 'caso_pratico'));

-- 4. Estender a tabela ai_conversations com informações de controle do Mentor Jurídico e expiração
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS discipline text CHECK (discipline IN ('civil', 'penal', 'trabalhista'));
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS case_description text;
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS expiry_warning_sent boolean DEFAULT false;

-- 5. Habilitar a extensão pg_cron para a limpeza automática de chats de 7 dias
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remover job anterior para evitar duplicidade em reexecuções
SELECT cron.unschedule('delete-old-conversations') WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'delete-old-conversations'
);

-- Agendar para deletar conversas velhas a cada dia à meia-noite (horário de Brasília - 03:00 UTC)
SELECT cron.schedule(
  'delete-old-conversations',
  '0 3 * * *',
  $$
  DELETE FROM public.ai_conversations 
  WHERE created_at < now() - INTERVAL '7 days';
  $$
);

-- 6. Criar View para listar conversas no 6º dia de criação com aviso pendente (para notificação por e-mail)
CREATE OR REPLACE VIEW public.pending_conversations_warning AS
  SELECT 
    c.id AS conversation_id,
    p.email,
    p.full_name,
    c.discipline,
    c.created_at
  FROM public.ai_conversations c
  JOIN public.profiles p ON c.student_id = p.id
  WHERE c.created_at < now() - INTERVAL '6 days' 
    AND c.created_at >= now() - INTERVAL '7 days'
    AND c.expiry_warning_sent = false;
