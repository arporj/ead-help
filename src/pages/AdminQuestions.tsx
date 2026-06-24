import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, ListCollapse, CheckCircle2, Edit, Trash2, X } from 'lucide-react';
import type { Question } from '../types';

export const AdminQuestions: React.FC = () => {
  const { courses, subjects, questions, addQuestion, deleteQuestion, updateQuestion } = useAuth();

  // Form State
  const [prompt, setPrompt] = useState('');
  const [formCourseId, setFormCourseId] = useState<string>('');
  const [subjectId, setSubjectId] = useState('');
  const [type, setType] = useState<'simulado' | 'prova'>('simulado');
  const [isProOrPremium, setIsProOrPremium] = useState(false);
  const [options, setOptions] = useState<string[]>(['', '', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isFormSubjectDropdownOpen, setIsFormSubjectDropdownOpen] = useState(false);
  const [formSubjectSearchText, setFormSubjectSearchText] = useState('');

  // Listagem de disciplinas ordenada alfabeticamente para a interface
  const sortedSubjects = [...subjects].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

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


  // Filter States
  const [filterCourseId, setFilterCourseId] = useState<string>('all');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [searchQuestionQuery, setSearchQuestionQuery] = useState<string>('');

  // Custom Searchable Dropdown States for Filters
  const [isFilterSubjectDropdownOpen, setIsFilterSubjectDropdownOpen] = useState(false);
  const [filterSubjectSearchText, setFilterSubjectSearchText] = useState('');

  // Cascade effect to update filterSubjectId when filterCourseId changes
  useEffect(() => {
    if (filterCourseId === 'all') {
      setFilterSubjectId('all');
      setFilterSubjectSearchText('');
      return;
    }

    const courseSubjects = subjects.filter(s => s.courseId === filterCourseId);
    if (courseSubjects.length === 1) {
      setFilterSubjectId(courseSubjects[0].id);
    } else {
      setFilterSubjectId('all');
    }
    setFilterSubjectSearchText('');
  }, [filterCourseId, subjects]);

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || !subjectId) return;

    // Filtra as opções vazias mantendo a correta alinhada
    const mappedOptions = options
      .map((opt, idx) => ({ opt: opt.trim(), originalIdx: idx }))
      .filter(item => item.opt !== '');

    if (mappedOptions.length < 2) {
      alert('A questão deve ter pelo menos 2 alternativas preenchidas!');
      return;
    }

    const correctItem = mappedOptions.find(item => item.originalIdx === correctAnswerIndex);
    if (!correctItem) {
      alert('A alternativa marcada como correta deve estar preenchida!');
      return;
    }

    const finalOptions = mappedOptions.map(item => item.opt);
    const finalCorrectAnswerIndex = mappedOptions.findIndex(item => item.originalIdx === correctAnswerIndex);

    try {
      if (editingQuestionId) {
        await updateQuestion(editingQuestionId, {
          subjectId,
          prompt,
          options: finalOptions,
          correctAnswerIndex: finalCorrectAnswerIndex,
          isProOrPremium,
          type
        });
        setEditingQuestionId(null);
        setSuccessMsg('Questão atualizada com sucesso!');
      } else {
        await addQuestion({
          subjectId,
          prompt,
          options: finalOptions,
          correctAnswerIndex: finalCorrectAnswerIndex,
          isProOrPremium,
          type
        });
        setSuccessMsg('Questão adicionada ao banco de dados!');
      }

      // Reset Form
      setPrompt('');
      setOptions(['', '', '', '', '']);
      setCorrectAnswerIndex(0);
      setIsProOrPremium(false);
      setType('simulado');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      // Erro global já tratado no AuthContext
    }
  };

  const handleAddOption = () => {
    if (options.length >= 10) {
      alert('O limite máximo é de 10 alternativas.');
      return;
    }
    setOptions([...options, '']);
  };

  const handleRemoveOption = (indexToRemove: number) => {
    if (options.length <= 2) {
      alert('Uma questão precisa ter pelo menos 2 alternativas.');
      return;
    }
    const updated = options.filter((_, idx) => idx !== indexToRemove);
    setOptions(updated);
    
    // Ajustar correctAnswerIndex
    if (correctAnswerIndex === indexToRemove) {
      setCorrectAnswerIndex(0);
    } else if (correctAnswerIndex > indexToRemove) {
      setCorrectAnswerIndex(prev => prev - 1);
    }
  };

  const handleEditClick = (q: Question) => {
    setEditingQuestionId(q.id);
    setPrompt(q.prompt);
    setSubjectId(q.subjectId);
    
    // Sincronizar o curso correspondente à disciplina selecionada na edição
    const subject = subjects.find(s => s.id === q.subjectId);
    if (subject) {
      setFormCourseId(subject.courseId);
    }

    setType(q.type);
    setIsProOrPremium(q.isProOrPremium);
    setOptions(q.options);
    setCorrectAnswerIndex(q.correctAnswerIndex);
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setPrompt('');
    setOptions(['', '', '', '', '']);
    setCorrectAnswerIndex(0);
    setIsProOrPremium(false);
    setType('simulado');
    
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
    if (window.confirm('Tem certeza de que deseja excluir esta questão permanentemente?')) {
      try {
        await deleteQuestion(id);
        setSuccessMsg('Questão excluída com sucesso!');
        setTimeout(() => setSuccessMsg(''), 3000);
        if (editingQuestionId === id) {
          handleCancelEdit();
        }
      } catch (err) {
        // Erro já tratado pelo AuthContext
      }
    }
  };

  const filteredQuestions = questions.filter(q => {
    // Filtro por Curso
    if (filterCourseId !== 'all') {
      const subject = subjects.find(s => s.id === q.subjectId);
      if (!subject || subject.courseId !== filterCourseId) return false;
    }

    // Filtro por Disciplina
    if (filterSubjectId !== 'all' && q.subjectId !== filterSubjectId) {
      return false;
    }

    // Filtro por busca textual no enunciado
    if (searchQuestionQuery.trim() !== '') {
      return q.prompt.toLowerCase().includes(searchQuestionQuery.toLowerCase());
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Banco de Questões</h2>
        <p className="text-gray-400 text-xs mt-1">
          Cadastre novas questões de múltipla escolha para simulados ou provas oficiais na plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Add Question */}
        <div className="lg:col-span-5 bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl h-fit">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-brand-medium/30">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Plus size={16} className="text-brand-light" />
              {editingQuestionId ? 'Editar Questão' : 'Adicionar Questão'}
            </h3>
            {editingQuestionId && (
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
            <div className="bg-green-950/35 border border-green-500/35 text-green-300 px-4 py-2.5 rounded-xl text-xs mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSaveQuestion} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                Enunciado da Pergunta
              </label>
              <textarea
                required
                rows={3}
                placeholder="Digite o enunciado completo da questão..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
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
                  Disciplina
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Selecione ou digite para filtrar..."
                    value={isFormSubjectDropdownOpen ? formSubjectSearchText : (subjects.find(s => s.id === subjectId)?.name || '')}
                    onFocus={() => {
                      setIsFormSubjectDropdownOpen(true);
                      setFormSubjectSearchText('');
                    }}
                    onChange={(e) => {
                      setFormSubjectSearchText(e.target.value);
                      setIsFormSubjectDropdownOpen(true);
                    }}
                    className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl pl-3.5 pr-8 py-2 text-xs text-white focus:border-brand-light focus:outline-none placeholder:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsFormSubjectDropdownOpen(!isFormSubjectDropdownOpen)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors bg-transparent border-none p-0 outline-none focus:outline-none shadow-none"
                  >
                    <svg className={`w-3.5 h-3.5 transition-transform ${isFormSubjectDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
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

                        const grouped: { [key: number]: typeof subjects } = {};
                        searchedSubjects.forEach(sub => {
                          const sem = sub.semester || 1;
                          if (!grouped[sem]) {
                            grouped[sem] = [];
                          }
                          grouped[sem].push(sub);
                        });

                        const sortedSemesters = Object.keys(grouped)
                          .map(Number)
                          .sort((a, b) => a - b);

                        return sortedSemesters.map(sem => (
                          <div key={sem} className="space-y-0.5">
                            <div className="px-3 py-1 text-[9px] font-bold text-brand-light bg-brand-medium/20 uppercase tracking-wider select-none text-left">
                              Semestre {sem}
                            </div>
                            {grouped[sem]
                              .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
                              .map(sub => (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => {
                                    setSubjectId(sub.id);
                                    setIsFormSubjectDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-1.5 hover:bg-brand-medium/40 transition-colors ${
                                    subjectId === sub.id ? 'bg-brand-medium/60 text-white font-bold' : 'text-gray-300'
                                  }`}
                                >
                                  {sub.name}
                                </button>
                              ))}
                          </div>
                        ));
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tipo de Teste */}
            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                Tipo de Teste
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-2.5 py-2 text-xs text-white focus:border-brand-light focus:outline-none"
              >
                <option value="simulado">Simulado Geral</option>
                <option value="prova">Prova Oficial (Exames)</option>
              </select>
            </div>

            {/* Alternatives */}
            <div className="space-y-3">
              <span className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1">
                Alternativas
              </span>
              
              {options.map((option, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-light w-5">
                    {String.fromCharCode(65 + idx)})
                  </span>
                  <input
                    type="text"
                    placeholder={`Texto da alternativa ${String.fromCharCode(65 + idx)} (opcional)...`}
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 bg-brand-dark border border-brand-medium/60 rounded-xl px-3.5 py-2 text-xs text-white focus:border-brand-light focus:outline-none"
                  />
                  <input
                    type="radio"
                    name="correct-answer"
                    checked={correctAnswerIndex === idx}
                    onChange={() => setCorrectAnswerIndex(idx)}
                    title="Marcar como resposta correta"
                    className="w-4 h-4 cursor-pointer text-brand-light border-brand-medium focus:ring-0"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      title="Excluir alternativa"
                      className="p-1.5 bg-red-950/20 hover:bg-red-900 border border-red-500/20 text-red-400 hover:text-white rounded-lg transition-all shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}

              {options.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="mt-1 w-full bg-brand-medium/20 hover:bg-brand-medium/40 border border-brand-medium/60 text-brand-light hover:text-white py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus size={10} /> Adicionar Alternativa
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isProOrPremium"
                checked={isProOrPremium}
                onChange={(e) => setIsProOrPremium(e.target.checked)}
                className="rounded border-brand-medium text-brand-light focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="isProOrPremium" className="text-xs text-white font-semibold cursor-pointer">
                Exclusivo para assinantes Pro e Premium (Restrito)
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-light hover:bg-white text-brand-dark py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-light/5"
            >
              {editingQuestionId ? 'Salvar Alterações' : 'Adicionar Questão'}
            </button>
          </form>
        </div>

        {/* Right List: Questions Database */}
        <div className="lg:col-span-7 bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl flex flex-col h-[650px]">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4 border-b border-brand-medium/40 pb-3 shrink-0">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ListCollapse size={16} className="text-brand-light" />
              Questões na Base de Dados ({filteredQuestions.length})
            </h3>
          </div>

          {/* Painel de Filtros Acadêmicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 pb-4 border-b border-brand-medium/30 shrink-0">
            {/* Combo de Cursos */}
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

            {/* Dropdown Pesquisável de Disciplinas */}
            <div className="relative">
              <label className="block text-[10px] font-semibold text-brand-light uppercase tracking-wider mb-1">
                Filtrar por Disciplina
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={
                    filterSubjectId === 'all' 
                      ? "Todas as Disciplinas" 
                      : subjects.find(s => s.id === filterSubjectId)?.name || "Todas as Disciplinas"
                  }
                  value={filterSubjectSearchText}
                  onFocus={() => setIsFilterSubjectDropdownOpen(true)}
                  onChange={(e) => {
                    setFilterSubjectSearchText(e.target.value);
                    setIsFilterSubjectDropdownOpen(true);
                  }}
                  className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-3 py-1.5 text-xs text-white focus:border-brand-light focus:outline-none placeholder:text-white placeholder:font-medium"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">
                  ▼
                </div>
              </div>

              {isFilterSubjectDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => {
                      setIsFilterSubjectDropdownOpen(false);
                      setFilterSubjectSearchText('');
                    }}
                  />
                  <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-brand-dark border border-brand-medium rounded-xl shadow-2xl z-20 text-xs py-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterSubjectId('all');
                        setIsFilterSubjectDropdownOpen(false);
                        setFilterSubjectSearchText('');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-brand-medium/40 text-brand-light font-bold"
                    >
                      Todas as Disciplinas
                    </button>
                    {(() => {
                      const relevantSubjects = filterCourseId === 'all' 
                        ? sortedSubjects 
                        : sortedSubjects.filter(s => s.courseId === filterCourseId);

                      const searchedSubjects = relevantSubjects.filter(sub => 
                        sub.name.toLowerCase().includes(filterSubjectSearchText.toLowerCase())
                      );

                      if (searchedSubjects.length === 0) {
                        return (
                          <div className="px-3 py-2 text-gray-500 italic text-left">
                            Nenhuma disciplina encontrada
                          </div>
                        );
                      }

                      const grouped: { [key: number]: typeof subjects } = {};
                      searchedSubjects.forEach(sub => {
                        const sem = sub.semester || 1;
                        if (!grouped[sem]) {
                          grouped[sem] = [];
                        }
                        grouped[sem].push(sub);
                      });

                      const sortedSemesters = Object.keys(grouped)
                        .map(Number)
                        .sort((a, b) => a - b);

                      return sortedSemesters.map(sem => (
                        <div key={sem} className="space-y-0.5">
                          <div className="px-3 py-1 text-[9px] font-bold text-brand-light bg-brand-medium/20 uppercase tracking-wider select-none text-left">
                            Semestre {sem}
                          </div>
                          {grouped[sem]
                            .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
                            .map(sub => {
                              const course = courses.find(c => c.id === sub.courseId);
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => {
                                    setFilterSubjectId(sub.id);
                                    setIsFilterSubjectDropdownOpen(false);
                                    setFilterSubjectSearchText('');
                                  }}
                                  className={`w-full text-left px-4 py-1.5 hover:bg-brand-medium/40 transition-colors ${
                                    filterSubjectId === sub.id ? 'bg-brand-medium/60 text-white font-bold' : 'text-gray-300'
                                  }`}
                                >
                                  {filterCourseId === 'all' && course ? `${course.name.substring(0, 10)}... - ` : ''}{sub.name}
                                </button>
                              );
                            })}
                        </div>
                      ));
                    })()}
                  </div>
                </>
              )}
            </div>

            {/* Busca textual por enunciado */}
            <div>
              <label className="block text-[10px] font-semibold text-brand-light uppercase tracking-wider mb-1">
                Buscar Questão (Enunciado)
              </label>
              <input
                type="text"
                placeholder="Buscar por termo..."
                value={searchQuestionQuery}
                onChange={(e) => setSearchQuestionQuery(e.target.value)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-3 py-1.5 text-xs text-white focus:border-brand-light focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">
                Nenhuma questão encontrada para os filtros aplicados.
              </div>
            ) : (
              filteredQuestions.map(q => {
              const subject = subjects.find(s => s.id === q.subjectId);
              return (
                <div key={q.id} className="border border-brand-medium/40 bg-brand-dark/25 p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-brand-medium/55 px-2 py-0.5 rounded text-brand-light font-bold">
                        {subject?.name}
                      </span>
                      <div className="flex gap-1.5 text-[8px]">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase ${q.type === 'prova' ? 'bg-yellow-600/30 text-yellow-350 border border-yellow-500/20' : 'bg-brand-medium text-brand-light border border-brand-light/10'}`}>
                          {q.type}
                        </span>
                        {q.isProOrPremium && (
                          <span className="bg-red-950 text-red-300 border border-red-500/20 px-2 py-0.5 rounded font-bold uppercase">
                            PRO/PREMIUM
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(q)}
                        title="Editar questão"
                        className="p-1 bg-brand-medium/35 hover:bg-brand-medium border border-brand-medium text-brand-light hover:text-white rounded transition-all"
                      >
                        <Edit size={10} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(q.id)}
                        title="Excluir questão"
                        className="p-1 bg-red-950/30 hover:bg-red-900 border border-red-500/20 text-red-400 hover:text-white rounded transition-all"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-white leading-relaxed font-medium">{q.prompt}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                    {q.options.map((opt, oIdx) => (
                      <div 
                        key={oIdx} 
                        className={`p-2 rounded-lg border ${
                          oIdx === q.correctAnswerIndex 
                            ? 'bg-green-950/20 border-green-500/30 text-green-300 font-semibold' 
                            : 'bg-brand-dark/40 border-brand-medium/30 text-gray-400'
                        }`}
                      >
                        <span className="font-bold mr-1">{String.fromCharCode(65 + oIdx)})</span>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
            );
          }))}
          </div>
        </div>
      </div>
    </div>
  );
};
