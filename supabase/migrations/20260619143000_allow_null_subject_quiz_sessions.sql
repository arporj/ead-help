-- Remove a restrição NOT NULL da coluna subject_id na tabela quiz_sessions para permitir simulados gerais (mistos)
ALTER TABLE public.quiz_sessions ALTER COLUMN subject_id DROP NOT NULL;
