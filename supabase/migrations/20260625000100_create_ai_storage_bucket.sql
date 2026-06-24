-- Migração: Criação do bucket privado 'ai-knowledge' para base de dados da IA e políticas RLS de controle.

-- Criar o bucket 'ai-knowledge' (privado) de arquivos da IA se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-knowledge', 'ai-knowledge', FALSE)
ON CONFLICT (id) DO NOTHING;

-- 1. Política para permitir leitura dos objetos apenas para usuários autenticados (a IA/Edge Functions rodando no backend e administradores)
CREATE POLICY "Permitir leitura de conhecimento de IA para autenticados"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'ai-knowledge');

-- 2. Política para permitir upload de arquivos da IA apenas para administradores
CREATE POLICY "Permitir upload de conhecimento de IA para administradores"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ai-knowledge' AND public.is_admin(auth.uid()));

-- 3. Política para permitir atualização/substituição de arquivos da IA apenas para administradores
CREATE POLICY "Permitir alteração de conhecimento de IA para administradores"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ai-knowledge' AND public.is_admin(auth.uid()));

-- 4. Política para permitir exclusão de arquivos da IA apenas para administradores
CREATE POLICY "Permitir deleção de conhecimento de IA para administradores"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ai-knowledge' AND public.is_admin(auth.uid()));
