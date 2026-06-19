-- Redefinir a função do trigger handle_new_user() para remover qualquer promoção automática por e-mail
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  is_system_admin boolean;
BEGIN
  -- Verificar se o e-mail cadastrado está previamente cadastrado/autorizado na tabela system_users
  SELECT EXISTS (
    SELECT 1 FROM public.system_users
    WHERE email = new.email
  ) INTO is_system_admin;

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
