import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, FileText, CheckCircle2, BookOpenCheck } from 'lucide-react';

export const AdminContent: React.FC = () => {
  const { courses, subjects, summaries, addSummary, addCourse, addSubject } = useAuth();

  // Active Tabs States
  const [leftTab, setLeftTab] = useState<'summary' | 'course' | 'subject'>('summary');
  const [rightTab, setRightTab] = useState<'summaries' | 'structure'>('summaries');

  // Success messaging
  const [successMsg, setSuccessMsg] = useState('');

  // Form State: Summary
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [isPremium, setIsPremium] = useState(false);

  // Form State: Course
  const [courseName, setCourseName] = useState('');

  // Form State: Subject
  const [subjectName, setSubjectName] = useState('');
  const [subjectCourseId, setSubjectCourseId] = useState(courses[0]?.id || '');
  const [subjectSemester, setSubjectSemester] = useState(1);

  // Handlers
  const handleCreateSummary = (e: React.FormEvent) => {
    e.preventDefault();
    const activeSubjectId = subjectId || subjects[0]?.id;
    if (!title || !description || !activeSubjectId) return;

    addSummary({
      title,
      description,
      subjectId: activeSubjectId,
      isPremium
    });

    setTitle('');
    setDescription('');
    setIsPremium(false);
    showSuccess('Resumo publicado com sucesso!');
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    addCourse(courseName.trim());
    
    // Auto update course selectors
    if (!subjectCourseId && courses.length === 0) {
      setSubjectCourseId(`c-${Date.now()}`); 
    }

    setCourseName('');
    showSuccess('Curso cadastrado com sucesso!');
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const activeCourseId = subjectCourseId || courses[0]?.id;
    if (!subjectName.trim() || !activeCourseId) return;

    addSubject(subjectName.trim(), activeCourseId, Number(subjectSemester));
    
    // Auto update subject selector for summaries
    if (!subjectId && subjects.length === 0) {
      setSubjectId(`s-${Date.now()}`);
    }

    setSubjectName('');
    setSubjectSemester(1);
    showSuccess('Disciplina cadastrada com sucesso!');
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Cursos e Conteúdos</h2>
        <p className="text-gray-400 text-xs mt-1">
          Gerencie a estrutura acadêmica cadastrando cursos, disciplinas e publicando resumos em PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Forms Panel (col-span-5) */}
        <div className="lg:col-span-5 bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl h-fit space-y-5">
          {/* Tabs Selector for Forms */}
          <div className="flex border-b border-brand-medium/40 text-xs font-bold">
            <button
              onClick={() => setLeftTab('summary')}
              className={`flex-1 pb-3 text-center transition-all ${
                leftTab === 'summary' 
                  ? 'text-brand-light border-b-2 border-brand-light' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Publicar Resumo
            </button>
            <button
              onClick={() => setLeftTab('course')}
              className={`flex-1 pb-3 text-center transition-all ${
                leftTab === 'course' 
                  ? 'text-brand-light border-b-2 border-brand-light' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Cadastrar Curso
            </button>
            <button
              onClick={() => setLeftTab('subject')}
              className={`flex-1 pb-3 text-center transition-all ${
                leftTab === 'subject' 
                  ? 'text-brand-light border-b-2 border-brand-light' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Cadastrar Matéria
            </button>
          </div>

          {successMsg && (
            <div className="bg-green-950/35 border border-green-500/35 text-green-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              {successMsg}
            </div>
          )}

          {/* Form 1: Publish Summary */}
          {leftTab === 'summary' && (
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
                  Matéria/Disciplina Associada
                </label>
                <select
                  value={subjectId}
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
                <div className="border-2 border-dashed border-brand-medium/60 rounded-xl p-3 text-center text-xs text-gray-505 bg-brand-dark/20">
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
          )}

          {/* Form 2: Create Course */}
          {leftTab === 'course' && (
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                  Nome do Novo Curso
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Direito, Administração, Economia..."
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-light focus:outline-none"
                />
              </div>

              <div className="bg-brand-dark/30 border border-brand-medium/55 p-3 rounded-xl text-[10px] text-gray-400 leading-relaxed">
                Os cursos servem como a categoria principal na qual as disciplinas/matérias serão vinculadas.
              </div>

              <button
                type="submit"
                className="w-full bg-brand-light hover:bg-white text-brand-dark py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-light/5"
              >
                Cadastrar Curso
              </button>
            </form>
          )}

          {/* Form 3: Create Subject */}
          {leftTab === 'subject' && (
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
                    value={subjectCourseId}
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
          )}
        </div>

        {/* Right Column: Library & Academic Structure Lists (col-span-7) */}
        <div className="lg:col-span-7 bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl flex flex-col h-[580px]">
          {/* Header Tabs for view */}
          <div className="flex border-b border-brand-medium/40 text-xs font-bold mb-4">
            <button
              onClick={() => setRightTab('summaries')}
              className={`pb-3 pr-6 transition-all flex items-center gap-1.5 ${
                rightTab === 'summaries' 
                  ? 'text-brand-light border-b-2 border-brand-light' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen size={14} /> Resumos Publicados ({summaries.length})
            </button>
            <button
              onClick={() => setRightTab('structure')}
              className={`pb-3 pr-6 transition-all flex items-center gap-1.5 ${
                rightTab === 'structure' 
                  ? 'text-brand-light border-b-2 border-brand-light' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpenCheck size={14} /> Cursos & Disciplinas ({courses.length})
            </button>
          </div>

          {/* List View 1: Summaries */}
          {rightTab === 'summaries' && (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {summaries.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  Nenhum resumo publicado ainda.
                </div>
              ) : (
                summaries.map(sum => {
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
                          {course?.name || 'Curso Não Identificado'} &bull; {subject?.name || 'Matéria Deletada'} {subject ? `(Semestre ${subject.semester})` : ''}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* List View 2: Course & Subject structure */}
          {rightTab === 'structure' && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {courses.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  Nenhum curso cadastrado ainda.
                </div>
              ) : (
                courses.map(course => {
                  const courseSubjects = subjects.filter(s => s.courseId === course.id);
                  return (
                    <div key={course.id} className="border border-brand-medium/35 bg-brand-dark/30 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-brand-medium/40 pb-2">
                        <h4 className="font-bold text-xs text-white uppercase tracking-wider">{course.name}</h4>
                        <span className="text-[9px] bg-brand-medium text-brand-light px-2 py-0.5 rounded-full font-bold">
                          {courseSubjects.length} Disciplinas
                        </span>
                      </div>
                      
                      {courseSubjects.length === 0 ? (
                        <p className="text-[10px] text-gray-500 italic">Nenhuma disciplina cadastrada neste curso.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {courseSubjects.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between text-[11px] text-gray-300 bg-brand-medium/10 px-2.5 py-1.5 rounded-lg">
                              <span>{sub.name}</span>
                              <span className="text-[9px] text-brand-light font-medium">Semestre {sub.semester}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
