-- 1. Adicionar coluna is_supra na tabela system_users
ALTER TABLE public.system_users ADD COLUMN IF NOT EXISTS is_supra boolean NOT NULL DEFAULT false;

-- 2. Garantir índice único parcial para que apenas um administrador seja o Supra Admin
CREATE UNIQUE INDEX IF NOT EXISTS only_one_supra_admin ON public.system_users (is_supra) WHERE (is_supra = true);

-- 3. Atualizar a redefinição da função do trigger handle_new_user() para incluir is_supra no cadastro do supra admin master
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

  -- admin@eadhelp.com sempre é tratado como admin/system_user e marcado como Supra Admin inicial
  IF new.email = 'admin@eadhelp.com' THEN
    is_system_admin := true;
    
    INSERT INTO public.system_users (email, id, full_name, permissions, is_supra)
    VALUES (new.email, new.id, 'Supra Admin', '{"all": true}'::jsonb, true)
    ON CONFLICT (email) DO UPDATE SET id = new.id, full_name = 'Supra Admin', is_supra = true;
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

-- 4. Criar função RPC para transferir a propriedade de Supra Admin de forma transacional
CREATE OR REPLACE FUNCTION public.transfer_supra_status(new_supra_email text)
RETURNS void AS $$
DECLARE
  caller_email text;
  caller_is_supra boolean;
BEGIN
  -- Obter o e-mail do chamador da função a partir de auth.uid()
  SELECT email FROM public.profiles WHERE id = auth.uid() INTO caller_email;
  
  -- Verificar se o chamador é de fato o Supra Admin
  SELECT is_supra FROM public.system_users WHERE email = caller_email INTO caller_is_supra;
  
  IF NOT coalesce(caller_is_supra, false) THEN
    RAISE EXCEPTION 'Apenas o Supra Admin atual possui permissão para transferir a liderança.';
  END IF;

  -- Verificar se o destinatário é um administrador ativo e já cadastrado
  IF NOT EXISTS (
    SELECT 1 FROM public.system_users 
    WHERE email = new_supra_email AND id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'O destinatário da transferência de Supra Admin deve ser um administrador ativo e já cadastrado.';
  END IF;

  -- Evitar auto-transferência redundante
  IF caller_email = new_supra_email THEN
    RETURN;
  END IF;

  -- Transferência transacional atômica
  UPDATE public.system_users SET is_supra = false WHERE email = caller_email;
  UPDATE public.system_users SET is_supra = true WHERE email = new_supra_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
