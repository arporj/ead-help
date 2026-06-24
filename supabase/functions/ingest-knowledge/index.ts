import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Tratar requisição OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "" // Usar chave service role para poder burlar RLS de inserção do sistema
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? ""

    if (!supabaseUrl || !supabaseServiceRoleKey || !geminiApiKey) {
      throw new Error("Variáveis de ambiente do Supabase ou Gemini não configuradas no servidor.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Obter payload da requisição
    const { fileId, chunks } = await req.json()

    if (!fileId || !chunks || !Array.isArray(chunks)) {
      return new Response(JSON.stringify({ error: 'Parâmetros fileId e chunks são obrigatórios e chunks deve ser um array.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const headers = { 'Content-Type': 'application/json' }
    let successfulChunks = 0;

    for (const chunkContent of chunks) {
      if (!chunkContent || !chunkContent.trim()) continue;

      // Chamar API do Gemini para gerar o vetor de embedding (text-embedding-004)
      const embeddingRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: "models/text-embedding-004",
            content: { parts: [{ text: chunkContent.trim() }] }
          })
        }
      )

      if (!embeddingRes.ok) {
        const errorText = await embeddingRes.text()
        console.error(`Erro ao gerar embedding do Gemini para o chunk: ${chunkContent.substring(0, 30)}... Error: ${errorText}`);
        continue; // Ignorar chunk com falha e processar o restante
      }

      const embeddingData = await embeddingRes.json()
      const embeddingVector = embeddingData.embedding.values

      // Inserir chunk e seu vetor correspondente no Supabase
      const { error: insertError } = await supabase
        .from('ai_knowledge_chunks')
        .insert({
          file_id: fileId,
          content: chunkContent.trim(),
          embedding: embeddingVector
        })

      if (insertError) {
        console.error('Erro ao salvar chunk no Supabase:', insertError);
        throw insertError;
      }

      successfulChunks++;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `${successfulChunks} de ${chunks.length} chunks indexados com sucesso no pgvector!` 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('Erro geral no processo de ingestão:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erro inesperado de servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
