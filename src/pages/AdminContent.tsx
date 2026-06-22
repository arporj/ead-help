import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, FileText, CheckCircle2, Edit, Trash2, X } from 'lucide-react';

export const AdminContent: React.FC = () => {
  const { courses, subjects, summaries, addSummary, deleteSummary, updateSummary } = useAuth();

  // Listagem de disciplinas ordenada alfabeticamente para a interface
  const sortedSubjects = [...subjects].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  // Success messaging
  const [successMsg, setSuccessMsg] = useState('');

  // Form State: Summary
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formCourseId, setFormCourseId] = useState<string>('');
  const [subjectId, setSubjectId] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [editingSummaryId, setEditingSummaryId] = useState<string | null>(null);
  const [isFormSubjectDropdownOpen, setIsFormSubjectDropdownOpen] = useState(false);
  const [formSubjectSearchText, setFormSubjectSearchText] = useState('');

  // Sincronizar formCourseId e subjectId iniciais quando as disciplinas carregam
  useEffect(() => {
    if (sortedSubjects.length > 0 && !formCourseId) {
      const firstSub = sortedSubjects[0];
      if (firstSub) {
        setFormCourseId(firstSub.courseId);
        setSubjectId(firstSub.id);
      }
    }
  }, [sortedSubjects, formCourseId]);

  // Filter States for Published Summaries
  const [filterCourseId, setFilterCourseId] = useState<string>('all');
  const [filterSubjectName, setFilterSubjectName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const availableSubjectsForFilter = sortedSubjects.filter(sub => {
    if (filterCourseId !== 'all' && sub.courseId !== filterCourseId) return false;
    return true;
  });

  const filteredSummaries = summaries.filter(sum => {
    const subject = subjects.find(s => s.id === sum.subjectId);
    if (!subject) return false;

    // Filter by Course
    if (filterCourseId !== 'all' && subject.courseId !== filterCourseId) return false;

    // Filter by Subject Name (datalist input matching)
    if (filterSubjectName.trim()) {
      const matchQuery = filterSubjectName.toLowerCase();
      // First try to find exact matched subject in database
      const exactMatch = subjects.find(s => s.name.toLowerCase() === matchQuery);
      if (exactMatch) {
        if (sum.subjectId !== exactMatch.id) return false;
      } else {
        // If not exact match, do a partial name check on the subject name
        if (!subject.name.toLowerCase().includes(matchQuery)) return false;
      }
    }

    // Filter by Search Query (title/description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const titleMatch = sum.title.toLowerCase().includes(query);
      const descMatch = sum.description.toLowerCase().includes(query);
      if (!titleMatch && !descMatch) return false;
    }

    return true;
  });

  // Handlers
  const handleSaveSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeSubjectId = subjectId || subjects[0]?.id;
    if (!title || !description || !activeSubjectId) return;

    try {
      if (editingSummaryId) {
        await updateSummary(editingSummaryId, {
          title,
          description,
          subjectId: activeSubjectId,
          isPremium
        });
        setEditingSummaryId(null);
        showSuccess('Resumo atualizado com sucesso!');
      } else {
        await addSummary({
          title,
          description,
          subjectId: activeSubjectId,
          isPremium
        });
        showSuccess('Resumo publicado com sucesso!');
      }

      setTitle('');
      setDescription('');
      setIsPremium(false);
    } catch (err) {
      // O erro global já é tratado pelo AuthContext
    }
  };

  const handleEditClick = (sum: any) => {
    setEditingSummaryId(sum.id);
    setTitle(sum.title);
    setDescription(sum.description);
    setSubjectId(sum.subjectId);

    // Sincronizar o curso correspondente à disciplina selecionada na edição
    const subject = subjects.find(s => s.id === sum.subjectId);
    if (subject) {
      setFormCourseId(subject.courseId);
    }

    setIsPremium(sum.isPremium);
  };

  const handleCancelEdit = () => {
    setEditingSummaryId(null);
    setTitle('');
    setDescription('');
    setIsPremium(false);

    // Resetar para o primeiro curso e disciplina disponíveis
    if (sortedSubjects.length > 0) {
      setFormCourseId(sortedSubjects[0].courseId);
      setSubjectId(sortedSubjects[0].id);
    } else {
      setFormCourseId('');
      setSubjectId('');
    }
    setFormSubjectSearchText('');
    setIsFormSubjectDropdownOpen(false);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este resumo permanentemente?')) {
      try {
        await deleteSummary(id);
        showSuccess('Resumo excluído com sucesso!');
        if (editingSummaryId === id) {
          handleCancelEdit();
        }
      } catch (err) {
        // Erro já tratado pelo AuthContext
      }
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Gerenciar Resumos</h2>
        <p className="text-gray-400 text-xs mt-1">
          Publique novos resumos acadêmicos em formato PDF e gerencie os conteúdos existentes no portal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Panel (col-span-5) */}
        <div className="lg:col-span-5 bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl h-fit space-y-5">
          <div className="flex items-center justify-between border-b border-brand-medium/30 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-light" />
              <h3 className="text-sm font-bold text-white font-semibold">
                {editingSummaryId ? 'Editar Resumo' : 'Publicar Novo Resumo'}
              </h3>
            </div>
            {editingSummaryId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 border border-brand-medium/55 bg-brand-dark/30 px-2 py-1 rounded-lg transition-all"
              >
                <X size={10} /> Cancelar
              </button>
            )}
          </div>

          {successMsg && (
            <div className="bg-green-950/35 border border-green-500/35 text-green-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSaveSummary} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                Título do Resumo
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Resumo de Controle de Constitucionalidade"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-3.5 py-2 text-xs text-white focus:border-brand-light focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                Descrição do Conteúdo
              </label>
              <textarea
                required
                rows={3}
                placeholder="Descreva brevemente o conteúdo abordado no PDF..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl p-3 text-xs text-white focus:border-brand-light focus:outline-none"
              />
            </div>

            {/* Combo de Curso e Disciplina em Cascata */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                  Curso
                </label>
                <select
                  value={formCourseId}
                  onChange={(e) => {
                    const nextCourseId = e.target.value;
                    setFormCourseId(nextCourseId);
                    const courseSubjects = sortedSubjects.filter(s => s.courseId === nextCourseId);
                    if (courseSubjects.length > 0) {
                      setSubjectId(courseSubjects[0].id);
                    } else {
                      setSubjectId('');
                    }
                  }}
                  className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-2.5 py-2 text-xs text-white focus:border-brand-light focus:outline-none"
                >
                  {courses.length === 0 ? (
                    <option value="">Nenhum curso cadastrado</option>
                  ) : (
                    courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                  Disciplina Associada
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={
                      subjects.find(s => s.id === subjectId)?.name || "Selecione a Disciplina..."
                    }
                    value={formSubjectSearchText}
                    onFocus={() => setIsFormSubjectDropdownOpen(true)}
                    onChange={(e) => {
                      setFormSubjectSearchText(e.target.value);
                      setIsFormSubjectDropdownOpen(true);
                    }}
                    className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-3.5 py-2 text-xs text-white focus:border-brand-light focus:outline-none placeholder:text-white placeholder:font-medium"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">
                    ▼
                  </div>
                </div>

                {isFormSubjectDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => {
                        setIsFormSubjectDropdownOpen(false);
                        setFormSubjectSearchText('');
                      }}
                    />
                    <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-brand-dark border border-brand-medium rounded-xl shadow-2xl z-20 text-xs py-1.5">
                      {(() => {
                        const courseSubjects = sortedSubjects.filter(s => s.courseId === formCourseId);
                        const searchedSubjects = courseSubjects.filter(sub => 
                          sub.name.toLowerCase().includes(formSubjectSearchText.toLowerCase())
                        );

                        if (searchedSubjects.length === 0) {
                          return (
                            <div className="px-3 py-2 text-gray-500 italic">
                              Nenhuma disciplina encontrada
                            </div>
                          );
                        }

                        return searchedSubjects.map(sub => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              setSubjectId(sub.id);
                              setIsFormSubjectDropdownOpen(false);
                              setFormSubjectSearchText('');
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-brand-medium/40 transition-colors ${
                              subjectId === sub.id ? 'bg-brand-medium/60 text-white font-bold' : 'text-gray-300'
                            }`}
                          >
                            {sub.name} (Sem. {sub.semester})
                          </button>
                        ));
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-semibold text-brand-light uppercase tracking-wider">Arquivo PDF</span>
              <div className="border-2 border-dashed border-brand-medium/60 rounded-xl p-3 text-center text-xs text-gray-550 bg-brand-dark/20">
                <FileText className="w-6 h-6 text-brand-light/40 mx-auto mb-1 animate-bounce" />
                <span className="text-[9px] text-gray-400 font-medium">Arquivo de Simulação Autogerado</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPremium"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="rounded border-brand-medium text-brand-light focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isPremium" className="text-xs text-white font-semibold cursor-pointer">
                Exclusivo para assinantes Premium/Pro ou Venda Avulsa
              </label>
            </div>

            <button
              type="submit"
              disabled={subjects.length === 0}
              className="w-full bg-brand-light hover:bg-white text-brand-dark py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-brand-light/5"
            >
              {editingSummaryId ? 'Salvar Alterações' : 'Publicar Resumo'}
            </button>
          </form>
        </div>

        {/* Right Column: Library List (col-span-7) */}
        <div className="lg:col-span-7 bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl flex flex-col h-[580px]">
          <div className="flex items-center gap-1.5 border-b border-brand-medium/40 text-xs font-bold pb-3 mb-4 text-brand-light shrink-0">
            <BookOpen size={16} />
            <span>Resumos Publicados ({summaries.length})</span>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            {/* Filter Bar */}
            <div className="space-y-3 mb-4 bg-brand-dark/25 p-3 rounded-xl border border-brand-medium/40 shrink-0">
              {/* Primeira Linha: Curso e Disciplina */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-brand-light uppercase tracking-wider mb-1">Curso</label>
                  <select
                    value={filterCourseId}
                    onChange={(e) => {
                      setFilterCourseId(e.target.value);
                      setFilterSubjectName(''); // Reset subject selection when course changes
                    }}
                    className="w-full bg-brand-dark border border-brand-medium/60 rounded-lg px-2 py-1.5 text-xs text-white focus:border-brand-light focus:outline-none"
                  >
                    <option value="all">Todos os Cursos</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-[9px] font-bold text-brand-light uppercase tracking-wider mb-1">Disciplina</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Selecione ou digite para filtrar..."
                      value={filterSubjectName}
                      onFocus={() => setIsFilterDropdownOpen(true)}
                      onChange={(e) => {
                        setFilterSubjectName(e.target.value);
                        setIsFilterDropdownOpen(true);
                      }}
                      className="w-full bg-brand-dark border border-brand-medium/60 rounded-lg pl-2.5 pr-8 py-1.5 text-xs text-white focus:border-brand-light focus:outline-none placeholder:text-gray-500"
                    />
                    <button
                      type="button"
                      onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className={`w-3.5 h-3.5 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {isFilterDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsFilterDropdownOpen(false)}></div>
                      <ul className="absolute z-20 w-full mt-1 max-h-40 overflow-y-auto bg-brand-dark border border-brand-medium rounded-lg shadow-xl divide-y divide-brand-medium/30 focus:outline-none text-xs">
                        <li
                          onClick={() => {
                            setFilterSubjectName('');
                            setIsFilterDropdownOpen(false);
                          }}
                          className="px-3 py-2 text-gray-400 hover:bg-brand-medium/30 hover:text-white cursor-pointer transition-colors"
                        >
                          Todas as Disciplinas
                        </li>
                        {availableSubjectsForFilter
                          .filter(sub => 
                            sub.name.toLowerCase().includes(filterSubjectName.toLowerCase())
                          )
                          .map(sub => (
                            <li
                              key={sub.id}
                              onClick={() => {
                                setFilterSubjectName(sub.name);
                                setIsFilterDropdownOpen(false);
                              }}
                              className={`px-3 py-2 hover:bg-brand-medium/40 hover:text-white cursor-pointer transition-colors ${
                                filterSubjectName.toLowerCase() === sub.name.toLowerCase() 
                                  ? 'bg-brand-medium text-brand-light font-bold' 
                                  : 'text-gray-305'
                              }`}
                            >
                              {sub.name}
                            </li>
                          ))}
                        {availableSubjectsForFilter.filter(sub => 
                          sub.name.toLowerCase().includes(filterSubjectName.toLowerCase())
                        ).length === 0 && (
                          <li className="px-3 py-2 text-gray-500 italic">Nenhuma disciplina encontrada</li>
                        )}
                      </ul>
                    </>
                  )}
                </div>
              </div>

              {/* Segunda Linha: Busca por texto */}
              <div>
                <label className="block text-[9px] font-bold text-brand-light uppercase tracking-wider mb-1">Busca por Texto</label>
                <input
                  type="text"
                  placeholder="Buscar no título ou descrição do resumo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-medium/60 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-brand-light focus:outline-none placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Summaries scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {filteredSummaries.length === 0 ? (
                <div className="text-center py-12 text-gray-550 text-xs">
                  Nenhum resumo encontrado com os filtros aplicados.
                </div>
              ) : (
                filteredSummaries.map(sum => {
                  const subject = subjects.find(s => s.id === sum.subjectId);
                  const course = subject ? courses.find(c => c.id === subject.courseId) : null;

                  return (
                    <div key={sum.id} className="border border-brand-medium/35 bg-brand-dark/30 p-4 rounded-xl flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-white">{sum.title}</h4>
                          {sum.isPremium ? (
                            <span className="text-[8px] bg-yellow-600/35 text-yellow-350 border border-yellow-500/20 px-2 py-0.5 rounded-full font-bold">
                              PREMIUM
                            </span>
                          ) : (
                            <span className="text-[8px] bg-brand-medium text-brand-light border border-brand-light/10 px-2 py-0.5 rounded-full font-bold">
                              LIVRE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-455 line-clamp-2 leading-relaxed">{sum.description}</p>
                        <div className="text-[9px] text-brand-light font-medium pt-1">
                          {course?.name || 'Curso Não Identificado'} &bull; {subject?.name || 'Disciplina Deletada'} {subject ? `(Semestre ${subject.semester})` : ''}
                        </div>
                      </div>
                      <div className="flex gap-2 self-center shrink-0">
                        <button
                          onClick={() => handleEditClick(sum)}
                          title="Editar resumo"
                          className="p-1.5 bg-brand-medium/35 hover:bg-brand-medium border border-brand-medium text-brand-light hover:text-white rounded-lg transition-all"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(sum.id)}
                          title="Excluir resumo"
                          className="p-1.5 bg-red-950/30 hover:bg-red-900 border border-red-500/20 text-red-400 hover:text-white rounded-lg transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
