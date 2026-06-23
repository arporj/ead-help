import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Question } from '../types';
import { HelpCircle, Play, AlertTriangle, CheckCircle, XCircle, ArrowRight, Award } from 'lucide-react';

export const StudentExams: React.FC = () => {
  const { studentProfile, questions, subjects, courses, addExamCycle } = useAuth();

  // Listagem de disciplinas ordenada alfabeticamente para a interface
  const sortedSubjects = [...subjects].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  const studentSubjectIds = studentProfile?.studentSubjects?.map(ss => ss.subjectId) || [];
  
  // Filtrar disciplinas de acordo com o plano do aluno
  const availableSubjects = sortedSubjects.filter(sub => {
    if (studentProfile?.plan === 'basic' || !studentProfile) return true; // Gratuito ve todas
    return studentSubjectIds.includes(sub.id);
  });

  const todayStr = new Date().toLocaleDateString('pt-BR');
  const hasDoneExamToday = (studentProfile?.plan === 'basic' || !studentProfile) && (studentProfile?.examCycles || []).some(cycle => {
    if (!cycle.completedAt) return false;
    const cycleDateStr = new Date(cycle.completedAt).toLocaleDateString('pt-BR');
    return cycleDateStr === todayStr;
  });

  // States
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [courseSearchText, setCourseSearchText] = useState('');
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [subjectSearchText, setSubjectSearchText] = useState('');
  const [isExamRunning, setIsExamRunning] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const isProOrPremium = studentProfile?.plan === 'pro' || studentProfile?.plan === 'premium';

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedSubjectId('all');
    setSubjectSearchText('');
    setIsSubjectDropdownOpen(false);
    setCourseSearchText('');
  };

  // Filter and build the 10 questions session
  const handleStartExam = () => {
    // 1. Filter questions by course and subject
    let filtered = questions.filter(q => {
      // Check if student plan allows this question
      if (q.isProOrPremium && !isProOrPremium) return false;

      // Se for Pro/Premium, filtrar apenas questoes das disciplinas contratadas
      if (isProOrPremium && !studentSubjectIds.includes(q.subjectId)) {
        return false;
      }
      
      // Filter by subject if specified
      if (selectedSubjectId !== 'all') {
        return q.subjectId === selectedSubjectId;
      }
      
      // If subject is 'all' but course is specified, filter by course
      if (selectedCourseId !== 'all') {
        const subject = subjects.find(s => s.id === q.subjectId);
        if (!subject || subject.courseId !== selectedCourseId) return false;
      }
      
      return true;
    });

    // If we have fewer than 10 questions in this filter, let's complement with others
    if (filtered.length < 10) {
      const others = questions.filter(q => {
        if (q.isProOrPremium && !isProOrPremium) return false;
        return !filtered.some(fq => fq.id === q.id);
      });
      filtered = [...filtered, ...others].slice(0, 10);
    }

    // If still less than 10 (unlikely with our seed, but safe), just duplicate
    let sessionQs = [...filtered];
    while (sessionQs.length < 10 && sessionQs.length > 0) {
      sessionQs = [...sessionQs, ...sessionQs];
    }
    sessionQs = sessionQs.slice(0, 10);

    // Shuffle options dynamically for better mock UX
    setExamQuestions(sessionQs);
    setCurrentIdx(0);
    setSelectedAnswerIdx(null);
    setIsAnswered(false);
    setScore(0);
    setIsExamRunning(true);
    setIsFinished(false);
    setShowExitConfirm(false);
  };

  const handleAnswerClick = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedAnswerIdx(optionIdx);
    setIsAnswered(true);
    
    const currentQuestion = examQuestions[currentIdx];
    if (optionIdx === currentQuestion.correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedAnswerIdx(null);
    setIsAnswered(false);
    
    if (currentIdx < 9) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Finished the 10-question cycle!
      setIsFinished(true);
      setIsExamRunning(false);
      // Save exam cycle dynamically
      addExamCycle(selectedSubjectId, score, 10);
    }
  };

  const handleAbandon = () => {
    setIsExamRunning(false);
    setShowExitConfirm(false);
    setCurrentIdx(0);
    setScore(0);
  };

  if (isExamRunning && examQuestions.length > 0) {
    const q = examQuestions[currentIdx];
    const progressPercent = (currentIdx / 10) * 100;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header containing progress & abandon button */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-brand-light font-bold mb-1">
              <span>QUESTÃO {currentIdx + 1} DE 10</span>
              <span>{Math.round(progressPercent)}% Concluído</span>
            </div>
            <div className="w-full bg-brand-medium/20 h-2 rounded-full overflow-hidden border border-brand-medium/40">
              <div 
                className="bg-brand-light h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          
          <button
            onClick={() => setShowExitConfirm(true)}
            className="text-xs bg-red-950/20 hover:bg-red-900/30 text-red-300 border border-red-500/20 px-3 py-2 rounded-xl transition-all font-semibold shrink-0"
          >
            Abandonar
          </button>
        </div>

        {/* Question Panel */}
        <div className="bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl space-y-5">
          <div className="text-xs bg-brand-medium/40 text-brand-light px-2.5 py-1 rounded-md font-bold w-fit">
            {subjects.find(s => s.id === q.subjectId)?.name || 'Simulado Geral'}
          </div>
          
          <h3 className="font-bold text-sm sm:text-base text-white leading-relaxed">
            {q.prompt}
          </h3>

          <div className="space-y-3 pt-2">
            {q.options.map((option, idx) => {
              const isSelected = selectedAnswerIdx === idx;
              const isCorrect = idx === q.correctAnswerIndex;
              
              let optionStyle = 'bg-brand-dark/45 border-brand-medium/50 text-gray-300 hover:bg-brand-medium/20 hover:border-brand-light/30';
              let icon = null;

              if (isAnswered) {
                if (isCorrect) {
                  optionStyle = 'bg-green-950/20 border-green-500/40 text-green-300 font-bold';
                  icon = <CheckCircle size={16} className="text-green-400 shrink-0" />;
                } else if (isSelected) {
                  optionStyle = 'bg-red-950/25 border-red-500/40 text-red-300 font-bold';
                  icon = <XCircle size={16} className="text-red-400 shrink-0" />;
                } else {
                  optionStyle = 'bg-brand-dark/20 border-brand-medium/20 text-gray-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleAnswerClick(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all ${optionStyle}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-bold text-brand-light shrink-0">
                      {String.fromCharCode(65 + idx)})
                    </span>
                    {option}
                  </span>
                  {icon}
                </button>
              );
            })}
          </div>

          {/* Action Trigger */}
          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="bg-brand-light hover:bg-white text-brand-dark px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-brand-light/5"
              >
                {currentIdx < 9 ? 'Próxima Questão' : 'Finalizar Simulado'}
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Exit confirmation modal overlay */}
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-brand-dark border-2 border-red-500/20 p-6 rounded-2xl max-w-sm w-full space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-900/25 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <h4 className="font-bold text-white text-sm">Abandonar Simulado?</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Você só receberá pontos no ranking caso **conclua as 10 questões**. Ao sair agora, seu progresso nesta rodada será descartado.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 bg-brand-medium/40 hover:bg-brand-medium text-white py-2 rounded-xl text-xs font-semibold"
                >
                  Continuar Respondendo
                </button>
                <button
                  onClick={handleAbandon}
                  className="flex-1 bg-red-900 hover:bg-red-800 text-white py-2 rounded-xl text-xs font-bold"
                >
                  Sair e Descartar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isFinished) {
    const successRate = (score / 10) * 100;
    const gainedPoints = score * 10;
    return (
      <div className="max-w-md mx-auto bg-brand-medium/10 border border-brand-medium/40 p-8 rounded-2xl text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-yellow-500/25 border border-yellow-500/20 text-yellow-350 flex items-center justify-center rounded-2xl mx-auto shadow-lg shadow-yellow-500/5">
          <Award size={32} className="animate-bounce" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white">Simulado Concluído!</h3>
          <p className="text-xs text-gray-400">Parabéns por terminar a rodada de 10 questões.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="bg-brand-dark/50 border border-brand-medium/55 p-3 rounded-xl">
            <span className="text-[10px] text-brand-light font-bold block uppercase">Acertos</span>
            <span className="text-xl font-extrabold text-white block mt-1">{score} / 10</span>
          </div>
          <div className="bg-brand-dark/50 border border-brand-medium/55 p-3 rounded-xl">
            <span className="text-[10px] text-brand-light font-bold block uppercase">Pontos Ganhos</span>
            <span className="text-xl font-extrabold text-brand-light block mt-1">+{gainedPoints} pts</span>
          </div>
        </div>

        <div className="text-xs text-gray-300 leading-relaxed bg-brand-medium/20 p-4 rounded-xl border border-brand-medium/35">
          {successRate >= 70 ? (
            <span>Excelente aproveitamento! Seu desempenho foi adicionado ao ranking geral. Continue estudando!</span>
          ) : (
            <span>Bom treino. A prática leva à perfeição! Continue resolvendo novos ciclos para acumular pontos.</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsFinished(false)}
            className="flex-1 bg-brand-medium/30 hover:bg-brand-medium/60 text-white font-semibold py-2.5 rounded-xl border border-brand-medium text-xs transition-all"
          >
            Voltar ao Menu
          </button>
          
          <button
            onClick={handleStartExam}
            className="flex-1 bg-brand-light hover:bg-white text-brand-dark font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-brand-light/5"
          >
            Novo Ciclo (10 Qs)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Simulados e Treinamento</h2>
        <p className="text-gray-400 text-xs mt-1">
          Treine resolvendo quizzes em ciclos estruturados de exatamente 10 questões.
        </p>
      </div>

      {/* Start Config Card */}
      <div className="bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-medium/40 border border-brand-medium flex items-center justify-center text-brand-light">
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Novo Ciclo de Estudos</h3>
            <span className="text-[10px] text-gray-450 block">Treino dinâmico de 10 perguntas</span>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                Escolher Curso
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={selectedCourseId === 'all' ? "Todos os Cursos" : (courses.find(c => c.id === selectedCourseId)?.name || 'Todos os Cursos')}
                  value={isCourseDropdownOpen ? courseSearchText : (courses.find(c => c.id === selectedCourseId)?.name || '')}
                  onFocus={() => {
                    setIsCourseDropdownOpen(true);
                    setCourseSearchText('');
                  }}
                  onChange={(e) => {
                    setCourseSearchText(e.target.value);
                    setIsCourseDropdownOpen(true);
                  }}
                  className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-white focus:border-brand-light focus:outline-none placeholder:text-gray-550 animate-fade-in"
                />
                <button
                  type="button"
                  onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors bg-transparent border-none p-0 outline-none focus:outline-none shadow-none"
                >
                  <svg className={`w-3.5 h-3.5 transition-transform ${isCourseDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {isCourseDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => {
                      setIsCourseDropdownOpen(false);
                      setCourseSearchText('');
                    }}
                  />
                  <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-brand-dark border border-brand-medium rounded-xl shadow-2xl z-20 text-xs py-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        handleCourseChange('all');
                        setIsCourseDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-brand-medium/40 transition-colors ${
                        selectedCourseId === 'all' ? 'bg-brand-medium/60 text-white font-bold' : 'text-gray-305'
                      }`}
                    >
                      Todos os Cursos
                    </button>
                    {(() => {
                      const searchedCourses = courses.filter(c => 
                        c.name.toLowerCase().includes(courseSearchText.toLowerCase())
                      );

                      if (searchedCourses.length === 0) {
                        return (
                          <div className="px-3 py-2 text-gray-500 italic">
                            Nenhum curso encontrado
                          </div>
                        );
                      }

                      return searchedCourses.map(course => (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => {
                            handleCourseChange(course.id);
                            setIsCourseDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-brand-medium/40 transition-colors ${
                            selectedCourseId === course.id ? 'bg-brand-medium/60 text-white font-bold' : 'text-gray-305'
                          }`}
                        >
                          {course.name}
                        </button>
                      ));
                    })()}
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                Escolher Disciplina de Foco
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={selectedSubjectId === 'all' ? "Todas as Disciplinas (Misto)" : (subjects.find(s => s.id === selectedSubjectId)?.name || 'Todas as Disciplinas (Misto)')}
                  value={isSubjectDropdownOpen ? subjectSearchText : (subjects.find(s => s.id === selectedSubjectId)?.name || '')}
                  onFocus={() => {
                    setIsSubjectDropdownOpen(true);
                    setSubjectSearchText('');
                  }}
                  onChange={(e) => {
                    setSubjectSearchText(e.target.value);
                    setIsSubjectDropdownOpen(true);
                  }}
                  className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-white focus:border-brand-light focus:outline-none placeholder:text-gray-550"
                />
                <button
                  type="button"
                  onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors bg-transparent border-none p-0 outline-none focus:outline-none shadow-none"
                >
                  <svg className={`w-3.5 h-3.5 transition-transform ${isSubjectDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {isSubjectDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => {
                      setIsSubjectDropdownOpen(false);
                      setSubjectSearchText('');
                    }}
                  />
                  <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-brand-dark border border-brand-medium rounded-xl shadow-2xl z-20 text-xs py-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubjectId('all');
                        setIsSubjectDropdownOpen(false);
                        setSubjectSearchText('');
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-brand-medium/40 transition-colors ${
                        selectedSubjectId === 'all' ? 'bg-brand-medium/60 text-white font-bold' : 'text-gray-305'
                      }`}
                    >
                      Todas as Disciplinas (Misto)
                    </button>
                    {(() => {
                      // Filtrar disciplinas pelo curso selecionado (se não for 'all')
                      const courseSubjects = selectedCourseId === 'all' 
                        ? availableSubjects 
                        : availableSubjects.filter(s => s.courseId === selectedCourseId);
                      
                      // Filtrar pelo texto pesquisado
                      const searchedSubjects = courseSubjects.filter(sub => 
                        sub.name.toLowerCase().includes(subjectSearchText.toLowerCase())
                      );

                      if (searchedSubjects.length === 0) {
                        return (
                          <div className="px-3 py-2 text-gray-500 italic">
                            Nenhuma disciplina encontrada
                          </div>
                        );
                      }

                      return searchedSubjects.map(sub => {
                        const course = courses.find(c => c.id === sub.courseId);
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              setSelectedSubjectId(sub.id);
                              setIsSubjectDropdownOpen(false);
                              setSubjectSearchText('');
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-brand-medium/40 transition-colors ${
                              selectedSubjectId === sub.id ? 'bg-brand-medium/60 text-white font-bold' : 'text-gray-305'
                            }`}
                          >
                            {selectedCourseId === 'all' && course ? `${course.name.substring(0, 15)}... - ` : ''}{sub.name}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-brand-dark/40 border border-brand-medium/55 p-4 rounded-xl space-y-2.5 text-xs text-gray-300 leading-relaxed">
            <span className="font-bold text-brand-light uppercase text-[10px] tracking-wider block">Regras de Validação do Quiz</span>
            <ul className="space-y-1.5 list-disc pl-4 text-[11px]">
              <li>A rodada possui **exatamente 10 questões** de múltipla escolha.</li>
              <li>O feedback de acerto/erro é exibido instantaneamente em cada pergunta.</li>
              <li className="text-yellow-350">
                Se você fechar ou abandonar a aba antes de concluir a 10ª questão, os pontos no ranking geral serão descartados.
              </li>
            </ul>
          </div>

          {!isProOrPremium && (
            <div className="bg-yellow-600/10 border border-yellow-500/20 text-yellow-350 p-3 rounded-xl text-[10px] leading-relaxed">
              ⚠️ Como **Aluno Básico**, você resolverá questões do simulado aberto. Upgrade para o plano Pro ou Premium desbloqueia questões reais extraídas de exames e provas acadêmicas anteriores.
            </div>
          )}

          {hasDoneExamToday && (
            <div className="bg-red-950/20 border border-red-500/20 text-red-300 p-4 rounded-xl text-xs leading-relaxed">
              ⚠️ **Limite diário atingido:** Você já realizou seu simulado gratuito de hoje. Faça o upgrade para o plano **Start** ou **Aprovação** para realizar simulados ilimitados, escolher disciplinas de foco, ter resumos premium e muito mais!
            </div>
          )}

          <button
            onClick={handleStartExam}
            disabled={!!hasDoneExamToday}
            className="w-full bg-brand-light hover:bg-white text-brand-dark py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-light/5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play size={14} className="fill-brand-dark" /> Iniciar Ciclo de Simulados (10 Qs)
          </button>
        </div>
      </div>
    </div>
  );
};
