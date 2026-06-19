import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, FileText, CheckCircle2 } from 'lucide-react';

export const AdminContent: React.FC = () => {
  const { courses, subjects, summaries, addSummary } = useAuth();

  // Success messaging
  const [successMsg, setSuccessMsg] = useState('');

  // Form State: Summary
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [isPremium, setIsPremium] = useState(false);

  // Filter States for Published Summaries
  const [filterCourseId, setFilterCourseId] = useState<string>('all');
  const [filterSubjectName, setFilterSubjectName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const availableSubjectsForFilter = subjects.filter(sub => {
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
  const handleCreateSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeSubjectId = subjectId || subjects[0]?.id;
    if (!title || !description || !activeSubjectId) return;

    try {
      await addSummary({
        title,
        description,
        subjectId: activeSubjectId,
        isPremium
      });

      setTitle('');
      setDescription('');
      setIsPremium(false);
      showSuccess('Resumo publicado com sucesso!');
    } catch (err) {
      // O erro global já é tratado pelo AuthContext
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
          <div className="flex items-center gap-2 border-b border-brand-medium/30 pb-3">
            <FileText className="w-4 h-4 text-brand-light" />
            <h3 className="text-sm font-bold text-white font-semibold">Publicar Novo Resumo</h3>
          </div>

          {successMsg && (
            <div className="bg-green-950/35 border border-green-500/35 text-green-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleCreateSummary} className="space-y-4">
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

            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                Disciplina Associada
              </label>
              <select
                value={subjectId || (subjects[0]?.id || '')}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-2.5 py-2 text-xs text-white focus:border-brand-light focus:outline-none"
              >
                {subjects.length === 0 ? (
                  <option value="">Nenhuma disciplina cadastrada</option>
                ) : (
                  subjects.map(sub => {
                    const courseName = courses.find(c => c.id === sub.courseId)?.name || 'Curso';
                    return (
                      <option key={sub.id} value={sub.id}>
                        {courseName.substring(0, 12)}... - {sub.name} (Sem. {sub.semester})
                      </option>
                    );
                  })
                )}
              </select>
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
              Publicar Resumo
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
                      <div className="space-y-1">
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
