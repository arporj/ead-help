import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Award, ShieldAlert, CheckCircle2, UserCheck, Calendar, BookOpen, Layers, Users } from 'lucide-react';

export const StudentRanking: React.FC = () => {
  const { user, studentProfile, students, toggleLgpdConsent } = useAuth();
  const [activeTab, setActiveTab] = useState<'ciclo' | 'geral'>('ciclo');

  const consentGranted = studentProfile?.lgpdRankingConsent || false;

  // 1. Build "Por Ciclo" Ranking List
  // Every completed exam cycle is a separate entry in this ranking.
  const allCyclesList = students
    .flatMap(s => {
      const isSelf = s.user.id === user?.id;
      const isAllowed = s.profile.lgpdRankingConsent || isSelf;
      if (!isAllowed) return [];

      const cycles = s.profile.examCycles || [];
      return cycles.map(c => ({
        ...c,
        studentName: isSelf && !s.profile.lgpdRankingConsent ? `${s.user.name} (Você - Privado)` : s.user.name,
        isCurrentUser: isSelf,
        plan: s.profile.plan
      }));
    })
    .sort((a, b) => {
      // Sort by success percentage descending
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }
      // Ties solved by completion date (most recent first)
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    });

  // 2. Build "Geral" Consolidated Ranking List
  // Each student appears exactly once, consolidating all their answered questions.
  const generalRankingList = students
    .filter(s => s.profile.lgpdRankingConsent || s.user.id === user?.id)
    .map(s => {
      const isSelf = s.user.id === user?.id;
      const cycles = s.profile.examCycles || [];
      
      const totalCorrect = cycles.reduce((acc, c) => acc + c.correctAnswers, 0);
      const totalQuestions = cycles.reduce((acc, c) => acc + c.totalQuestions, 0);
      const percentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

      return {
        studentId: s.user.id,
        name: isSelf && !s.profile.lgpdRankingConsent ? `${s.user.name} (Você - Privado)` : s.user.name,
        totalQuestions,
        totalCorrect,
        percentage,
        isCurrentUser: isSelf,
        plan: s.profile.plan
      };
    })
    .filter(item => item.totalQuestions > 0) // Only list students who answered at least one question
    .sort((a, b) => {
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }
      // Ties solved by total questions solved (higher weight to experience)
      return b.totalQuestions - a.totalQuestions;
    });

  // Helper to format iso dates to relative readable time
  const formatCompactDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Award className="text-brand-light" size={24} />
          Classificação Acadêmica
        </h2>
        <p className="text-gray-400 text-xs mt-1">
          Acompanhe seu desempenho comparado a outros estudantes da plataforma em percentuais de acerto.
        </p>
      </div>

      {!consentGranted ? (
        /* LGPD Block Screen */
        <div className="bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl space-y-5">
          <div className="w-12 h-12 bg-brand-medium/40 border border-brand-light/25 text-brand-light flex items-center justify-center rounded-xl">
            <ShieldAlert size={24} />
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-base text-white">Consentimento de Privacidade (LGPD)</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              De acordo com a Lei Geral de Proteção de Dados (LGPD), para visualizar a tabela de classificação e compartilhar seu progresso com outros estudantes da instituição, precisamos da sua permissão explícita.
            </p>
          </div>

          <div className="border border-brand-medium/55 bg-brand-dark/25 p-4 rounded-xl text-xs text-gray-400 space-y-2">
            <span className="font-bold text-brand-light block uppercase text-[10px] tracking-wider">Como seus dados serão exibidos:</span>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>Seu nome, disciplinas cursadas e taxa de acerto em simulados ficarão visíveis para todos os alunos do portal.</li>
              <li>Apenas rodadas concluídas de 10 questões são contabilizadas. Tentativas incompletas nunca serão divulgadas.</li>
              <li>Você pode revogar este consentimento a qualquer momento e seus dados sumirão instantaneamente do ranking alheio.</li>
            </ul>
          </div>

          <button
            onClick={toggleLgpdConsent}
            className="w-full bg-brand-light hover:bg-white text-brand-dark py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-light/5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck size={14} /> Aceitar Termos e Entrar no Ranking
          </button>
        </div>
      ) : (
        /* Rankings Dashboard with Tabs */
        <div className="space-y-5">
          {/* LGPD Status Banner */}
          <div className="bg-green-950/20 border border-green-500/25 p-3 rounded-xl flex items-center justify-between text-xs text-green-300">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={14} /> Seu perfil está público no ranking
            </span>
            <button
              onClick={toggleLgpdConsent}
              className="text-[10px] hover:text-red-300 font-bold transition-colors cursor-pointer"
            >
              Ocultar Meu Perfil
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-brand-medium/30">
            <button
              onClick={() => setActiveTab('ciclo')}
              className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'ciclo'
                  ? 'border-brand-light text-white bg-brand-medium/5'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Layers size={14} />
              Ranking por Ciclo
            </button>
            <button
              onClick={() => setActiveTab('geral')}
              className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'geral'
                  ? 'border-brand-light text-white bg-brand-medium/5'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Users size={14} />
              Ranking Geral (Acumulado)
            </button>
          </div>

          {/* TAB 1: RANKING POR CICLO */}
          {activeTab === 'ciclo' && (
            <div className="bg-brand-medium/10 border border-brand-medium/40 rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-150">
              <div className="grid grid-cols-12 bg-brand-medium/20 p-4 border-b border-brand-medium/45 font-bold text-xs text-brand-light uppercase tracking-wider">
                <span className="col-span-2 text-center">Posição</span>
                <span className="col-span-4">Estudante</span>
                <span className="col-span-3">Foco / Disciplina</span>
                <span className="col-span-3 text-right">Resultado (%)</span>
              </div>

              <div className="divide-y divide-brand-medium/25">
                {allCyclesList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">
                    Nenhum ciclo concluído no ranking ainda. Seja o primeiro a completar um simulado!
                  </div>
                ) : (
                  allCyclesList.map((item, idx) => {
                    let rankStyle = 'text-gray-400';
                    if (idx === 0) rankStyle = 'text-yellow-400 font-extrabold text-base';
                    if (idx === 1) rankStyle = 'text-gray-300 font-extrabold text-base';
                    if (idx === 2) rankStyle = 'text-amber-600 font-extrabold text-base';

                    return (
                      <div 
                        key={item.id || idx} 
                        className={`grid grid-cols-12 p-4 items-center text-xs transition-all ${
                          item.isCurrentUser 
                            ? 'bg-brand-medium/30 border-l-4 border-brand-light font-bold text-white' 
                            : 'text-gray-300'
                        }`}
                      >
                        <span className={`col-span-2 text-center ${rankStyle}`}>
                          {idx + 1}º
                        </span>
                        
                        <div className="col-span-4 flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] uppercase border ${
                            item.isCurrentUser 
                              ? 'bg-brand-light border-brand-light text-brand-dark' 
                              : 'bg-brand-medium/40 border-brand-medium text-brand-light'
                          }`}>
                            {item.studentName[0]}
                          </div>
                          <span className="truncate">{item.studentName}</span>
                          {item.isCurrentUser && !studentProfile?.lgpdRankingConsent && (
                            <span className="text-[7px] bg-red-950 text-red-300 border border-red-500/20 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                              Invisível
                            </span>
                          )}
                        </div>

                        <div className="col-span-3 pr-2">
                          <span className="text-gray-400 text-[10px] flex items-center gap-1">
                            <BookOpen size={10} className="text-brand-light shrink-0" />
                            <span className="truncate">{item.subjectName}</span>
                          </span>
                          <span className="text-[8px] text-gray-500 flex items-center gap-0.5 mt-0.5">
                            <Calendar size={8} />
                            {formatCompactDate(item.completedAt)}
                          </span>
                        </div>

                        <div className="col-span-3 text-right">
                          <span className="font-mono text-brand-light font-extrabold text-sm block">
                            {item.percentage}%
                          </span>
                          <span className="text-[9px] text-gray-450 block">
                            ({item.correctAnswers}/{item.totalQuestions} acertos)
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RANKING GERAL / ACUMULADO */}
          {activeTab === 'geral' && (
            <div className="bg-brand-medium/10 border border-brand-medium/40 rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-150">
              <div className="grid grid-cols-12 bg-brand-medium/20 p-4 border-b border-brand-medium/45 font-bold text-xs text-brand-light uppercase tracking-wider">
                <span className="col-span-2 text-center">Posição</span>
                <span className="col-span-5">Estudante</span>
                <span className="col-span-2 text-center">Total Responded</span>
                <span className="col-span-3 text-right">Média Geral (%)</span>
              </div>

              <div className="divide-y divide-brand-medium/25">
                {generalRankingList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">
                    Nenhum aluno no ranking geral ainda. Resolva simulados para figurar no painel.
                  </div>
                ) : (
                  generalRankingList.map((item, idx) => {
                    let rankStyle = 'text-gray-400';
                    if (idx === 0) rankStyle = 'text-yellow-400 font-extrabold text-base';
                    if (idx === 1) rankStyle = 'text-gray-300 font-extrabold text-base';
                    if (idx === 2) rankStyle = 'text-amber-600 font-extrabold text-base';

                    return (
                      <div 
                        key={item.studentId || idx} 
                        className={`grid grid-cols-12 p-4 items-center text-xs transition-all ${
                          item.isCurrentUser 
                            ? 'bg-brand-medium/30 border-l-4 border-brand-light font-bold text-white' 
                            : 'text-gray-300'
                        }`}
                      >
                        <span className={`col-span-2 text-center ${rankStyle}`}>
                          {idx + 1}º
                        </span>
                        
                        <div className="col-span-5 flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] uppercase border ${
                            item.isCurrentUser 
                              ? 'bg-brand-light border-brand-light text-brand-dark' 
                              : 'bg-brand-medium/40 border-brand-medium text-brand-light'
                          }`}>
                            {item.name[0]}
                          </div>
                          <span className="truncate">{item.name}</span>
                          {item.isCurrentUser && !studentProfile?.lgpdRankingConsent && (
                            <span className="text-[7px] bg-red-950 text-red-300 border border-red-500/20 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                              Invisível
                            </span>
                          )}
                        </div>

                        <span className="col-span-2 text-center font-mono text-gray-400">
                          {item.totalQuestions} Qs
                        </span>

                        <div className="col-span-3 text-right">
                          <span className="font-mono text-brand-light font-extrabold text-sm block">
                            {item.percentage}%
                          </span>
                          <span className="text-[9px] text-gray-450 block">
                            ({item.totalCorrect} de {item.totalQuestions} acertos)
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
