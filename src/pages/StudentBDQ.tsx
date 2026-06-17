import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Printer, Lock } from 'lucide-react';

export const StudentBDQ: React.FC = () => {
  const { studentProfile, questions, subjects, courses } = useAuth();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  const plan = studentProfile?.plan || 'basic';
  const hasAccess = plan === 'pro' || plan === 'premium';

  // Filter questions based on plan access:
  // - basic: no access (block screen)
  // - pro: only simulado questions
  // - premium: simulado + prova questions
  const allowedQuestions = questions.filter(q => {
    if (!hasAccess) return false;
    
    // Pro sees only simulado. Premium sees everything
    if (plan === 'pro' && q.type !== 'simulado') return false;

    if (selectedSubjectId === 'all') return true;
    return q.subjectId === selectedSubjectId;
  });

  const handlePrint = () => {
    window.print();
  };

  if (!hasAccess) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Banco de Questões (BDQ)</h2>
          <p className="text-gray-400 text-xs mt-1">Gere cadernos de questões limpos com gabarito para impressão.</p>
        </div>

        <div className="bg-brand-medium/10 border border-brand-medium/40 p-8 rounded-2xl text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-red-950/30 border border-red-500/20 text-red-400 flex items-center justify-center rounded-2xl mx-auto">
            <Lock size={30} />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-white">Acesso Restrito</h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
              O Banco de Questões (BDQ) com respostas diretas e suporte à impressão é exclusivo para assinantes **Pro** e **Premium**.
            </p>
          </div>

          <div className="border border-brand-medium/55 bg-brand-dark/20 rounded-xl p-4 text-xs text-gray-300 max-w-sm mx-auto">
            <span className="font-bold text-brand-light block mb-1">O que é o BDQ?</span>
            Uma listagem limpa de questões contendo apenas a pergunta e a resposta gabaritada. Ideal para imprimir, ler fora da tela e memorizar com estudos focados.
          </div>

          <div className="pt-2 text-xs text-brand-light font-bold">
            Upgrade para o plano Pro a partir de R$ 29/mês para liberar o BDQ.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header (Hidden in Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="text-brand-light" size={24} />
            Banco de Questões (BDQ)
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Gabarito direto (apenas enunciado + resposta correta) formatado para estudo de memorização rápida.
          </p>
        </div>

        <button
          onClick={handlePrint}
          disabled={allowedQuestions.length === 0}
          className="bg-brand-light hover:bg-white text-brand-dark px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-brand-light/5 disabled:opacity-50 self-start sm:self-auto"
        >
          <Printer size={16} /> Imprimir / Salvar PDF
        </button>
      </div>

      {/* Filter Panel (Hidden in Print) */}
      <div className="print:hidden bg-brand-medium/10 border border-brand-medium/40 p-4 rounded-xl flex items-center gap-4">
        <label className="text-xs font-bold text-brand-light uppercase shrink-0">Filtrar por Disciplina:</label>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="bg-brand-dark border border-brand-medium/60 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-brand-light focus:outline-none max-w-xs"
        >
          <option value="all">Todas as Disciplinas</option>
          {subjects.map(sub => {
            const course = courses.find(c => c.id === sub.courseId);
            return (
              <option key={sub.id} value={sub.id}>
                {course?.name.substring(0, 10)}... - {sub.name}
              </option>
            );
          })}
        </select>
      </div>

      {/* Print-only Header (Visible only when Printing) */}
      <div className="hidden print:block text-black mb-8 border-b-2 border-black pb-4 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">EAD HELP - BANCO DE QUESTÕES (BDQ)</h1>
        <p className="text-xs font-medium mt-1">
          Plano de Acesso: {plan.toUpperCase()} &bull; Filtro: {selectedSubjectId === 'all' ? 'Todas as Disciplinas' : subjects.find(s => s.id === selectedSubjectId)?.name}
        </p>
        <p className="text-[10px] text-gray-500 mt-0.5">Gerado em: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Questions list */}
      <div className="space-y-4 print:space-y-6 print:text-black">
        {allowedQuestions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs print:hidden">
            Nenhuma questão disponível para esta disciplina com o seu plano de acesso.
          </div>
        ) : (
          allowedQuestions.map((q, idx) => {
            const subject = subjects.find(s => s.id === q.subjectId);
            const correctText = q.options[q.correctAnswerIndex];

            return (
              <div 
                key={q.id} 
                className="bg-brand-medium/10 border border-brand-medium/40 p-5 rounded-2xl space-y-2.5 hover:border-brand-light/30 transition-all print:bg-white print:border-none print:p-0 print:border-b print:border-gray-200 print:rounded-none print:pb-4"
              >
                <div className="flex items-center justify-between text-[10px] print:text-xs">
                  <span className="font-bold text-brand-light print:text-gray-650">
                    QUESTÃO {idx + 1}
                  </span>
                  <div className="flex items-center gap-1.5 print:hidden">
                    <span className="bg-brand-medium/45 text-brand-light px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                      {subject?.name}
                    </span>
                    {q.type === 'prova' && (
                      <span className="bg-yellow-600/35 text-yellow-350 border border-yellow-500/20 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                        Prova Oficial
                      </span>
                    )}
                  </div>
                  <span className="hidden print:inline text-gray-500 text-[10px]">
                    Disciplina: {subject?.name}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-white print:text-black leading-relaxed font-semibold">
                  {q.prompt}
                </p>

                <div className="text-xs bg-green-950/15 border border-green-500/20 text-green-300 p-3 rounded-xl flex items-start gap-1.5 print:bg-gray-100 print:text-black print:border-l-4 print:border-black print:rounded-none">
                  <span className="font-bold shrink-0">Resposta Correta:</span>
                  <span>{correctText}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
