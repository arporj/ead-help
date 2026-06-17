-- 1. Criar a tabela de usuários administradores do sistema
CREATE TABLE IF NOT EXISTS public.system_users (
    email text PRIMARY KEY,
    id uuid REFERENCES auth.users ON DELETE CASCADE,
    full_name text,
    permissions jsonb NOT NULL DEFAULT '{"all": true}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.system_users ENABLE ROW LEVEL SECURITY;

-- 2. Definir políticas RLS para system_users
CREATE POLICY "Allow admin full access to system_users" ON public.system_users
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Allow read system_users to authenticated" ON public.system_users
    FOR SELECT TO authenticated USING (true);

-- 3. Redefinir a função do trigger handle_new_user() para gerenciar permissões administrativas e convites
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  is_system_admin boolean;
BEGIN
  -- Verificar se o e-mail cadastrado está cadastrado/autorizado na tabela system_users
  SELECT EXISTS (
    SELECT 1 FROM public.system_users
    WHERE email = new.email
  ) INTO is_system_admin;

  -- admin@eadhelp.com sempre é tratado como admin/system_user
  IF new.email = 'admin@eadhelp.com' THEN
    is_system_admin := true;
    
    INSERT INTO public.system_users (email, id, full_name, permissions)
    VALUES (new.email, new.id, 'Supra Admin', '{"all": true}'::jsonb)
    ON CONFLICT (email) DO UPDATE SET id = new.id, full_name = 'Supra Admin';
  END IF;

  IF is_system_admin THEN
    -- Insere o perfil de usuário como administrador
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
      'admin'::text
    );

    -- Vincula o id do auth.users recém-criado na tabela de system_users
    UPDATE public.system_users
    SET id = new.id,
        full_name = coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email)
    WHERE email = new.email;

  ELSE
    -- Insere o perfil de usuário como estudante normal
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
      'student'::text
    );

    -- Cria o estudante com plano básico
    INSERT INTO public.students (id, plan, lgpd_ranking_consent)
    VALUES (new.id, 'basic'::text, false);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
