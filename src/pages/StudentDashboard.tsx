import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Lock, CheckCircle2, ChevronRight, CornerUpLeft, Download, BookOpen, Search, Check, RefreshCw } from 'lucide-react';
import type { Summary } from '../types';

export const StudentDashboard: React.FC = () => {
  const { studentProfile, summaries, subjects, courses, saveStudentSubjects, plansConfig } = useAuth();
  const [readingSummary, setReadingSummary] = useState<Summary | null>(null);

  // States para a tela de selecao de disciplinas
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [subjectSearchText, setSubjectSearchText] = useState('');
  const [subjectCourseId, setSubjectCourseId] = useState('all');
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  // Mapear plano do aluno
  const plan = studentProfile?.plan || 'basic';
  const isBasic = plan === 'basic';
  
  // Obter limite do plano
  const planConfig = plansConfig.find(p => p.planType === plan);
  const maxSubjects = planConfig?.maxSubjects || 0;

  // Verificar se o estudante ja configurou sua grade
  const hasConfiguredGrade = isBasic || (studentProfile?.studentSubjects && studentProfile.studentSubjects.length > 0);

  // Filtrar disciplinas para selecao
  const filteredSubjects = subjects.filter(subj => {
    const matchesSearch = subj.name.toLowerCase().includes(subjectSearchText.toLowerCase());
    const matchesCourse = subjectCourseId === 'all' || subj.courseId === subjectCourseId;
    return matchesSearch && matchesCourse;
  });

  // Ordenar disciplinas por semestre e depois alfabeticamente
  const sortedSubjectsForSelection = [...filteredSubjects].sort((a, b) => {
    if (a.semester !== b.semester) {
      return a.semester - b.semester;
    }
    return a.name.localeCompare(b.name, 'pt-BR');
  });

  const handleToggleSubject = (subjectId: string) => {
    if (selectedSubjectIds.includes(subjectId)) {
      setSelectedSubjectIds(prev => prev.filter(id => id !== subjectId));
    } else {
      if (selectedSubjectIds.length >= maxSubjects) {
        alert(`Seu plano permite selecionar no máximo ${maxSubjects} disciplinas na grade regular.`);
        return;
      }
      setSelectedSubjectIds(prev => [...prev, subjectId]);
    }
  };

  const handleConfirmGrade = async () => {
    if (selectedSubjectIds.length === 0) {
      alert('Por favor, selecione ao menos 1 disciplina.');
      return;
    }
    setIsSubmittingGrade(true);
    try {
      await saveStudentSubjects(selectedSubjectIds);
    } catch (err) {
      // Erro tratado globalmente
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  // Filtrar resumos visiveis para o estudante
  const studentSubjectIds = studentProfile?.studentSubjects?.map(ss => ss.subjectId) || [];
  const allowedSummaries = summaries.filter(sum => {
    if (isBasic) return true; // Gratuito ve todos, mas os premium ficam trancados
    return studentSubjectIds.includes(sum.subjectId); // Pro/Premium veem apenas as materias da grade
  });

  // Verificar se o aluno tem acesso ao PDF do resumo
  const getHasAccess = (sum: Summary) => {
    if (!sum.isPremium) return true; // Resumo livre
    if (!studentProfile) return false;
    if (studentProfile.plan === 'premium') return true; // Premium tem acesso total
    
    // Pro/Premium com acesso manual liberado
    return studentProfile.summaryAccess.includes(sum.id);
  };

  const handleRead = (sum: Summary) => {
    if (getHasAccess(sum)) {
      setReadingSummary(sum);
    }
  };

  // Se o aluno Pro/Premium nao configurou sua grade, exibir tela de selecao
  if (!hasConfiguredGrade) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-brand-medium/10 border border-brand-light/35 p-6 sm:p-8 rounded-2xl space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-medium/40 border border-brand-light/30 flex items-center justify-center text-brand-light">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Monte sua Grade Semestral</h2>
              <span className="text-xs text-gray-450 block">Selecione as disciplinas que você irá cursar</span>
            </div>
          </div>

          <div className="bg-yellow-600/10 border border-yellow-500/20 text-yellow-300 p-4 rounded-xl text-xs leading-relaxed space-y-1">
            <span className="font-bold block uppercase tracking-wide">Atenção às Regras:</span>
            <ul className="list-disc pl-4 space-y-1 text-gray-300 text-[11px]">
              <li>De acordo com o plano contratado, você pode escolher **até {maxSubjects} disciplinas**.</li>
              <li>A escolha é definitiva e **não haverá troca de disciplinas** durante a vigência do seu plano.</li>
              <li>Você terá acesso aos quizzes, simulados, BDQ e resumos premium apenas das matérias escolhidas aqui.</li>
            </ul>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar disciplina por nome..."
                value={subjectSearchText}
                onChange={(e) => setSubjectSearchText(e.target.value)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-brand-light focus:outline-none"
              />
            </div>

            <div className="w-full sm:w-48">
              <select
                value={subjectCourseId}
                onChange={(e) => setSubjectCourseId(e.target.value)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-light focus:outline-none cursor-pointer"
              >
                <option value="all">Todos os Cursos</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid de Disciplinas */}
          <div className="max-h-80 overflow-y-auto border border-brand-medium/35 bg-brand-dark/30 rounded-xl p-3.5 space-y-2.5">
            {sortedSubjectsForSelection.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs italic">
                Nenhuma disciplina encontrada.
              </div>
            ) : (
              sortedSubjectsForSelection.map(subj => {
                const isSelected = selectedSubjectIds.includes(subj.id);
                const courseName = courses.find(c => c.id === subj.courseId)?.name || 'Curso';

                return (
                  <div
                    key={subj.id}
                    onClick={() => handleToggleSubject(subj.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                      isSelected
                        ? 'bg-brand-medium/25 border-brand-light/60 text-white shadow-md'
                        : 'bg-brand-dark/25 border-brand-medium/20 text-gray-450 hover:border-brand-medium/60 hover:text-gray-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-[9px] uppercase text-brand-light bg-brand-medium/55 px-1.5 py-0.5 rounded mr-2">
                        Semestre {subj.semester}
                      </span>
                      <span className="font-semibold text-xs text-white">{subj.name}</span>
                      <span className="text-[10px] text-gray-450 block mt-0.5">{courseName}</span>
                    </div>

                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-brand-light border-brand-light text-brand-dark'
                        : 'border-brand-medium/60'
                    }`}>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer de confirmacao */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-brand-medium/30">
            <span className="text-xs text-gray-400">
              Selecionadas: <strong className="text-brand-light">{selectedSubjectIds.length} / {maxSubjects}</strong> disciplinas
            </span>

            <button
              onClick={handleConfirmGrade}
              disabled={selectedSubjectIds.length === 0 || isSubmittingGrade}
              className="w-full sm:w-auto bg-brand-light hover:bg-white text-brand-dark px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-light/5 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSubmittingGrade && <RefreshCw className="animate-spin" size={12} />}
              Confirmar e Salvar Grade
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Visualizacao Padrao do Dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Meus Estudos</h2>
        <p className="text-gray-400 text-xs mt-1">
          {isBasic 
            ? 'Acesse os resumos em PDF de introdução acadêmica liberados.' 
            : 'Acesse os resumos em PDF correspondentes às disciplinas de sua grade contratada.'}
        </p>
      </div>

      {readingSummary ? (
        /* PDF Viewer Pane */
        <div className="bg-brand-medium/10 border border-brand-medium/50 rounded-2xl p-6 space-y-4 shadow-2xl relative">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setReadingSummary(null)}
              className="flex items-center gap-1.5 text-xs text-brand-light hover:text-white transition-colors cursor-pointer"
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
          {allowedSummaries.length === 0 ? (
            <div className="col-span-2 bg-brand-medium/10 border border-brand-medium/45 p-8 rounded-2xl text-center text-gray-400 text-xs">
              Nenhum resumo disponível para as suas disciplinas contratadas.
            </div>
          ) : (
            allowedSummaries.map(sum => {
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
                      <button className="flex items-center gap-1 text-[11px] text-brand-light font-bold hover:text-white transition-colors cursor-pointer">
                        Ler Resumo <ChevronRight size={14} />
                      </button>
                    ) : (
                      <div className="text-[10px] text-red-350 font-bold flex items-center gap-1 bg-red-950/20 px-2.5 py-1 rounded-lg border border-red-550/15">
                        <Lock size={11} /> Bloqueado (Cota Excedida)
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
