import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { extractText, getDocumentProxy } from "npm:unpdf"
import { GoogleGenAI } from "npm:@google/genai"

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
    const ai = new GoogleGenAI({ apiKey: geminiApiKey })

    // Obter payload da requisição (apenas fileId enviado pelo frontend)
    const { fileId } = await req.json()

    if (!fileId) {
      return new Response(JSON.stringify({ error: 'Parâmetro fileId é obrigatório.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 1. Buscar metadados do arquivo na tabela ai_knowledge_files
    const { data: fileData, error: dbError } = await supabase
      .from('ai_knowledge_files')
      .select('url, name')
      .eq('id', fileId)
      .maybeSingle()

    if (dbError || !fileData) {
      throw new Error(`Arquivo não encontrado no banco de dados ou erro de consulta: ${dbError?.message}`);
    }

    // 2. Extrair o caminho relativo (filePath) no bucket a partir da URL gravada
    const fileUrl = fileData.url
    const match = fileUrl.match(/\/ai-knowledge\/(.+)$/)
    const filePath = match ? decodeURIComponent(match[1]) : null

    if (!filePath) {
      throw new Error("Não foi possível extrair o caminho relativo do arquivo no bucket a partir da URL gravada.");
    }

    // 3. Baixar os bytes do arquivo PDF do bucket privado ai-knowledge
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('ai-knowledge')
      .download(filePath)

    if (downloadError || !fileBlob) {
      throw new Error(`Erro ao baixar o PDF do Storage do Supabase: ${downloadError?.message}`);
    }

    const arrayBuffer = await fileBlob.arrayBuffer()

    // 4. Extrair texto de todas as páginas do PDF usando a unpdf (wrapper do pdf.js em Deno)
    let text = ""
    try {
      const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer))
      const extractResult = await extractText(pdf, { mergePages: true })
      text = extractResult.text || ""
    } catch (parseErr: any) {
      console.error(`Erro ao processar PDF com unpdf:`, parseErr)
      throw new Error(`Falha ao extrair texto do documento PDF: ${parseErr.message}`);
    }

    if (!text.trim()) {
      throw new Error("O PDF está vazio ou o texto não pôde ser extraído (documento escaneado/imagem sem OCR).");
    }

    // 5. Dividir o texto extraído em blocos (chunks) de 1000 caracteres com overlap de 200
    const chunkSize = 1000
    const overlap = 200
    const chunks: string[] = []
    let cursor = 0

    while (cursor < text.length) {
      const chunk = text.substring(cursor, cursor + chunkSize).trim()
      if (chunk) {
        chunks.push(chunk)
      }
      cursor += chunkSize - overlap
    }

    console.log(`PDF parseado com sucesso. Total de caracteres: ${text.length}. Gerados ${chunks.length} chunks.`);

    // 6. Gerar embedding vetorial (text-embedding-004) e gravar no Postgres para cada chunk
    let successfulChunks = 0

    for (const chunkContent of chunks) {
      if (!chunkContent || !chunkContent.trim()) continue;

      let embeddingVector: number[] | null = null
      try {
        // Chamar API do Gemini para gerar o vetor de embedding usando o novo SDK @google/genai
        const embeddingRes = await ai.models.embedContent({
          model: "text-embedding-004",
          contents: chunkContent.trim(),
        })

        const vector = embeddingRes.embedding?.values || 
                       embeddingRes.embeddings?.[0]?.values || 
                       (embeddingRes as any).values;

        if (vector && Array.isArray(vector)) {
          embeddingVector = vector
        } else {
          throw new Error("Formato de resposta de embedding inválido ou vazio.")
        }
      } catch (embedErr: any) {
        console.error(`Erro ao gerar embedding do Gemini para o chunk: ${chunkContent.substring(0, 30)}... Error:`, embedErr)
        continue // Ignorar chunk com falha e processar o restante
      }

      // Inserir chunk e seu vetor correspondente no Supabase
      const { error: insertError } = await supabase
        .from('ai_knowledge_chunks')
        .insert({
          file_id: fileId,
          content: chunkContent.trim(),
          embedding: embeddingVector
        })

      if (insertError) {
        console.error('Erro ao salvar chunk no Supabase:', insertError)
        throw insertError
      }

      successfulChunks++
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `PDF de Conhecimento indexado com sucesso! ${successfulChunks} de ${chunks.length} chunks gravados no pgvector.` 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('Erro geral no processo de ingestão:', error)
    return new Response(JSON.stringify({ error: error.message || 'Erro inesperado de servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
