import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Send, MessageSquare, Clock, CornerDownRight, CheckCircle2 } from 'lucide-react';

export const StudentSupport: React.FC = () => {
  const { user, supportMessages, sendSupportMessage } = useAuth();
  const location = useLocation();
  const [messageText, setMessageText] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (location.state && (location.state as any).message) {
      setMessageText((location.state as any).message);
    }
  }, [location.state]);

  // Filter messages belonging only to the current logged student
  const myMessages = supportMessages.filter(msg => msg.studentId === user?.id);

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendSupportMessage(messageText.trim());
    setMessageText('');
    setSuccessMsg('Mensagem enviada com sucesso! O administrador responderá em breve.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="text-brand-light" size={24} />
          Central de Suporte
        </h2>
        <p className="text-gray-400 text-xs mt-1">
          Envie dúvidas, feedbacks ou solicitações operacionais diretamente para a equipe administrativa do portal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Contact Form */}
        <div className="md:col-span-5 bg-brand-medium/10 border border-brand-medium/40 p-5 rounded-2xl shadow-xl h-fit">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-3.5">
            Nova Mensagem
          </h3>

          {successMsg && (
            <div className="bg-green-950/35 border border-green-500/35 text-green-300 px-3 py-2 rounded-xl text-[11px] mb-4 flex items-center gap-1.5 leading-relaxed">
              <CheckCircle2 size={16} className="text-green-400 shrink-0" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmitMessage} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                Descreva sua Dúvida ou Problema
              </label>
              <textarea
                required
                rows={4}
                placeholder="Escreva sua mensagem com o máximo de detalhes..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl p-3 text-xs text-white focus:border-brand-light focus:outline-none placeholder:text-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={!messageText.trim()}
              className="w-full bg-brand-light hover:bg-white text-brand-dark py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-55 shadow-md shadow-brand-light/5 flex items-center justify-center gap-2"
            >
              <Send size={12} /> Enviar Mensagem
            </button>
          </form>
        </div>

        {/* Right: Message History */}
        <div className="md:col-span-7 bg-brand-medium/10 border border-brand-medium/40 p-5 rounded-2xl shadow-xl flex flex-col h-[480px]">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-3.5">
            <Clock size={16} className="text-brand-light" />
            Meus Chamados Enviados ({myMessages.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5">
            {myMessages.length === 0 ? (
              <div className="text-center py-16 text-gray-550 text-xs">
                Você ainda não enviou nenhuma mensagem de suporte.
              </div>
            ) : (
              myMessages.map(msg => (
                <div key={msg.id} className="border border-brand-medium/40 bg-brand-dark/25 p-3.5 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-400">
                      {new Date(msg.createdAt).toLocaleDateString()} &bull; {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    {msg.response ? (
                      <span className="text-[8px] bg-green-950 text-green-300 border border-green-500/20 px-2.5 py-0.5 rounded-full font-bold">
                        Respondido
                      </span>
                    ) : (
                      <span className="text-[8px] bg-brand-medium text-brand-light border border-brand-light/10 px-2.5 py-0.5 rounded-full font-bold">
                        Em análise
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-250 leading-relaxed bg-brand-medium/5 p-2 rounded-lg border border-brand-medium/10">
                    {msg.message}
                  </p>

                  {msg.response && (
                    <div className="flex gap-1.5 text-xs text-brand-light bg-brand-medium/20 p-2.5 rounded-lg border border-brand-medium/45 ml-3">
                      <CornerDownRight size={14} className="shrink-0 text-brand-light mt-0.5" />
                      <div>
                        <span className="font-bold text-[9px] text-white block mb-0.5">Resposta do Admin:</span>
                        <p className="leading-relaxed text-gray-300">{msg.response}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
