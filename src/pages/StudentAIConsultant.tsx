import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Send, Sparkles, User, ArrowLeft, Loader2, Shield, Scale, BookOpen, AlertCircle, FileCheck, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface ChatMessage {
  id: string;
  sender: 'student' | 'ai';
  text: string;
  timestamp: Date;
}

export const StudentAIConsultant: React.FC = () => {
  const { studentProfile, user } = useAuth();
  const navigate = useNavigate();

  // Estados principais
  const [selectedDiscipline, setSelectedDiscipline] = useState<'civil' | 'penal' | 'trabalhista' | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeReviewTabs, setActiveReviewTabs] = useState<{ [msgId: string]: 'structural' | 'juridical' | 'redaction' }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAccess = studentProfile?.aiConsultantAccess || studentProfile?.plan === 'premium';

  // Rolar para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Função para carregar ou criar conversa com base na disciplina selecionada
  const handleSelectDiscipline = async (disc: 'civil' | 'penal' | 'trabalhista') => {
    if (!user) return;
    setIsTyping(true);
    setSelectedDiscipline(disc);
    setMessages([]);

    try {
      // Buscar se já existe uma conversa ativa dessa disciplina nas últimas 24 horas
      const { data: existingConversations, error: fetchErr } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('student_id', user.id)
        .eq('discipline', disc)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchErr) throw fetchErr;

      let activeConvId = null;

      if (existingConversations && existingConversations.length > 0) {
        const lastConv = existingConversations[0];
        const ageInMs = Date.now() - new Date(lastConv.created_at).getTime();
        const oneDayInMs = 24 * 60 * 60 * 1000;
        
        // Se a conversa tem menos de 24 horas, reusamos o histórico
        if (ageInMs < oneDayInMs) {
          activeConvId = lastConv.id;
          setConversationId(activeConvId);

          // Carregar histórico de mensagens
          const { data: historyMsgs, error: msgsErr } = await supabase
            .from('ai_messages')
            .select('*')
            .eq('conversation_id', activeConvId)
            .order('created_at', { ascending: true });

          if (msgsErr) throw msgsErr;

          if (historyMsgs && historyMsgs.length > 0) {
            setMessages(historyMsgs.map(m => ({
              id: m.id,
              sender: m.role === 'user' ? 'student' : 'ai',
              text: m.content,
              timestamp: new Date(m.created_at)
            })));
          }
        }
      }

      // Se não há conversa recente, criamos uma nova
      if (!activeConvId) {
        const discTitle = disc === 'civil' ? 'Prática Civil' : disc === 'penal' ? 'Prática Penal' : 'Prática Trabalhista';
        const { data: newConv, error: createErr } = await supabase
          .from('ai_conversations')
          .insert({
            student_id: user.id,
            title: `Mentor IA - ${discTitle}`,
            discipline: disc
          })
          .select()
          .single();

        if (createErr) throw createErr;
        if (newConv) {
          setConversationId(newConv.id);
          // Mensagem inicial de boas-vindas do Mentor
          const welcomeMsg = disc === 'civil' 
            ? 'Olá! Sou seu Mentor Jurídico IA de Prática Civil. Para começarmos, por favor cole aqui o caso concreto fornecido pelo seu professor ou tire suas dúvidas sobre a elaboração de peças processuais cíveis (Petição Inicial, Contestação, Recursos, etc.).'
            : disc === 'penal'
            ? 'Olá! Sou seu Mentor Jurídico IA de Prática Penal. Vamos trabalhar juntos na elaboração e revisão de peças criminais (Queixa-Crime, Resposta à Acusação, Memoriais, Habeas Corpus, etc.). Cole aqui seu caso ou envie sua dúvida.'
            : 'Olá! Sou seu Mentor Jurídico IA de Prática Trabalhista. Estou pronto para ajudar na estruturação e correção de Reclamações Trabalhistas, Contestações, Recursos Ordinários e outras peças da área. Como posso te auxiliar hoje?';

          // Gravar boas-vindas no banco
          await supabase.from('ai_messages').insert({
            conversation_id: newConv.id,
            role: 'assistant',
            content: welcomeMsg
          });

          setMessages([{
            id: 'welcome',
            sender: 'ai',
            text: welcomeMsg,
            timestamp: new Date()
          }]);
        }
      }
    } catch (err: any) {
      console.error('Erro ao inicializar mentor:', err);
      alert('Falha ao conectar com o Mentor de IA. Por favor, tente novamente.');
      setSelectedDiscipline(null);
    } finally {
      setIsTyping(false);
    }
  };

  // Envio de mensagem com streaming (SSE)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping || !selectedDiscipline || !conversationId) return;

    const studentText = inputText.trim();
    const studentMsgId = `usr-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: studentMsgId,
      sender: 'student',
      text: studentText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    // Adiciona uma bolha vazia para a IA receber o streaming
    const aiMsgId = `ai-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      timestamp: new Date()
    }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada. Faça login novamente.');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || ''}/functions/v1/chat-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          conversationId,
          message: studentText,
          discipline: selectedDiscipline
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Falha na resposta do servidor.');
      }

      if (!response.body) throw new Error('Corpo da resposta vazio.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        try {
          // O streaming do Gemini via Edge Function pode retornar blocos JSON formatados do SSE
          // Limpamos possíveis vírgulas de array e tentamos extrair o texto de maneira segura
          const cleanChunk = chunk.trim();
          const textMatches = cleanChunk.match(/"text"\s*:\s*"([^"]+)"/g);
          
          if (textMatches) {
            textMatches.forEach(m => {
              const txt = m.replace(/"text"\s*:\s*"/, '').replace(/"$/, '');
              aiText += txt.replace(/\\n/g, '\n').replace(/\\"/g, '"');
            });
          } else {
            // Fallback para texto plano se a Edge Function mandar direto
            aiText += chunk;
          }
        } catch (e) {
          aiText += chunk;
        }

        // Atualizar a última mensagem da IA com o texto acumulado em tempo real
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.id === aiMsgId) {
            lastMsg.text = aiText;
          }
          return updated;
        });
      }

    } catch (err: any) {
      console.error('Erro no chat streaming:', err);
      // Remover a bolha vazia em caso de erro e exibir mensagem amigável
      setMessages(prev => prev.filter(m => m.id !== aiMsgId));
      alert(`Erro na comunicação com a IA: ${err.message || 'Verifique sua conexão.'}`);
    } finally {
      setIsTyping(false);
    }
  };

  // Função para parsear a mensagem e ver se ela é uma revisão dividida em abas
  const parseReviewMessage = (text: string) => {
    const hasStructural = text.includes('REVISÃO ESTRUTURAL');
    const hasJuridical = text.includes('REVISÃO JURÍDICA');
    const hasRedaction = text.includes('REVISÃO DE REDAÇÃO');

    if (!hasStructural && !hasJuridical && !hasRedaction) {
      return { isReview: false, content: text };
    }

    // Extrair cada seção usando Regex de busca até a próxima seção ou fim da string
    const structuralMatch = text.match(/REVISÃO ESTRUTURAL:?([\s\S]*?)(?=REVISÃO JURÍDICA|REVISÃO DE REDAÇÃO|$)/i);
    const juridicalMatch = text.match(/REVISÃO JURÍDICA:?([\s\S]*?)(?=REVISÃO ESTRUTURAL|REVISÃO DE REDAÇÃO|$)/i);
    const redactionMatch = text.match(/REVISÃO DE REDAÇÃO:?([\s\S]*?)(?=REVISÃO ESTRUTURAL|REVISÃO JURÍDICA|$)/i);

    const cleanMatch = (match: RegExpMatchArray | null) => {
      if (!match) return 'Nenhum apontamento nesta categoria.';
      return match[1]
        .replace(/^\s*\*\*:\*\*\s*/, '') // Limpar caracteres de escape
        .replace(/^\s*\*:\*\s*/, '')
        .trim();
    };

    return {
      isReview: true,
      structural: cleanMatch(structuralMatch),
      juridical: cleanMatch(juridicalMatch),
      redaction: cleanMatch(redactionMatch)
    };
  };

  // Se o aluno não tiver acesso Premium ou avulso à IA
  if (!hasAccess) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Mentor Jurídico IA</h2>
          <p className="text-gray-400 text-xs mt-1">Seu orientador virtual exclusivo para elaboração de peças processuais.</p>
        </div>

        <div className="bg-brand-medium/10 border border-brand-medium/40 p-8 rounded-2xl text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-yellow-500/25 border border-yellow-500/20 text-yellow-350 flex items-center justify-center rounded-2xl mx-auto shadow-lg">
            <BrainCircuit size={30} className="animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-white">Mentor Jurídico Indisponível</h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
              Sua conta atual não possui acesso à Inteligência Artificial. Você pode atualizar seu plano para Premium ou solicitar o acesso individual com o seu orientador.
            </p>
          </div>

          <div className="border border-brand-medium/55 bg-brand-dark/20 rounded-xl p-4 text-xs text-gray-300 max-w-sm mx-auto text-left space-y-2">
            <span className="font-bold text-brand-light flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
              <Sparkles size={12} className="text-yellow-400" /> Benefícios do Mentor Jurídico:
            </span>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>Orientação socrática 24 horas por dia para peças processuais.</li>
              <li>Apoio em Prática Civil, Prática Penal e Prática Trabalhista.</li>
              <li>Revisões automáticas divididas em abas: Estrutura, Direito e Redação.</li>
              <li>Base de modelos e checklists cadastrados por seus professores.</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/student/plans')}
            className="bg-brand-light hover:bg-white text-brand-dark px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-light/5 inline-flex items-center gap-2 cursor-pointer"
          >
            Ver Planos e Valores <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // 1. TELA DE SELEÇÃO DE DISCIPLINA PRÁTICA (Civil, Penal, Trabalhista)
  if (!selectedDiscipline) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Scale className="text-brand-light" size={24} />
            Mentor Jurídico IA
          </h2>
          <p className="text-gray-450 text-xs mt-1">
            Selecione a matéria de Prática Jurídica que deseja estudar hoje para iniciar sua orientação socrática com o Mentor virtual.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Prática Civil */}
          <div 
            onClick={() => handleSelectDiscipline('civil')}
            className="bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl flex flex-col justify-between hover:border-brand-light/60 hover:bg-brand-medium/20 transition-all cursor-pointer group shadow-lg"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <h3 className="font-bold text-base text-white group-hover:text-brand-light transition-colors">Prática Civil</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Auxílio na estruturação de Petições Iniciais, Contestações, Réplicas e recursos sob as regras do Código de Processo Civil (CPC).
              </p>
            </div>
            <button className="mt-6 w-full bg-brand-medium hover:bg-brand-light hover:text-brand-dark text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all">
              Acessar Mentor <ChevronRight size={14} />
            </button>
          </div>

          {/* Card Prática Penal */}
          <div 
            onClick={() => handleSelectDiscipline('penal')}
            className="bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl flex flex-col justify-between hover:border-brand-light/60 hover:bg-brand-medium/20 transition-all cursor-pointer group shadow-lg"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                <Shield size={24} />
              </div>
              <h3 className="font-bold text-base text-white group-hover:text-brand-light transition-colors">Prática Penal</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Orientação na elaboração de Queixas-Crimes, Respostas à Acusação, Memoriais e Habeas Corpus baseados no Código Penal e CPP.
              </p>
            </div>
            <button className="mt-6 w-full bg-brand-medium hover:bg-brand-light hover:text-brand-dark text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all">
              Acessar Mentor <ChevronRight size={14} />
            </button>
          </div>

          {/* Card Prática Trabalhista */}
          <div 
            onClick={() => handleSelectDiscipline('trabalhista')}
            className="bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl flex flex-col justify-between hover:border-brand-light/60 hover:bg-brand-medium/20 transition-all cursor-pointer group shadow-lg"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                <Scale size={24} />
              </div>
              <h3 className="font-bold text-base text-white group-hover:text-brand-light transition-colors">Prática Trabalhista</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Orientação e checklists na confecção de Reclamações Trabalhistas, Contestações e Recursos Ordinários em conformidade com a CLT.
              </p>
            </div>
            <button className="mt-6 w-full bg-brand-medium hover:bg-brand-light hover:text-brand-dark text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all">
              Acessar Mentor <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. TELA DO CHAT DE CONVERSA COM O MENTOR
  const disciplineTitle = selectedDiscipline === 'civil' ? 'Prática Civil' : selectedDiscipline === 'penal' ? 'Prática Penal' : 'Prática Trabalhista';

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[650px] border border-brand-medium/40 bg-brand-medium/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header do Chat */}
      <div className="bg-brand-medium/20 border-b border-brand-medium/40 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setSelectedDiscipline(null); setConversationId(null); setMessages([]); }}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-brand-medium/30 transition-all cursor-pointer"
            title="Voltar para matérias"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-10 h-10 rounded-xl bg-brand-medium flex items-center justify-center border border-brand-light/25 text-brand-light relative">
            <BrainCircuit size={20} className="animate-pulse" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-brand-dark rounded-full"></span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              {disciplineTitle}
              <Sparkles size={12} className="text-yellow-400" />
            </h3>
            <span className="text-[10px] text-gray-450 block">Modo Professor Orientador (Socrático)</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[9px] bg-red-950/45 text-red-300 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">
            HISTÓRICO EXPIRA EM 7 DIAS
          </span>
          <span className="text-[9px] bg-green-950/45 text-green-300 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">
            MENTOR ATIVO
          </span>
        </div>
      </div>

      {/* Área de Mensagens do Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => {
          const isAI = msg.sender === 'ai';
          const review = isAI ? parseReviewMessage(msg.text) : { isReview: false, content: msg.text };

          return (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isAI ? 'self-start' : 'self-end flex-row-reverse ml-auto'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 text-xs ${isAI ? 'bg-brand-medium/40 border-brand-medium text-brand-light' : 'bg-brand-light border-brand-light text-brand-dark font-bold'}`}>
                {isAI ? <BrainCircuit size={16} /> : <User size={16} />}
              </div>
              
              <div className={`p-4 rounded-2xl text-xs leading-relaxed ${isAI ? 'bg-brand-medium/20 border border-brand-medium/40 text-gray-200 rounded-tl-none' : 'bg-brand-medium text-white rounded-tr-none'}`}>
                {/* RENDERIZAÇÃO SE FOR UMA REVISÃO DIVIDIDA EM ABAS */}
                {review.isReview ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 text-brand-light font-bold pb-2 border-b border-brand-medium/45 uppercase text-[10px] tracking-wide">
                      <FileCheck size={14} /> Avaliação Conceitual do Rascunho
                    </div>
                    
                    {/* Botões de abas */}
                    <div className="flex gap-2 bg-brand-dark/40 p-0.5 rounded-xl border border-brand-medium/50">
                      <button
                        onClick={() => setActiveReviewTabs(prev => ({ ...prev, [msg.id]: 'structural' }))}
                        className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                          (activeReviewTabs[msg.id] || 'structural') === 'structural'
                            ? 'bg-brand-light text-brand-dark shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        1. Estrutural
                      </button>
                      <button
                        onClick={() => setActiveReviewTabs(prev => ({ ...prev, [msg.id]: 'juridical' }))}
                        className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                          activeReviewTabs[msg.id] === 'juridical'
                            ? 'bg-brand-light text-brand-dark shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        2. Direito/Teses
                      </button>
                      <button
                        onClick={() => setActiveReviewTabs(prev => ({ ...prev, [msg.id]: 'redaction' }))}
                        className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                          activeReviewTabs[msg.id] === 'redaction'
                            ? 'bg-brand-light text-brand-dark shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        3. Redação/Erros
                      </button>
                    </div>

                    {/* Conteúdo da aba selecionada */}
                    <div className="text-[11px] leading-relaxed whitespace-pre-line text-gray-250 animate-in fade-in duration-200">
                      {(activeReviewTabs[msg.id] || 'structural') === 'structural' && (
                        <div className="space-y-1.5">
                          <span className="font-semibold text-brand-light text-[10px] uppercase block">Checklist da Estrutura Formal:</span>
                          {review.structural}
                        </div>
                      )}
                      {activeReviewTabs[msg.id] === 'juridical' && (
                        <div className="space-y-1.5">
                          <span className="font-semibold text-brand-light text-[10px] uppercase block">Análise das Teses e Fundamentos:</span>
                          {review.juridical}
                        </div>
                      )}
                      {activeReviewTabs[msg.id] === 'redaction' && (
                        <div className="space-y-1.5">
                          <span className="font-semibold text-brand-light text-[10px] uppercase block">Feedback Linguístico e Ortografia:</span>
                          {review.redaction}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* RENDERIZAÇÃO DE DIÁLOGO COMUM EM MARKDOWN */
                  <div className="whitespace-pre-line select-text selection:bg-brand-light selection:text-brand-dark">
                    {msg.text || (
                      <span className="text-gray-500 italic flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mentor analisando caso...
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isTyping && messages[messages.length - 1]?.text !== '' && (
          <div className="flex gap-3 max-w-[85%] self-start">
            <div className="w-8 h-8 rounded-lg bg-brand-medium/40 border border-brand-medium text-brand-light flex items-center justify-center shrink-0">
              <BrainCircuit size={16} />
            </div>
            <div className="bg-brand-medium/10 border border-brand-medium/20 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 bg-brand-light rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-brand-light rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-brand-light rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Caixa de Texto do Chat */}
      <form onSubmit={handleSendMessage} className="bg-brand-dark/40 border-t border-brand-medium/40 p-4 flex gap-2">
        <input
          type="text"
          required
          disabled={isTyping}
          placeholder={messages.length <= 2 
            ? "Cole aqui o caso concreto do professor para iniciarmos..." 
            : "Digite sua dúvida de peça, fundamentação ou cole um parágrafo para revisar..."
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-brand-dark border border-brand-medium/60 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-light focus:outline-none placeholder:text-gray-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isTyping || !inputText.trim()}
          className="bg-brand-light hover:bg-white text-brand-dark px-4 py-3 rounded-xl transition-all disabled:opacity-50 shadow-md shadow-brand-light/5 flex items-center justify-center cursor-pointer"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};
