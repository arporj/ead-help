import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpenCheck, CheckCircle2, BookOpen, Layers } from 'lucide-react';

export const AdminAcademic: React.FC = () => {
  const { courses, subjects, addCourse, addSubject } = useAuth();

  // Success messaging
  const [successMsg, setSuccessMsg] = useState('');

  // Form State: Course
  const [courseName, setCourseName] = useState('');

  // Form State: Subject
  const [subjectName, setSubjectName] = useState('');
  const [subjectCourseId, setSubjectCourseId] = useState(courses[0]?.id || '');
  const [subjectSemester, setSubjectSemester] = useState(1);

  // Handlers
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    try {
      await addCourse(courseName.trim());
      
      // Auto update course selectors
      if (!subjectCourseId && courses.length === 0) {
        setSubjectCourseId(`c-${Date.now()}`); 
      }

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
        </div>
      </div>
    </div>
  );
};
