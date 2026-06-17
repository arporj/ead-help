import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BrainCircuit, UserCheck, FileText, Search, Check, X, Filter, Sparkles } from 'lucide-react';

export const AdminStudents: React.FC = () => {
  const { 
    students, 
    summaries, 
    courses, 
    subjects, 
    updateStudentPlan, 
    updateStudentSummaryAccess, 
    toggleAiAccess 
  } = useAuth();

  // Modal State for custom summary access
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);
  const [localAccesses, setLocalAccesses] = useState<string[]>([]);
  const [modalSearch, setModalSearch] = useState('');
  const [modalCourseId, setModalCourseId] = useState('all');

  const openModal = (student: typeof students[0]) => {
    setSelectedStudent(student);
    setLocalAccesses(student.profile.summaryAccess);
    setModalSearch('');
    setModalCourseId('all');
  };

  // Filter Premium summaries only for student individual access control
  const premiumSummaries = summaries.filter(sum => sum.isPremium);

  const filteredSummariesForModal = premiumSummaries.filter(sum => {
    // 1. Text Search query filter
    if (modalSearch) {
      const query = modalSearch.toLowerCase();
      const matchesTitle = sum.title.toLowerCase().includes(query);
      const matchesDesc = sum.description.toLowerCase().includes(query);
      
      const subject = subjects.find(s => s.id === sum.subjectId);
      const matchesSubject = subject ? subject.name.toLowerCase().includes(query) : false;

      if (!matchesTitle && !matchesDesc && !matchesSubject) {
        return false;
      }
    }

    // 2. Course Category filter
    if (modalCourseId !== 'all') {
      const subject = subjects.find(s => s.id === sum.subjectId);
      if (!subject || subject.courseId !== modalCourseId) {
        return false;
      }
    }

    return true;
  });

  // Batch Select action
  const handleSelectAllFiltered = () => {
    const filteredIds = filteredSummariesForModal.map(s => s.id);
    setLocalAccesses(prev => {
      const uniqueIds = new Set([...prev, ...filteredIds]);
      return Array.from(uniqueIds);
    });
  };

  // Batch Clear action
  const handleClearAllFiltered = () => {
    const filteredIds = filteredSummariesForModal.map(s => s.id);
    setLocalAccesses(prev => prev.filter(id => !filteredIds.includes(id)));
  };

  const handleSave = () => {
    if (selectedStudent) {
      updateStudentSummaryAccess(selectedStudent.user.id, localAccesses);
      setSelectedStudent(null);
    }
  };

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
                    className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-2.5 py-1.5 text-xs focus:border-brand-light focus:outline-none text-white cursor-pointer"
                  >
                    <option value="basic">Básico (Grátis)</option>
                    <option value="pro">Pro (Intermediário)</option>
                    <option value="premium">Premium (Completo)</option>
                  </select>
                </div>

                {/* 2. Custom PDF Accesses */}
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="text-[10px] font-bold text-brand-light uppercase tracking-wider block">Resumos Premium</label>
                  {student.profile.plan === 'premium' ? (
                    <div className="w-full text-center py-2 px-3 rounded-xl border border-yellow-500/20 bg-yellow-600/5 text-yellow-400 text-xs font-bold flex items-center justify-center gap-1.5">
                      <Sparkles size={12} className="text-yellow-400 fill-yellow-400" />
                      Acesso Total (Plano)
                    </div>
                  ) : (
                    <button
                      onClick={() => openModal(student)}
                      className="w-full text-center py-2 px-3 rounded-xl border border-brand-medium/60 text-xs font-bold bg-brand-dark/30 text-gray-300 hover:bg-brand-medium/20 hover:text-white hover:border-brand-medium transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FileText size={14} className="text-brand-light" />
                      Liberar Resumos ({student.profile.summaryAccess.length})
                    </button>
                  )}
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

      {/* Modal for Managing Access to Summaries */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-brand-dark border border-brand-medium/55 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-brand-medium/40 bg-brand-medium/15 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText size={18} className="text-brand-light" />
                  Liberar Resumos: {selectedStudent.user.name}
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  Selecione os resumos avulsos que este estudante poderá visualizar além do plano atual.
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Filters */}
            <div className="p-4 border-b border-brand-medium/30 bg-brand-medium/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Text Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por título ou disciplina..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full bg-brand-dark/60 border border-brand-medium/55 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-brand-light focus:outline-none"
                />
              </div>

              {/* Course filter */}
              <div className="relative">
                <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={modalCourseId}
                  onChange={(e) => setModalCourseId(e.target.value)}
                  className="w-full bg-brand-dark/60 border border-brand-medium/55 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-brand-light focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="all">Todos os Cursos</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Batch Actions panel */}
            <div className="px-6 py-3 bg-brand-medium/10 border-b border-brand-medium/20 flex flex-wrap gap-3 items-center justify-between text-xs">
              <span className="text-gray-300">
                Resumos filtrados: <strong className="text-white">{filteredSummariesForModal.length}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAllFiltered}
                  className="bg-brand-medium/35 hover:bg-brand-medium/50 border border-brand-light/25 text-brand-light text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  Liberar Todos Filtrados
                </button>
                <button
                  onClick={handleClearAllFiltered}
                  className="bg-red-950/20 hover:bg-red-950/45 border border-red-500/20 text-red-300 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  Bloquear Todos Filtrados
                </button>
              </div>
            </div>

            {/* Summaries list */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredSummariesForModal.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  Nenhum resumo premium encontrado para os critérios informados.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredSummariesForModal.map(sum => {
                    const isChecked = localAccesses.includes(sum.id);
                    const subject = subjects.find(s => s.id === sum.subjectId);
                    const course = subject ? courses.find(c => c.id === subject.courseId) : null;

                    return (
                      <div
                        key={sum.id}
                        onClick={() => {
                          setLocalAccesses(prev =>
                            prev.includes(sum.id) ? prev.filter(id => id !== sum.id) : [...prev, sum.id]
                          );
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                          isChecked
                            ? 'bg-brand-medium/25 border-brand-light/60 text-white shadow-md shadow-brand-light/2'
                            : 'bg-brand-dark/40 border-brand-medium/30 text-gray-400 hover:border-brand-medium/70'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                          isChecked
                            ? 'bg-brand-light border-brand-light text-brand-dark'
                            : 'border-brand-medium/60'
                        }`}>
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-white truncate">{sum.title}</h4>
                          <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{sum.description}</p>
                          {course && subject && (
                            <span className="inline-block text-[9px] text-brand-light bg-brand-medium/30 border border-brand-medium/40 px-1.5 py-0.5 rounded mt-2 font-medium">
                              {course.name} • {subject.name}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-brand-medium/40 bg-brand-medium/15 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Acessos selecionados: <strong className="text-brand-light">{localAccesses.length}</strong> resumo(s)
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 border border-brand-medium/60 rounded-xl text-xs font-bold text-gray-300 hover:bg-brand-medium/25 hover:text-white transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 bg-brand-light hover:bg-white text-brand-dark rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-light/5 cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
