import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BrainCircuit, 
  UserCheck, 
  Search, 
  Check, 
  X, 
  Edit3, 
  Save, 
  RefreshCw 
} from 'lucide-react';

export const AdminStudents: React.FC = () => {
  const { 
    students, 
    summaries, 
    courses, 
    subjects, 
    plansConfig,
    updateStudentPlan, 
    updateStudentSummaryAccess, 
    toggleAiAccess,
    saveStudentSubjectsByAdmin
  } = useAuth();

  // Search and Filter states for student list
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  // Modal State for editing student
  const [editingStudent, setEditingStudent] = useState<typeof students[0] | null>(null);
  
  // Local edit states
  const [editPlan, setEditPlan] = useState<'basic' | 'pro' | 'premium'>('basic');
  const [editAiAccess, setEditAiAccess] = useState(false);
  const [editSubjects, setEditSubjects] = useState<string[]>([]);
  const [editAdditionalSubjects, setEditAdditionalSubjects] = useState<string[]>([]);
  const [editSummaries, setEditSummaries] = useState<string[]>([]);

  // Sub-filters for subjects in modal
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectCourseFilter, setSubjectCourseFilter] = useState('all');

  // Sub-filters for summaries in modal
  const [summarySearch, setSummarySearch] = useState('');
  const [summaryCourseFilter, setSummaryCourseFilter] = useState('all');

  const [isSaving, setIsSaving] = useState(false);

  // Load student data into local edit states when modal opens
  const openEditModal = (student: typeof students[0]) => {
    setEditingStudent(student);
    setEditPlan(student.profile.plan);
    setEditAiAccess(student.profile.aiConsultantAccess);
    
    // Separar disciplinas comuns e adicionais
    const sSubjects = student.profile.studentSubjects || [];
    const regularIds = sSubjects.filter(ss => !ss.isAdditional).map(ss => ss.subjectId);
    const additionalIds = sSubjects.filter(ss => ss.isAdditional).map(ss => ss.subjectId);
    
    setEditSubjects(regularIds);
    setEditAdditionalSubjects(additionalIds);
    setEditSummaries(student.profile.summaryAccess || []);
    
    // Reset filters
    setSubjectSearch('');
    setSubjectCourseFilter('all');
    setSummarySearch('');
    setSummaryCourseFilter('all');
  };

  const handleSaveStudent = async () => {
    if (!editingStudent) return;
    setIsSaving(true);
    try {
      const studentId = editingStudent.user.id;
      
      // 1. Atualizar plano se mudou
      if (editPlan !== editingStudent.profile.plan) {
        await updateStudentPlan(studentId, editPlan);
      }
      
      // 2. Atualizar acesso a IA se mudou
      if (editAiAccess !== editingStudent.profile.aiConsultantAccess) {
        await toggleAiAccess(studentId);
      }
      
      // 3. Atualizar disciplinas (grade + adicionais)
      await saveStudentSubjectsByAdmin(studentId, editSubjects, editAdditionalSubjects);
      
      // 4. Atualizar acesso a resumos
      await updateStudentSummaryAccess(studentId, editSummaries);
      
      setEditingStudent(null);
    } catch (err) {
      // Tratado globalmente no AuthContext
    } finally {
      setIsSaving(false);
    }
  };

  // Filter students list
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = planFilter === 'all' || student.profile.plan === planFilter;
    
    return matchesSearch && matchesPlan;
  });

  // Premium summaries for access control
  const premiumSummaries = summaries.filter(sum => sum.isPremium);

  // Filter premium summaries for modal checklist
  const filteredSummaries = premiumSummaries.filter(sum => {
    const matchesSearch = 
      sum.title.toLowerCase().includes(summarySearch.toLowerCase()) ||
      sum.description.toLowerCase().includes(summarySearch.toLowerCase());
    
    let matchesCourse = true;
    if (summaryCourseFilter !== 'all') {
      const subj = subjects.find(s => s.id === sum.subjectId);
      matchesCourse = subj ? subj.courseId === summaryCourseFilter : false;
    }
    
    return matchesSearch && matchesCourse;
  });

  // Filter subjects for modal checklist
  const filteredSubjects = subjects.filter(subj => {
    const matchesSearch = subj.name.toLowerCase().includes(subjectSearch.toLowerCase());
    const matchesCourse = subjectCourseFilter === 'all' || subj.courseId === subjectCourseFilter;
    return matchesSearch && matchesCourse;
  });

  // Ordenar disciplinas por semestre e depois alfabeticamente
  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    if (a.semester !== b.semester) {
      return a.semester - b.semester;
    }
    return a.name.localeCompare(b.name, 'pt-BR');
  });

  // Get current plan limits
  const currentPlanConfig = plansConfig.find(p => p.planType === editPlan);
  const maxSubjectsLimit = currentPlanConfig?.maxSubjects || 0;
  const maxSummariesLimit = currentPlanConfig?.includedPremiumSummaries || 0;

  // Toggle subject choice for regular grade (limits applied based on plan)
  const toggleRegularSubject = (subjectId: string) => {
    if (editSubjects.includes(subjectId)) {
      setEditSubjects(prev => prev.filter(id => id !== subjectId));
    } else {
      if (editPlan !== 'basic' && editSubjects.length >= maxSubjectsLimit) {
        alert(`O plano ${currentPlanConfig?.name} permite apenas até ${maxSubjectsLimit} disciplinas na grade regular. Adicione como disciplina extra.`);
        return;
      }
      // Não permitir ter a mesma disciplina nas duas listas
      setEditAdditionalSubjects(prev => prev.filter(id => id !== subjectId));
      setEditSubjects(prev => [...prev, subjectId]);
    }
  };

  // Toggle subject choice for additional subjects
  const toggleAdditionalSubject = (subjectId: string) => {
    if (editAdditionalSubjects.includes(subjectId)) {
      setEditAdditionalSubjects(prev => prev.filter(id => id !== subjectId));
    } else {
      // Não permitir ter a mesma disciplina nas duas listas
      setEditSubjects(prev => prev.filter(id => id !== subjectId));
      setEditAdditionalSubjects(prev => [...prev, subjectId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck className="text-brand-light" size={24} />
            Gerenciar Alunos
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Controle de planos, acesso à Inteligência Artificial, grade de disciplinas e resumos liberados.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-brand-medium/10 border border-brand-medium/40 p-4 rounded-2xl flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar aluno por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-brand-light focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-light focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Planos</option>
            <option value="basic">Gratuito</option>
            <option value="pro">Start</option>
            <option value="premium">Aprovação</option>
          </select>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-brand-medium/10 border border-brand-medium/40 rounded-2xl overflow-hidden shadow-xl">
        <div className="border-b border-brand-medium/40 p-4 bg-brand-medium/20">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <UserCheck size={16} className="text-brand-light" />
            Base de Alunos Ativos ({filteredStudents.length})
          </h3>
        </div>

        <div className="divide-y divide-brand-medium/30">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              Nenhum aluno encontrado para os filtros selecionados.
            </div>
          ) : (
            filteredStudents.map(student => {
              const studentSubjectsCount = student.profile.studentSubjects?.length || 0;
              const summaryCount = student.profile.summaryAccess?.length || 0;

              return (
                <div 
                  key={student.user.id} 
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-medium/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-medium/50 flex items-center justify-center font-extrabold text-sm text-brand-light border border-brand-medium shadow-inner shrink-0">
                      {student.user.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white">{student.user.name}</h4>
                      <span className="text-[10px] sm:text-xs text-gray-400 block">{student.user.email}</span>
                      
                      {/* Resumo de limites */}
                      <div className="flex flex-wrap gap-1.5 mt-1.5 text-[9px] font-bold">
                        <span className={`px-2 py-0.5 rounded border ${
                          student.profile.plan === 'premium'
                            ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/25'
                            : student.profile.plan === 'pro'
                            ? 'bg-brand-medium border border-brand-light/30 text-white'
                            : 'bg-brand-dark border border-brand-medium text-gray-400'
                        }`}>
                          Plano: {student.profile.plan === 'premium' ? 'APROVAÇÃO' : student.profile.plan === 'pro' ? 'START' : 'GRATUITO'}
                        </span>
                        
                        <span className="px-2 py-0.5 rounded bg-brand-medium/20 text-brand-light border border-brand-medium/30">
                          {studentSubjectsCount} Disciplinas
                        </span>
                        
                        <span className="px-2 py-0.5 rounded bg-brand-medium/20 text-brand-light border border-brand-medium/30">
                          {summaryCount} Resumos
                        </span>

                        {student.profile.aiConsultantAccess ? (
                          <span className="px-2 py-0.5 rounded bg-green-950 text-green-300 border border-green-500/20 flex items-center gap-0.5">
                            <BrainCircuit size={10} /> IA Liberada
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/20 flex items-center gap-0.5">
                            <BrainCircuit size={10} /> IA Bloqueada
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right hidden md:block">
                      <span className="text-[10px] text-gray-450 block uppercase tracking-wider font-bold">Pontos no Ranking</span>
                      <strong className="text-brand-light text-xs">{student.profile.rankingPoints} pts</strong>
                    </div>

                    <button
                      onClick={() => openEditModal(student)}
                      className="bg-brand-medium/40 hover:bg-brand-medium text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-brand-medium/80 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 size={12} className="text-brand-light" />
                      Editar Aluno
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de Edição Detalhada */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-brand-dark border border-brand-medium/55 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in duration-200">
            
            {/* Header */}
            <div className="p-5 border-b border-brand-medium/40 bg-brand-medium/15 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 size={16} className="text-brand-light" />
                  Editar Cadastro de Aluno: {editingStudent.user.name}
                </h3>
                <p className="text-gray-400 text-[10px] mt-0.5">{editingStudent.user.email}</p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Seção 1: Plano & IA */}
              <div className="bg-brand-medium/10 border border-brand-medium/30 p-4 rounded-xl space-y-4">
                <h4 className="font-bold text-xs text-brand-light uppercase tracking-wider border-b border-brand-medium/30 pb-1.5">
                  1. Plano de Assinatura & Inteligência Artificial
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plano */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider block">Selecionar Plano</label>
                    <select
                      value={editPlan}
                      onChange={(e) => {
                        const newPlan = e.target.value as 'basic' | 'pro' | 'premium';
                        setEditPlan(newPlan);
                        // Ao mudar de plano, resetar a grade de matérias regular de acordo com o limite
                        const limit = plansConfig.find(p => p.planType === newPlan)?.maxSubjects || 0;
                        setEditSubjects(prev => prev.slice(0, limit));
                      }}
                      className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-light focus:outline-none cursor-pointer"
                    >
                      <option value="basic">Gratuito (Limite: 0 Disciplinas contratadas)</option>
                      <option value="pro">Start (Limite: até 3 Disciplinas contratadas)</option>
                      <option value="premium">Aprovação (Limite: até 5 Disciplinas contratadas)</option>
                    </select>
                  </div>

                  {/* IA */}
                  <div className="space-y-2 flex flex-col justify-center">
                    <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider block">Acesso ao Tutor de IA</label>
                    <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editAiAccess}
                        onChange={(e) => setEditAiAccess(e.target.checked)}
                        className="w-4 h-4 rounded bg-brand-dark border-brand-medium text-brand-light focus:ring-0 cursor-pointer"
                      />
                      <span>Liberar acesso ao Consultor Jurídico por IA</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Seção 2: Grade de Disciplinas */}
              <div className="bg-brand-medium/10 border border-brand-medium/30 p-4 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-medium/30 pb-2">
                  <h4 className="font-bold text-xs text-brand-light uppercase tracking-wider">
                    2. Seleção de Disciplinas (Grade Regular e Adicionais)
                  </h4>
                  <div className="text-[10px] font-bold text-gray-400">
                    Grade Regular: <span className="text-white">{editSubjects.length} / {maxSubjectsLimit}</span>
                    {editPlan !== 'basic' && (
                      <span className="ml-3">Adicionais: <span className="text-brand-light">{editAdditionalSubjects.length}</span></span>
                    )}
                  </div>
                </div>

                {/* Filtros de disciplinas */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Filtrar matérias por nome..."
                      value={subjectSearch}
                      onChange={(e) => setSubjectSearch(e.target.value)}
                      className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl pl-8 pr-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-brand-light"
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <select
                      value={subjectCourseFilter}
                      onChange={(e) => setSubjectCourseFilter(e.target.value)}
                      className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-brand-light cursor-pointer"
                    >
                      <option value="all">Todos os Cursos</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Lista de disciplinas */}
                {editPlan === 'basic' ? (
                  <div className="text-center py-6 text-gray-400 text-xs">
                    Alunos do plano **Gratuito** não possuem disciplinas vinculadas à grade semestral (acesso apenas a simulado aberto).
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto border border-brand-medium/30 rounded-xl p-3 bg-brand-dark/40 space-y-2">
                    {sortedSubjects.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 text-xs italic">
                        Nenhuma disciplina encontrada.
                      </div>
                    ) : (
                      sortedSubjects.map(subj => {
                        const isRegular = editSubjects.includes(subj.id);
                        const isAdditional = editAdditionalSubjects.includes(subj.id);
                        const courseName = courses.find(c => c.id === subj.courseId)?.name || 'Curso';

                        return (
                          <div 
                            key={subj.id}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                              isRegular 
                                ? 'bg-brand-medium/30 border-brand-light/45 text-white' 
                                : isAdditional 
                                ? 'bg-green-950/20 border-green-500/35 text-white'
                                : 'bg-brand-dark/20 border-brand-medium/20 text-gray-400 hover:border-brand-medium/55'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-[9px] uppercase text-brand-light bg-brand-medium/50 px-1.5 py-0.5 rounded mr-2">
                                Semestre {subj.semester}
                              </span>
                              <span className="font-semibold text-white">{subj.name}</span>
                              <span className="text-[10px] text-gray-450 block mt-0.5">{courseName}</span>
                            </div>

                            <div className="flex gap-2 shrink-0">
                              {/* Botão Grade Regular */}
                              <button
                                type="button"
                                onClick={() => toggleRegularSubject(subj.id)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                  isRegular 
                                    ? 'bg-brand-light border-brand-light text-brand-dark' 
                                    : 'bg-brand-dark border-brand-medium text-gray-300 hover:bg-brand-medium/35'
                                }`}
                              >
                                {isRegular ? 'Grade ✔' : 'Grade'}
                              </button>

                              {/* Botão Disciplina Adicional */}
                              <button
                                type="button"
                                onClick={() => toggleAdditionalSubject(subj.id)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                  isAdditional 
                                    ? 'bg-green-600 border-green-600 text-white' 
                                    : 'bg-brand-dark border-brand-medium text-gray-300 hover:bg-brand-medium/35'
                                }`}
                              >
                                {isAdditional ? 'Adicional +✔' : 'Adicional +'}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Seção 3: Resumos Premium */}
              <div className="bg-brand-medium/10 border border-brand-medium/30 p-4 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-medium/30 pb-2">
                  <h4 className="font-bold text-xs text-brand-light uppercase tracking-wider">
                    3. Liberação de Resumos Premium
                  </h4>
                  <div className="text-[10px] font-bold text-gray-400">
                    Resumos Liberados: <span className="text-brand-light font-bold">{editSummaries.length}</span>
                    {editPlan !== 'basic' && (
                      <span className="ml-2 font-normal">({maxSummariesLimit} inclusos no plano)</span>
                    )}
                  </div>
                </div>

                {/* Filtros de resumos */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Filtrar resumos premium por nome..."
                      value={summarySearch}
                      onChange={(e) => setSummarySearch(e.target.value)}
                      className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl pl-8 pr-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-brand-light"
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <select
                      value={summaryCourseFilter}
                      onChange={(e) => setSummaryCourseFilter(e.target.value)}
                      className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-brand-light cursor-pointer"
                    >
                      <option value="all">Todos os Cursos</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Lista de resumos */}
                <div className="max-h-56 overflow-y-auto border border-brand-medium/30 rounded-xl p-3 bg-brand-dark/40 space-y-2">
                  {filteredSummaries.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-xs italic">
                      Nenhum resumo premium cadastrado para os filtros informados.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredSummaries.map(sum => {
                        const isChecked = editSummaries.includes(sum.id);
                        const subj = subjects.find(s => s.id === sum.subjectId);
                        const courseName = subj ? courses.find(c => c.id === subj.courseId)?.name : '';

                        return (
                          <div
                            key={sum.id}
                            onClick={() => {
                              setEditSummaries(prev =>
                                prev.includes(sum.id) ? prev.filter(id => id !== sum.id) : [...prev, sum.id]
                              );
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                              isChecked
                                ? 'bg-brand-medium/25 border-brand-light/60 text-white'
                                : 'bg-brand-dark/20 border-brand-medium/20 text-gray-400 hover:border-brand-medium/60'
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
                              {subj && (
                                <span className="inline-block text-[9px] text-brand-light bg-brand-medium/30 border border-brand-medium/40 px-1.5 py-0.5 rounded mt-2 font-medium">
                                  {courseName} • {subj.name}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-brand-medium/40 bg-brand-medium/15 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Lembrete: o aluno terá acesso às atualizações no próximo login.
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingStudent(null)}
                  disabled={isSaving}
                  className="px-4 py-2 border border-brand-medium/60 rounded-xl text-xs font-bold text-gray-300 hover:bg-brand-medium/25 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveStudent}
                  disabled={isSaving}
                  className="px-5 py-2 bg-brand-light hover:bg-white text-brand-dark rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-light/5 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? <RefreshCw className="animate-spin" size={12} /> : <Save size={12} />}
                  {isSaving ? 'Gravando...' : 'Gravar Alterações'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
