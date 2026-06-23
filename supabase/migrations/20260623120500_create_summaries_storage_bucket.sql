-- Criar o bucket 'summaries' de resumos em PDF se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('summaries', 'summaries', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 1. Política para permitir leitura pública dos objetos do bucket 'summaries'
CREATE POLICY "Permitir leitura de resumos para autenticados"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'summaries');

-- 2. Política para permitir upload de resumos apenas para administradores
CREATE POLICY "Permitir upload de resumos para administradores"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'summaries' AND public.is_admin(auth.uid()));

-- 3. Política para permitir atualização/substituição de resumos apenas para administradores
CREATE POLICY "Permitir alteração de resumos para administradores"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'summaries' AND public.is_admin(auth.uid()));

-- 4. Política para permitir exclusão de resumos apenas para administradores
CREATE POLICY "Permitir deleção de resumos para administradores"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'summaries' AND public.is_admin(auth.uid()));
