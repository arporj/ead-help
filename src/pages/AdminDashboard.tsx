import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  FileQuestion, 
  BookMarked, 
  MessageSquare, 
  Clock, 
  CornerDownRight, 
  Send,
  CheckCircle2
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { students, summaries, questions, supportMessages, respondSupportMessage } = useAuth();
  const [responseTexts, setResponseTexts] = useState<{ [key: string]: string }>({});

  const totalStudents = students.length;
  const totalSummaries = summaries.length;
  const totalQuestions = questions.length;
  const pendingSupport = supportMessages.filter(m => m.response === null).length;

  const handleResponseChange = (msgId: string, text: string) => {
    setResponseTexts(prev => ({ ...prev, [msgId]: text }));
  };

  const handleSendResponse = (msgId: string) => {
    const text = responseTexts[msgId];
    if (!text || !text.trim()) return;

    respondSupportMessage(msgId, text.trim());
    setResponseTexts(prev => {
      const updated = { ...prev };
      delete updated[msgId];
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Painel do Administrador</h2>
        <p className="text-gray-400 text-xs mt-1">Gerenciamento operacional e suporte aos alunos do Help EAD.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-brand-medium/10 border border-brand-medium/55 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-brand-light uppercase tracking-wider block">Total Alunos</span>
            <span className="text-3xl font-extrabold text-white block mt-1">{totalStudents}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-medium/30 flex items-center justify-center text-brand-light border border-brand-medium">
            <Users size={20} />
          </div>
        </div>

        {/* Total Questions */}
        <div className="bg-brand-medium/10 border border-brand-medium/55 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-brand-light uppercase tracking-wider block">Questões Cadastradas</span>
            <span className="text-3xl font-extrabold text-white block mt-1">{totalQuestions}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-medium/30 flex items-center justify-center text-brand-light border border-brand-medium">
            <FileQuestion size={20} />
          </div>
        </div>

        {/* Total Summaries */}
        <div className="bg-brand-medium/10 border border-brand-medium/55 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-brand-light uppercase tracking-wider block">Resumos PDFs</span>
            <span className="text-3xl font-extrabold text-white block mt-1">{totalSummaries}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-medium/30 flex items-center justify-center text-brand-light border border-brand-medium">
            <BookMarked size={20} />
          </div>
        </div>

        {/* Pending Support */}
        <div className="bg-brand-medium/10 border border-brand-medium/55 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-brand-light uppercase tracking-wider block">Suporte Pendente</span>
            <span className="text-3xl font-extrabold text-white block mt-1 flex items-center gap-2">
              {pendingSupport}
              {pendingSupport > 0 && <span className="w-2.5 h-2.5 bg-yellow-550 rounded-full animate-ping"></span>}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${pendingSupport > 0 ? 'bg-yellow-600/20 text-yellow-350 border-yellow-500/30' : 'bg-brand-medium/30 text-brand-light border-brand-medium'}`}>
            <MessageSquare size={20} />
          </div>
        </div>
      </div>

      {/* Support Messages Queue */}
      <div className="bg-brand-medium/10 border border-brand-medium/40 rounded-2xl overflow-hidden shadow-xl">
        <div className="border-b border-brand-medium/40 p-4 bg-brand-medium/20 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Clock size={16} className="text-brand-light" />
            Mensagens e Chamados de Suporte
          </h3>
          <span className="bg-brand-medium text-xs font-semibold px-2.5 py-0.5 rounded-full text-brand-light border border-brand-light/10">
            {supportMessages.length} total
          </span>
        </div>

        <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto">
          {supportMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              Nenhuma mensagem de suporte registrada.
            </div>
          ) : (
            supportMessages.map(msg => (
              <div key={msg.id} className="border border-brand-medium/40 bg-brand-dark/45 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-medium flex items-center justify-center font-bold text-xs text-brand-light uppercase">
                      {msg.studentName[0]}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-white block">{msg.studentName}</span>
                      <span className="text-[9px] text-gray-400 block">{new Date(msg.createdAt).toLocaleDateString()} às {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                  {msg.response ? (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-green-950 text-green-300 border border-green-500/20 px-2.5 py-0.5 rounded-full font-bold">
                      <CheckCircle2 size={10} /> Respondido
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-yellow-950 text-yellow-350 border border-yellow-500/20 px-2.5 py-0.5 rounded-full font-bold">
                      Aguardando resposta
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-200 bg-brand-medium/10 border border-brand-medium/20 p-2.5 rounded-lg leading-relaxed">
                  {msg.message}
                </div>

                {/* Response render */}
                {msg.response ? (
                  <div className="flex gap-2 text-xs text-brand-light bg-brand-medium/20 p-3 rounded-lg border border-brand-medium/40 ml-4">
                    <CornerDownRight size={16} className="shrink-0 text-brand-light" />
                    <div>
                      <span className="font-bold text-[10px] text-white block mb-0.5">Resposta do Admin:</span>
                      <p className="leading-relaxed text-gray-300">{msg.response}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 items-end ml-4">
                    <div className="flex-1">
                      <textarea
                        rows={2}
                        placeholder="Escreva a resposta de suporte..."
                        value={responseTexts[msg.id] || ''}
                        onChange={(e) => handleResponseChange(msg.id, e.target.value)}
                        className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl p-2.5 text-xs focus:border-brand-light focus:outline-none placeholder:text-gray-500"
                      />
                    </div>
                    <button
                      onClick={() => handleSendResponse(msg.id)}
                      disabled={!responseTexts[msg.id]?.trim()}
                      className="bg-brand-light hover:bg-white text-brand-dark p-2.5 rounded-xl transition-all disabled:opacity-50 shrink-0 shadow-md shadow-brand-light/5"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
