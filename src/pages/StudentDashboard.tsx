import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Lock, CheckCircle2, ChevronRight, CornerUpLeft, Download } from 'lucide-react';
import type { Summary } from '../types';

export const StudentDashboard: React.FC = () => {
  const { studentProfile, summaries, subjects, courses } = useAuth();
  const [readingSummary, setReadingSummary] = useState<Summary | null>(null);

  const getHasAccess = (sum: Summary) => {
    if (!sum.isPremium) return true; // Free summary
    if (!studentProfile) return false;
    if (studentProfile.plan === 'premium') return true; // Premium plan has total access
    // Otherwise check manual purchase release
    return studentProfile.summaryAccess.includes(sum.id);
  };

  const handleRead = (sum: Summary) => {
    if (getHasAccess(sum)) {
      setReadingSummary(sum);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Meus Estudos</h2>
        <p className="text-gray-400 text-xs mt-1">
          Acesse os resumos em PDF autorizados para o seu perfil de estudos.
        </p>
      </div>

      {readingSummary ? (
        /* PDF Viewer Pane */
        <div className="bg-brand-medium/10 border border-brand-medium/50 rounded-2xl p-6 space-y-4 shadow-2xl relative">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setReadingSummary(null)}
              className="flex items-center gap-1.5 text-xs text-brand-light hover:text-white transition-colors"
            >
              <CornerUpLeft size={16} /> Voltar aos Resumos
            </button>
            
            {readingSummary.pdfUrl && readingSummary.pdfUrl !== '#' && (
              <a
                href={readingSummary.pdfUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs bg-brand-light hover:bg-white text-brand-dark px-3 py-1.5 rounded-lg font-bold transition-all"
              >
                <Download size={14} /> Baixar PDF
              </a>
            )}
          </div>
          
          <div className="pb-3 border-b border-brand-medium/40">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="text-brand-light" size={20} />
              {readingSummary.title}
            </h3>
            <p className="text-xs text-gray-400 mt-1">{readingSummary.description}</p>
          </div>

          {/* Document pages content (Real PDF Viewer) */}
          <div className="bg-brand-dark/50 border border-brand-medium/30 rounded-xl overflow-hidden shadow-inner h-[550px] relative">
            {readingSummary.pdfUrl && readingSummary.pdfUrl !== '#' ? (
              <iframe
                src={`${readingSummary.pdfUrl}#toolbar=0`}
                className="w-full h-full border-none"
                title={readingSummary.title}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2 text-xs">
                <FileText size={48} className="text-brand-light/40 animate-pulse" />
                <p>Nenhum arquivo PDF associado a este resumo.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Summaries List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaries.map(sum => {
            const hasAccess = getHasAccess(sum);
            const subject = subjects.find(s => s.id === sum.subjectId);
            const course = subject ? courses.find(c => c.id === subject.courseId) : null;

            return (
              <div 
                key={sum.id} 
                className={`bg-brand-medium/10 border p-5 rounded-2xl flex flex-col justify-between transition-all group ${
                  hasAccess 
                    ? 'border-brand-medium/40 hover:border-brand-light/50 cursor-pointer' 
                    : 'border-brand-medium/30 opacity-75'
                }`}
                onClick={() => hasAccess && handleRead(sum)}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] bg-brand-medium/55 px-2 py-0.5 rounded text-brand-light font-bold">
                      {subject?.name}
                    </span>
                    {sum.isPremium ? (
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                        hasAccess 
                          ? 'bg-yellow-600/35 text-yellow-300 border border-yellow-500/20' 
                          : 'bg-red-950 text-red-300 border border-red-500/20'
                      }`}>
                        {hasAccess ? <CheckCircle2 size={10} /> : <Lock size={10} />}
                        PREMIUM
                      </span>
                    ) : (
                      <span className="text-[8px] bg-green-950 text-green-300 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">
                        LIVRE
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-white group-hover:text-brand-light transition-colors line-clamp-1">{sum.title}</h3>
                  <p className="text-[11px] text-gray-450 mt-1 line-clamp-2 leading-relaxed">{sum.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-brand-medium/30">
                  <span className="text-[9px] text-gray-450">
                    {course?.name} (Semestre {subject?.semester})
                  </span>
                  
                  {hasAccess ? (
                    <button className="flex items-center gap-1 text-[11px] text-brand-light font-bold hover:text-white transition-colors">
                      Ler Resumo <ChevronRight size={14} />
                    </button>
                  ) : (
                    <div className="text-[10px] text-red-300 font-bold flex items-center gap-1 bg-red-900/20 px-2.5 py-1 rounded-lg border border-red-500/10">
                      <Lock size={11} /> Bloqueado (Fazer Upgrade)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
