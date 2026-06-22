import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpenCheck, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  Pencil, 
  Trash2, 
  X, 
  Check, 
  AlertTriangle,
  FileText,
  HelpCircle
} from 'lucide-react';

export const AdminAcademic: React.FC = () => {
  const { 
    courses, 
    subjects, 
    summaries,
    questions,
    addCourse, 
    addSubject,
    deleteCourse,
    updateCourse,
    deleteSubject,
    updateSubject,
    deleteSummariesBySubject,
    deleteQuestionsBySubject,
    clearCourseContent
  } = useAuth();

  // Success messaging
  const [successMsg, setSuccessMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State: Course
  const [courseName, setCourseName] = useState('');

  // Form State: Subject
  const [subjectName, setSubjectName] = useState('');
  const [subjectCourseId, setSubjectCourseId] = useState('');
  const [subjectSemester, setSubjectSemester] = useState(1);

  // Inline Editing States
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingCourseName, setEditingCourseName] = useState('');

  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState('');
  const [editingSubjectSemester, setEditingSubjectSemester] = useState(1);

  // Filter States
  const [filterCourseId, setFilterCourseId] = useState<string>('all');
  const [searchSubjectQuery, setSearchSubjectQuery] = useState<string>('');

  // Modals for deletion
  const [deletingCourse, setDeletingCourse] = useState<any | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<any | null>(null);

  // Sync subjectCourseId when courses list loads or changes
  useEffect(() => {
    if (courses.length > 0 && (!subjectCourseId || !courses.some(c => c.id === subjectCourseId))) {
      setSubjectCourseId(courses[0].id);
    }
  }, [courses, subjectCourseId]);

  // Handlers
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    try {
      await addCourse(courseName.trim());
      setCourseName('');
      showSuccess('Curso cadastrado com sucesso!');
    } catch (err) {
      // O erro global já é tratado pelo AuthContext
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeCourseId = subjectCourseId || courses[0]?.id;
    if (!subjectName.trim() || !activeCourseId) return;

    try {
      await addSubject(subjectName.trim(), activeCourseId, Number(subjectSemester));
      setSubjectName('');
      setSubjectSemester(1);
      showSuccess('Disciplina cadastrada com sucesso!');
    } catch (err) {
      // O erro global já é tratado pelo AuthContext
    }
  };

  // Inline Save Handlers
  const handleSaveCourseEdit = async (id: string) => {
    if (!editingCourseName.trim()) return;
    try {
      await updateCourse(id, editingCourseName.trim());
      setEditingCourseId(null);
      showSuccess('Curso atualizado com sucesso!');
    } catch (err) {
      // O erro global já é tratado
    }
  };

  const handleSaveSubjectEdit = async (id: string) => {
    if (!editingSubjectName.trim()) return;
    try {
      await updateSubject(id, editingSubjectName.trim(), editingSubjectSemester);
      setEditingSubjectId(null);
      showSuccess('Disciplina atualizada com sucesso!');
    } catch (err) {
      // O erro global já é tratado
    }
  };

  // Safe Deletion Handlers
  const handleConfirmDeleteSubject = async () => {
    if (!deletingSubject) return;
    setIsDeleting(true);
    try {
      await deleteSubject(deletingSubject.id);
      setDeletingSubject(null);
      showSuccess('Disciplina excluída com sucesso!');
    } catch (err) {
      // Trtamento via AuthContext
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteCourse = async () => {
    if (!deletingCourse) return;
    setIsDeleting(true);
    try {
      await deleteCourse(deletingCourse.id);
      setDeletingCourse(null);
      showSuccess('Curso excluído com sucesso!');
    } catch (err) {
      // Tratamento via AuthContext
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearSummaries = async (subjId: string) => {
    setIsDeleting(true);
    try {
      await deleteSummariesBySubject(subjId);
      showSuccess('Todos os resumos da disciplina foram excluídos!');
    } catch (err) {
      // Tratamento via AuthContext
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearQuestions = async (subjId: string) => {
    setIsDeleting(true);
    try {
      await deleteQuestionsBySubject(subjId);
      showSuccess('Todas as questões da disciplina foram excluídas!');
    } catch (err) {
      // Tratamento via AuthContext
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearCourseContent = async (crsId: string) => {
    setIsDeleting(true);
    try {
      await clearCourseContent(crsId);
      showSuccess('Todas as disciplinas e conteúdos do curso foram limpos!');
    } catch (err) {
      // Tratamento via AuthContext
    } finally {
      setIsDeleting(false);
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
        <h2 className="text-2xl font-bold text-white">Cursos e Disciplinas</h2>
        <p className="text-gray-400 text-xs mt-1">
          Gerencie a estrutura acadêmica cadastrando cursos, disciplinas e organizando a grade curricular.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Registration Forms (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {successMsg && (
            <div className="bg-green-950/35 border border-green-500/35 text-green-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              {successMsg}
            </div>
          )}

          {/* Form 1: Create Course */}
          <div className="bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-brand-medium/30 pb-3">
              <Layers className="w-4 h-4 text-brand-light" />
              <h3 className="text-sm font-bold text-white">Cadastrar Novo Curso</h3>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                  Nome do Curso
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Direito, Administração, Economia..."
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-3.5 py-2 text-xs text-white focus:border-brand-light focus:outline-none"
                />
              </div>

              <div className="bg-brand-dark/30 border border-brand-medium/55 p-3 rounded-xl text-[10px] text-gray-400 leading-relaxed">
                Os cursos servem como a categoria principal na qual as disciplinas serão vinculadas.
              </div>

              <button
                type="submit"
                className="w-full bg-brand-light hover:bg-white text-brand-dark py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-light/5"
              >
                Cadastrar Curso
              </button>
            </form>
          </div>

          {/* Form 2: Create Subject */}
          <div className="bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-brand-medium/30 pb-3">
              <BookOpen className="w-4 h-4 text-brand-light" />
              <h3 className="text-sm font-bold text-white">Cadastrar Nova Disciplina</h3>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                  Nome da Disciplina
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Direito Civil III, Contabilidade..."
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-3.5 py-2 text-xs text-white focus:border-brand-light focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                    Curso Vinculado
                  </label>
                  <select
                    value={subjectCourseId || (courses[0]?.id || '')}
                    onChange={(e) => setSubjectCourseId(e.target.value)}
                    className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-2.5 py-2 text-xs text-white focus:border-brand-light focus:outline-none"
                  >
                    {courses.length === 0 ? (
                      <option value="">Nenhum curso cadastrado</option>
                    ) : (
                      courses.map(course => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                    Semestre Letivo
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={12}
                    value={subjectSemester}
                    onChange={(e) => setSubjectSemester(Number(e.target.value))}
                    className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-3.5 py-1.5 text-xs text-white focus:border-brand-light focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={courses.length === 0}
                className="w-full bg-brand-light hover:bg-white text-brand-dark py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-brand-light/5"
              >
                Cadastrar Disciplina
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Academic Structure Tree (col-span-7) */}
        <div className="lg:col-span-7 bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl flex flex-col h-[616px]">
          <div className="flex items-center gap-1.5 border-b border-brand-medium/40 text-xs font-bold pb-3 mb-4 text-brand-light shrink-0">
            <BookOpenCheck size={16} />
            <span>Estrutura de Cursos e Disciplinas ({courses.length})</span>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 pb-4 border-b border-brand-medium/30 shrink-0">
            <div>
              <label className="block text-[10px] font-semibold text-brand-light uppercase tracking-wider mb-1">
                Filtrar por Curso
              </label>
              <select
                value={filterCourseId}
                onChange={(e) => setFilterCourseId(e.target.value)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-2.5 py-1.5 text-xs text-white focus:border-brand-light focus:outline-none"
              >
                <option value="all">Todos os Cursos</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-brand-light uppercase tracking-wider mb-1">
                Buscar Disciplina
              </label>
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchSubjectQuery}
                onChange={(e) => setSearchSubjectQuery(e.target.value)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-3 py-1.5 text-xs text-white focus:border-brand-light focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {(() => {
              const filteredCourses = courses.filter(course => {
                if (filterCourseId !== 'all' && course.id !== filterCourseId) {
                  return false;
                }
                
                if (searchSubjectQuery.trim() !== '') {
                  const courseSubjects = subjects.filter(s => s.courseId === course.id);
                  const matchingSubjects = courseSubjects.filter(sub => 
                    sub.name.toLowerCase().includes(searchSubjectQuery.toLowerCase())
                  );
                  return matchingSubjects.length > 0;
                }
                
                return true;
              });

              if (courses.length === 0) {
                return (
                  <div className="text-center py-12 text-gray-500 text-xs">
                    Nenhum curso cadastrado ainda.
                  </div>
                );
              }

              if (filteredCourses.length === 0) {
                return (
                  <div className="text-center py-12 text-gray-500 text-xs">
                    Nenhuma disciplina ou curso encontrado para os filtros aplicados.
                  </div>
                );
              }

              return filteredCourses.map(course => {
                const courseSubjects = subjects.filter(s => s.courseId === course.id);
                const displayedSubjects = courseSubjects
                  .filter(sub => sub.name.toLowerCase().includes(searchSubjectQuery.toLowerCase()))
                  .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
                return (
                  <div key={course.id} className="border border-brand-medium/35 bg-brand-dark/30 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-brand-medium/40 pb-2">
                      {editingCourseId === course.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingCourseName}
                            onChange={(e) => setEditingCourseName(e.target.value)}
                            className="bg-brand-dark border border-brand-medium/60 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-brand-light flex-1 max-w-[200px]"
                          />
                          <button
                            onClick={() => handleSaveCourseEdit(course.id)}
                            className="text-green-450 hover:text-green-300 p-1"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingCourseId(null)}
                            className="text-red-450 hover:text-red-300 p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-white uppercase tracking-wider">{course.name}</h4>
                          <button
                            onClick={() => {
                              setEditingCourseId(course.id);
                              setEditingCourseName(course.name);
                            }}
                            className="text-gray-400 hover:text-brand-light transition-colors p-1"
                            title="Editar Curso"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => setDeletingCourse(course)}
                            className="text-gray-400 hover:text-red-400 transition-colors p-1"
                            title="Excluir Curso"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                      
                      <span className="text-[9px] bg-brand-medium text-brand-light px-2 py-0.5 rounded-full font-bold">
                        {courseSubjects.length} Disciplinas
                      </span>
                    </div>
                    
                    {displayedSubjects.length === 0 ? (
                      <p className="text-[10px] text-gray-500 italic">Nenhuma disciplina cadastrada neste curso ou correspondente ao filtro.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {displayedSubjects.map(sub => (
                          <div key={sub.id} className="flex items-center justify-between text-[11px] text-gray-300 bg-brand-medium/10 px-2.5 py-1.5 rounded-lg">
                            {editingSubjectId === sub.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={editingSubjectName}
                                  onChange={(e) => setEditingSubjectName(e.target.value)}
                                  className="bg-brand-dark border border-brand-medium/60 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-brand-light flex-1 max-w-[180px]"
                                />
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] text-gray-400">Sem.</span>
                                  <input
                                    type="number"
                                    min={1}
                                    max={12}
                                    value={editingSubjectSemester}
                                    onChange={(e) => setEditingSubjectSemester(Number(e.target.value))}
                                    className="bg-brand-dark border border-brand-medium/60 rounded px-1.5 py-0.5 text-xs text-white w-10 text-center focus:outline-none"
                                  />
                                </div>
                                <button
                                  onClick={() => handleSaveSubjectEdit(sub.id)}
                                  className="text-green-450 hover:text-green-300 p-0.5"
                                >
                                  <Check size={13} />
                                </button>
                                <button
                                  onClick={() => setEditingSubjectId(null)}
                                  className="text-red-450 hover:text-red-300 p-0.5"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <span>{sub.name}</span>
                                  <button
                                    onClick={() => {
                                      setEditingSubjectId(sub.id);
                                      setEditingSubjectName(sub.name);
                                      setEditingSubjectSemester(sub.semester);
                                    }}
                                    className="text-gray-500 hover:text-brand-light transition-colors p-0.5"
                                    title="Editar Disciplina"
                                  >
                                    <Pencil size={11} />
                                  </button>
                                  <button
                                    onClick={() => setDeletingSubject(sub)}
                                    className="text-gray-500 hover:text-red-400 transition-colors p-0.5"
                                    title="Excluir Disciplina"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                                <span className="text-[9px] text-brand-light font-medium">Semestre {sub.semester}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Modal 1: Exclusão de Curso */}
      {deletingCourse && (() => {
        const courseSubs = subjects.filter(s => s.courseId === deletingCourse.id);
        const courseSubsIds = courseSubs.map(s => s.id);
        const courseSummariesCount = summaries.filter(sum => courseSubsIds.includes(sum.subjectId)).length;
        const courseQuestionsCount = questions.filter(q => courseSubsIds.includes(q.subjectId)).length;
        const hasDependencies = courseSubs.length > 0;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-brand-dark border-2 border-brand-medium/60 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-950/30 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} className="animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h4 className="font-bold text-white text-sm">Confirmar Exclusão de Curso</h4>
                <p className="text-xs text-gray-300">
                  Você está prestes a excluir o curso <strong className="text-white">{deletingCourse.name}</strong>.
                </p>
              </div>

              {hasDependencies ? (
                <div className="bg-brand-medium/10 border border-brand-medium/40 p-4 rounded-xl space-y-3">
                  <div className="text-[11px] text-gray-350 leading-relaxed text-center">
                    A exclusão não é permitida diretamente porque existem conteúdos vinculados a este curso:
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-white">
                    <div className="bg-brand-dark/40 p-2 rounded-lg border border-brand-medium/35">
                      <div className="text-brand-light text-sm">{courseSubs.length}</div>
                      <div className="text-[9px] text-gray-400 font-medium">Disciplinas</div>
                    </div>
                    <div className="bg-brand-dark/40 p-2 rounded-lg border border-brand-medium/35">
                      <div className="text-brand-light text-sm">{courseSummariesCount}</div>
                      <div className="text-[9px] text-gray-400 font-medium">Resumos</div>
                    </div>
                    <div className="bg-brand-dark/40 p-2 rounded-lg border border-brand-medium/35">
                      <div className="text-brand-light text-sm">{courseQuestionsCount}</div>
                      <div className="text-[9px] text-gray-400 font-medium">Questões</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClearCourseContent(deletingCourse.id)}
                    disabled={isDeleting}
                    className="w-full bg-red-900/50 hover:bg-red-800 text-red-100 py-2 rounded-xl text-xs font-bold border border-red-700/35 transition-all disabled:opacity-50"
                  >
                    {isDeleting ? 'Limpando...' : 'Limpar todas as disciplinas e conteúdos'}
                  </button>
                </div>
              ) : (
                <div className="bg-green-950/20 border border-green-500/20 p-3.5 rounded-xl text-[11px] text-green-300 text-center">
                  Este curso não possui disciplinas ou conteúdos vinculados e pode ser excluído com segurança.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingCourse(null)}
                  disabled={isDeleting}
                  className="flex-1 bg-brand-medium/40 hover:bg-brand-medium text-white py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDeleteCourse}
                  disabled={hasDependencies || isDeleting}
                  className="flex-1 bg-red-650 hover:bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:hover:bg-red-650"
                >
                  Excluir Curso
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal 2: Exclusão de Disciplina */}
      {deletingSubject && (() => {
        const subSummaries = summaries.filter(sum => sum.subjectId === deletingSubject.id);
        const subQuestions = questions.filter(q => q.subjectId === deletingSubject.id);
        const hasDependencies = subSummaries.length > 0 || subQuestions.length > 0;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-brand-dark border-2 border-brand-medium/60 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-950/30 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} className="animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h4 className="font-bold text-white text-sm">Confirmar Exclusão de Disciplina</h4>
                <p className="text-xs text-gray-300">
                  Você está prestes a excluir a disciplina <strong className="text-white">{deletingSubject.name}</strong>.
                </p>
              </div>

              {hasDependencies ? (
                <div className="bg-brand-medium/10 border border-brand-medium/40 p-4 rounded-xl space-y-3.5">
                  <div className="text-[11px] text-gray-350 leading-relaxed text-center pb-1 border-b border-brand-medium/20">
                    A exclusão não é permitida diretamente porque existem dependências:
                  </div>

                  {subSummaries.length > 0 && (
                    <div className="flex items-center justify-between gap-3 text-xs bg-brand-dark/45 p-2.5 rounded-lg border border-brand-medium/30">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-brand-light" />
                        <span className="text-gray-300"><strong>{subSummaries.length}</strong> resumos associados</span>
                      </div>
                      <button
                        onClick={() => handleClearSummaries(deletingSubject.id)}
                        disabled={isDeleting}
                        className="bg-red-950/45 hover:bg-red-900/60 text-red-300 px-3 py-1 rounded-md text-[10px] font-bold border border-red-700/20 transition-all"
                      >
                        Excluir Resumos
                      </button>
                    </div>
                  )}

                  {subQuestions.length > 0 && (
                    <div className="flex items-center justify-between gap-3 text-xs bg-brand-dark/45 p-2.5 rounded-lg border border-brand-medium/30">
                      <div className="flex items-center gap-2">
                        <HelpCircle size={16} className="text-brand-light" />
                        <span className="text-gray-300"><strong>{subQuestions.length}</strong> questões associadas</span>
                      </div>
                      <button
                        onClick={() => handleClearQuestions(deletingSubject.id)}
                        disabled={isDeleting}
                        className="bg-red-950/45 hover:bg-red-900/60 text-red-300 px-3 py-1 rounded-md text-[10px] font-bold border border-red-700/20 transition-all"
                      >
                        Excluir Questões
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-green-950/20 border border-green-500/20 p-3.5 rounded-xl text-[11px] text-green-300 text-center">
                  Esta disciplina não possui resumos ou questões vinculados e pode ser excluída com segurança.
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingSubject(null)}
                  disabled={isDeleting}
                  className="flex-1 bg-brand-medium/40 hover:bg-brand-medium text-white py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDeleteSubject}
                  disabled={hasDependencies || isDeleting}
                  className="flex-1 bg-red-650 hover:bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:hover:bg-red-650"
                >
                  Excluir Disciplina
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
