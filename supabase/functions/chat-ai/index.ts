import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Lista de modelos para tentar em ordem de preferência
const MODELS_TO_TRY = [
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
]

serve(async (req) => {
  // Tratar requisição OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? ""

    if (!supabaseUrl || !supabaseServiceRoleKey || !geminiApiKey) {
      throw new Error("Variáveis de ambiente do Supabase ou Gemini não configuradas no servidor.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Obter payload
    const { conversationId, message, discipline } = await req.json()

    if (!conversationId || !message || !discipline) {
      return new Response(JSON.stringify({ error: 'Parâmetros conversationId, message e discipline são obrigatórios.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 1. Gravar mensagem do aluno no banco de dados
    const { error: insertUserMsgErr } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: message
      });

    if (insertUserMsgErr) {
      console.error('Erro ao salvar mensagem do usuário:', insertUserMsgErr);
      throw insertUserMsgErr;
    }

    // 2. RAG - Buscar base de conhecimento relevante
    let ragContext = "";
    try {
      // 2a. Gerar embedding da pergunta do aluno via API REST direta
      const embeddingRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: "models/text-embedding-004",
            content: { parts: [{ text: message }] }
          })
        }
      )

      if (embeddingRes.ok) {
        const embeddingData = await embeddingRes.json()
        const embeddingVector = embeddingData.embedding.values

        // 2b. Chamar a RPC match_knowledge_chunks para encontrar fragmentos relacionados a essa disciplina
        const { data: matchData, error: matchError } = await supabase.rpc('match_knowledge_chunks', {
          query_embedding: embeddingVector,
          match_threshold: 0.35,
          match_count: 5,
          filter_discipline: discipline
        });

        if (!matchError && matchData && matchData.length > 0) {
          ragContext = matchData.map((chunk: any) => 
            `[Origem: ${chunk.file_name} | Tipo: ${chunk.category}]\nConteúdo: ${chunk.content}`
          ).join('\n\n');
        }
      }
    } catch (ragErr) {
      console.error('Erro ao rodar busca vetorial (RAG):', ragErr);
    }

    // 3. Buscar histórico de conversas do banco para injetar no Gemini
    const { data: historyData } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20);

    const contents = (historyData || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Se o histórico estiver vazio ou não incluir a mensagem recém-enviada, adicioná-la manualmente
    if (contents.length === 0 || contents[contents.length - 1].parts[0].text !== message) {
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });
    }

    // Traduzir disciplina para rótulo legível
    const getDisciplineLabel = (disc: string) => {
      if (disc === 'civil') return 'Prática Civil (CPC)';
      if (disc === 'penal') return 'Prática Penal (CP/CPP)';
      if (disc === 'trabalhista') return 'Prática Trabalhista (CLT)';
      return disc;
    };

    // 4. Montar as System Instructions com as regras pedagógicas socráticas
    const systemPrompt = `
Você é o MENTOR JURÍDICO IA da plataforma Help EAD, um professor orientador virtual de Prática Jurídica sênior especializado em Prática ${getDisciplineLabel(discipline)}.
Seu objetivo é guiar alunos das disciplinas de Prática Jurídica a desenvolverem a escrita e o raciocínio processual, atuando exatamente como um professor orientador universitário.

DIRETRIZES RÍGIDAS DE COMPORTAMENTO:
1. NUNCA, sob hipótese alguma, forneça petições ou peças processuais prontas. É expressamente proibido escrever petições completas, parágrafos extensos de fundamentação prontos ou soluções integrais de atividades avaliativas.
2. Seja um Tutor Socrático: Se o aluno enviar um enunciado de caso prático, conduza-o através de perguntas orientativas (ex: "Quem você representa?", "O processo já foi iniciado?", "Houve citação?", "Você está atuando como autor ou réu?", "Qual é o objetivo pretendido?") para que ele mesmo descubra qual é a peça adequada.
3. Sugira a peça apenas após o aluno responder às perguntas ou estar no caminho certo.
4. Quando a peça for identificada, apresente APENAS a sua estrutura formal (checklists e tópicos formais recomendados, ex: 1. Endereçamento, 2. Qualificação das Partes, 3. Síntese, 4. Preliminares, 5. Mérito, 6. Pedidos, 7. Fechamento) sem preencher nenhum texto ou tese por ele.
5. Estimule o Raciocínio Jurídico: Questione-o sobre pontos processuais e preliminares (existe incompetência? há prescrição/decadência?) e teses de mérito. Ajude-o a encontrar os artigos de lei corretos na legislação (indique números de artigos do CPC, CLT ou CPP) mas não escreva o texto da fundamentação.
6. Revisão Construtiva de Peças: Se o aluno colar um rascunho de peça produzido por ele, avalie sob três aspectos e classifique sua resposta com cabeçalhos claros:
   - **REVISÃO ESTRUTURAL**: Verifique se ele incluiu endereçamento, qualificação das partes, pedidos obrigatórios, valor da causa, fechamento, etc.
   - **REVISÃO JURÍDICA**: Avalie se os argumentos fazem sentido, se ele cobriu as preliminares e méritos e aponte teses jurídicas não exploradas ou artigos que ele deve ler.
   - **REVISÃO DE REDAÇÃO**: Aponte falhas de clareza, repetição de palavras e deslizes gramaticais ou formais jurídicos.

BASE DE CONHECIMENTO VETORIAL RAG (CONTEÚDO DO SISTEMA):
Utilize estas informações de modelos estruturais, checklists e casos cadastrados pelo professor como referencial absoluto. Se o conteúdo abaixo estiver vazio, use sua base geral da legislação brasileira atualizada:
[CONTEXTO DE APOIO]
${ragContext || "Nenhum arquivo de contexto específico indexado no RAG para este caso no momento."}
[FIM DO CONTEXTO DE APOIO]

Responda sempre em Português do Brasil de forma didática, formal e encorajadora. Use formatação Markdown elegante.
`;

    // 5. Chamar a API de Chat do Gemini com Streaming via REST (fallback de modelos)
    let response: Response | null = null;
    let usedModel = "";

    for (const modelName of MODELS_TO_TRY) {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?key=${geminiApiKey}`;
      
      let retries = 2;
      let delay = 1500;

      for (let attempt = 1; attempt <= retries; attempt++) {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: contents,
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            generationConfig: {
              temperature: 0.3,
              topP: 0.95,
              maxOutputTokens: 2048
            }
          })
        });

        if (res.ok) {
          response = res;
          usedModel = modelName;
          break;
        }

        const status = res.status;

        // Se o modelo não existe (404), pular para o próximo modelo imediatamente
        if (status === 404) {
          console.warn(`Modelo ${modelName} não encontrado (404). Tentando o próximo modelo...`);
          break;
        }

        // Se é instabilidade temporária (503/429), tentar novamente
        if ((status === 503 || status === 429) && attempt < retries) {
          console.warn(`API do Gemini indisponível para ${modelName} (Status ${status}). Tentativa ${attempt}/${retries}. Aguardando ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }

        // Qualquer outro erro irreversível neste modelo
        const errorText = await res.text();
        console.error(`Erro no modelo ${modelName} (Status ${status}): ${errorText}`);
        break;
      }

      if (response) break;
    }

    if (!response || !response.ok) {
      throw new Error(`Nenhum modelo de IA disponível respondeu com sucesso. Modelos testados: ${MODELS_TO_TRY.join(', ')}.`);
    }

    console.log(`Modelo de IA utilizado com sucesso: ${usedModel}`);

    // 6. Dividir o stream do corpo da resposta do Gemini usando .tee()
    const [clientStream, serverStream] = response.body!.tee();

    // Ler e acumular o texto da IA no servidor de forma assíncrona para salvar no banco
    (async () => {
      try {
        const reader = serverStream.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          try {
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.trim().startsWith('{') || line.trim().startsWith(',')) {
                const cleanedLine = line.trim().replace(/^,/, '');
                try {
                  const parsed = JSON.parse(cleanedLine);
                  const textPart = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (textPart) {
                    accumulatedText += textPart;
                  }
                } catch (_) { /* Chunk JSON incompleto, ignorar */ }
              }
            }
          } catch (_) {
            const match = chunk.match(/"text"\s*:\s*"([^"]+)"/g);
            if (match) {
              match.forEach(m => {
                const txt = m.replace(/"text"\s*:\s*"/, '').replace(/"$/, '');
                accumulatedText += txt.replace(/\\n/g, '\n').replace(/\\"/g, '"');
              });
            }
          }
        }

        if (accumulatedText.trim()) {
          const { error: insertAiMsgErr } = await supabase
            .from('ai_messages')
            .insert({
              conversation_id: conversationId,
              role: 'assistant',
              content: accumulatedText.trim()
            });

          if (insertAiMsgErr) {
            console.error('Erro ao salvar resposta do assistente no banco:', insertAiMsgErr);
          }
        }
      } catch (err) {
        console.error('Falha ao processar e salvar stream da IA no servidor:', err);
      }
    })();

    // Retornar o stream original de volta para o cliente de forma assíncrona
    return new Response(clientStream, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error: any) {
    console.error('Erro na Edge Function chat-ai:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erro de processamento' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
