import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BrainCircuit, Send, Sparkles, User, ArrowRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'student' | 'ai';
  text: string;
  timestamp: Date;
}

export const StudentAIConsultant: React.FC = () => {
  const { studentProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Olá! Sou seu Consultor Virtual de Inteligência Artificial. Estou treinado com toda a base de PDFs acadêmicos e leis oficiais disponibilizados pela sua instituição. Como posso ajudar nas suas dúvidas hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasAccess = studentProfile?.aiConsultantAccess || studentProfile?.plan === 'premium';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userQuery = inputText.trim();
    const newMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'student',
      text: userQuery,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate RAG Search and Gemini API Response
    setTimeout(() => {
      let responseText = '';
      const queryLower = userQuery.toLowerCase();

      if (queryLower.includes('constitucional') || queryLower.includes('remedio') || queryLower.includes('habeas') || queryLower.includes('segurança')) {
        responseText = 'Analisando a base de dados em [Constituicao_Federal_88.pdf]:\n\nNo Direito Constitucional, os remédios constitucionais são garantias destinadas a assegurar os direitos dos indivíduos contra abusos de poder ou ilegalidades:\n- **Habeas Corpus:** Adequado para proteger a liberdade de locomoção (ir e vir).\n- **Habeas Data:** Protege o direito à informação de caráter pessoal.\n- **Mandado de Segurança:** Protege direito líquido e certo não amparado por HC ou HD.\n- **Ação Popular:** Proposta por qualquer cidadão para anular ato lesivo ao patrimônio público.';
      } else if (queryLower.includes('crime') || queryLower.includes('culposo') || queryLower.includes('dolo') || queryLower.includes('ilice') || queryLower.includes('defesa')) {
        responseText = 'Analisando a base de dados em [Codigo_Penal_Brasileiro.pdf]:\n\nDe acordo com o Código Penal Brasileiro (Art. 18):\n- **Crime Doloso:** Ocorre quando o agente quis o resultado ou assumiu o risco de produzi-lo.\n- **Crime Culposo:** Ocorre quando o agente deu causa ao resultado por imprudência, negligência ou imperícia.\n\nEm relação à ilicitude, o Art. 23 prevê as excludentes: legítima defesa, estado de necessidade, estrito cumprimento do dever legal e exercício regular de direito.';
      } else if (queryLower.includes('taylor') || queryLower.includes('fayol') || queryLower.includes('administra') || queryLower.includes('tga') || queryLower.includes('escola')) {
        responseText = 'Analisando a base de dados em [Escola Clássica da Administração]:\n\nA teoria clássica/científica da administração foca na produtividade:\n- **Frederick Taylor:** Criador da Administração Científica, focou no nível operacional e no estudo de tempos e movimentos para eliminar desperdícios.\n- **Henri Fayol:** Criador da Teoria Clássica, focou na estrutura organizacional, definindo as funções administrativas (prever, organizar, comandar, coordenar e controlar).';
      } else {
        responseText = 'Infelizmente, como seu consultor virtual acadêmico, sou instruído a responder apenas sobre assuntos que estejam estritamente documentados nos PDFs oficiais da nossa base (Constituição Federal, Código Penal, Teoria da Administração). \n\nPor favor, reformule sua pergunta sobre estes temas de estudo!';
      }

      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  if (!hasAccess) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Consultor de IA</h2>
          <p className="text-gray-400 text-xs mt-1">Converse com nosso tutor inteligente de dúvidas acadêmicas.</p>
        </div>

        <div className="bg-brand-medium/10 border border-brand-medium/40 p-8 rounded-2xl text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-yellow-500/25 border border-yellow-500/20 text-yellow-350 flex items-center justify-center rounded-2xl mx-auto shadow-lg">
            <BrainCircuit size={30} className="animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-white">Consultor de IA Indisponível</h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
              Sua conta atual não possui acesso à Inteligência Artificial. Você pode fazer o upgrade de seu plano ou comprar este recurso separadamente.
            </p>
          </div>

          <div className="border border-brand-medium/55 bg-brand-dark/20 rounded-xl p-4 text-xs text-gray-300 max-w-sm mx-auto text-left space-y-2">
            <span className="font-bold text-brand-light flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
              <Sparkles size={12} className="text-yellow-400" /> Vantagens do Consultor IA:
            </span>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>Respostas em tempo real 24/7 sobre as disciplinas.</li>
              <li>Fundamentado nas leis e livros específicos do seu curso.</li>
              <li>Explicações simplificadas e exemplos práticos dirigidos.</li>
            </ul>
          </div>

          <button
            onClick={() => alert('Para adquirir o acesso avulso à IA neste MVP, mude seu perfil no painel flutuante para Aluno Premium ou abra o painel de administrador e libere a IA para João/Maria!')}
            className="bg-brand-light hover:bg-white text-brand-dark px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-light/5 inline-flex items-center gap-2"
          >
            Adquirir Módulo de IA <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[600px] border border-brand-medium/40 bg-brand-medium/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="bg-brand-medium/20 border-b border-brand-medium/40 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-medium flex items-center justify-center border border-brand-light/25 text-brand-light relative">
            <BrainCircuit size={20} className="animate-pulse" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-brand-dark rounded-full"></span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              Tutor Virtual Inteligente
              <Sparkles size={12} className="text-yellow-400" />
            </h3>
            <span className="text-[10px] text-gray-450 block">Treinado com 2 documentos oficiais do curso</span>
          </div>
        </div>
        
        <span className="text-[9px] bg-green-950/45 text-green-300 border border-green-500/20 px-2.5 py-0.5 rounded-full font-bold">
          RAG ATIVO
        </span>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => {
          const isAI = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isAI ? 'self-start' : 'self-end flex-row-reverse ml-auto'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 text-xs ${isAI ? 'bg-brand-medium/40 border-brand-medium text-brand-light' : 'bg-brand-light border-brand-light text-brand-dark font-bold'}`}>
                {isAI ? <BrainCircuit size={16} /> : <User size={16} />}
              </div>
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${isAI ? 'bg-brand-medium/20 border border-brand-medium/40 text-gray-255 rounded-tl-none' : 'bg-brand-medium text-white rounded-tr-none'}`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        {isTyping && (
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

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="bg-brand-dark/40 border-t border-brand-medium/40 p-4 flex gap-2">
        <input
          type="text"
          required
          disabled={isTyping}
          placeholder="Pergunte sobre Direito Constitucional, Penal ou TGA..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-brand-dark border border-brand-medium/60 rounded-xl px-4 py-2.5 text-xs text-white focus:border-brand-light focus:outline-none placeholder:text-gray-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isTyping || !inputText.trim()}
          className="bg-brand-light hover:bg-white text-brand-dark p-2.5 rounded-xl transition-all disabled:opacity-50 shadow-md shadow-brand-light/5"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
