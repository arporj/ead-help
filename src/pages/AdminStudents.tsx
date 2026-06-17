import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BrainCircuit, UserCheck } from 'lucide-react';

export const AdminStudents: React.FC = () => {
  const { students, summaries, updateStudentPlan, toggleSummaryAccess, toggleAiAccess } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Gerenciar Alunos</h2>
        <p className="text-gray-400 text-xs mt-1">
          Altere assinaturas de planos e conceda acessos avulsos adicionais (Resumos Premium ou Consultor IA).
        </p>
      </div>

      {/* Students List Table/Cards */}
      <div className="bg-brand-medium/10 border border-brand-medium/40 rounded-2xl overflow-hidden shadow-xl">
        <div className="border-b border-brand-medium/40 p-4 bg-brand-medium/20">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <UserCheck size={16} className="text-brand-light" />
            Base de Alunos Ativos
          </h3>
        </div>

        <div className="divide-y divide-brand-medium/30">
          {students.map(student => (
            <div key={student.user.id} className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Profile details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-medium/50 flex items-center justify-center font-extrabold text-sm text-brand-light border border-brand-medium shadow-inner">
                    {student.user.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{student.user.name}</h4>
                    <span className="text-xs text-gray-400 block">{student.user.email}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 text-[10px] pt-1">
                  <span className={`px-2 py-0.5 rounded font-bold border ${
                    student.profile.plan === 'premium'
                      ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/25'
                      : student.profile.plan === 'pro'
                      ? 'bg-brand-medium border border-brand-light/30 text-white'
                      : 'bg-brand-dark border border-brand-medium text-gray-400'
                  }`}>
                    Plano: {student.profile.plan.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-brand-medium/20 text-brand-light border border-brand-medium/30">
                    Pontos no Ranking: {student.profile.rankingPoints} pts
                  </span>
                  {student.profile.aiConsultantAccess ? (
                    <span className="px-2 py-0.5 rounded bg-green-950 text-green-300 border border-green-500/20 font-bold flex items-center gap-1">
                      <BrainCircuit size={10} /> IA Liberada
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/20 font-bold flex items-center gap-1">
                      <BrainCircuit size={10} /> IA Bloqueada
                    </span>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:w-2/3">
                {/* 1. Alter Plan */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-light uppercase tracking-wider block">Nível de Assinatura</label>
                  <select
                    value={student.profile.plan}
                    onChange={(e) => updateStudentPlan(student.user.id, e.target.value as any)}
                    className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-2.5 py-1.5 text-xs focus:border-brand-light focus:outline-none"
                  >
                    <option value="basic">Básico (Grátis)</option>
                    <option value="pro">Pro (Intermediário)</option>
                    <option value="premium">Premium (Completo)</option>
                  </select>
                </div>

                {/* 2. Custom PDF Accesses */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-light uppercase tracking-wider block">Acesso Avulso (Resumos)</label>
                  <div className="max-h-24 overflow-y-auto border border-brand-medium/50 rounded-xl bg-brand-dark/40 p-2 space-y-1">
                    {summaries.filter(sum => sum.isPremium).map(sum => {
                      // Basic or Pro students need manual release if the file is premium (premium plan gets it automatically)
                      const isFreeByPlan = student.profile.plan === 'premium';
                      const hasManualAccess = student.profile.summaryAccess.includes(sum.id);

                      return (
                        <label key={sum.id} className="flex items-center gap-1.5 text-[9px] text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isFreeByPlan || hasManualAccess}
                            disabled={isFreeByPlan}
                            onChange={() => toggleSummaryAccess(student.user.id, sum.id)}
                            className="rounded border-brand-medium text-brand-light focus:ring-0 w-3 h-3 cursor-pointer disabled:opacity-50"
                          />
                          <span className={isFreeByPlan ? "text-yellow-350 font-medium" : ""}>
                            {sum.title.substring(0, 15)}...
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 3. AI Consultant Access */}
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="text-[10px] font-bold text-brand-light uppercase tracking-wider block">Tutor de IA</label>
                  <button
                    onClick={() => toggleAiAccess(student.user.id)}
                    className={`w-full text-center py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      student.profile.aiConsultantAccess
                        ? 'bg-green-950/20 text-green-300 border-green-500/20 hover:bg-green-900/25'
                        : 'bg-red-950/25 text-red-300 border-red-500/20 hover:bg-red-900/35'
                    }`}
                  >
                    {student.profile.aiConsultantAccess ? 'Revogar IA' : 'Liberar Acesso IA'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
