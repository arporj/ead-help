-- Migração: Criação da função de busca vetorial no Supabase filtrada por disciplina para o Mentor Jurídico IA.

CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_discipline text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float,
  category text,
  file_name text
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    chunks.id,
    chunks.content,
    (1 - (chunks.embedding <=> query_embedding))::float AS similarity,
    files.category,
    files.name AS file_name
  FROM public.ai_knowledge_chunks chunks
  JOIN public.ai_knowledge_files files ON chunks.file_id = files.id
  WHERE (filter_discipline IS NULL OR files.discipline = filter_discipline)
    AND (1 - (chunks.embedding <=> query_embedding)) > match_threshold
  ORDER BY chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
