import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, ListCollapse, CheckCircle2 } from 'lucide-react';

export const AdminQuestions: React.FC = () => {
  const { courses, subjects, questions, addQuestion } = useAuth();

  // Form State
  const [prompt, setPrompt] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [type, setType] = useState<'simulado' | 'prova'>('simulado');
  const [isProOrPremium, setIsProOrPremium] = useState(false);
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || !subjectId || options.some(opt => !opt.trim())) return;

    addQuestion({
      subjectId,
      prompt,
      options: options.map(opt => opt.trim()),
      correctAnswerIndex,
      isProOrPremium,
      type
    });

    // Reset Form
    setPrompt('');
    setOptions(['', '', '', '']);
    setCorrectAnswerIndex(0);
    setIsProOrPremium(false);
    setType('simulado');
    
    setSuccessMsg('Questão adicionada ao banco de dados!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

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
          <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
            <Plus size={16} className="text-brand-light" />
            Adicionar Questão
          </h3>

          {successMsg && (
            <div className="bg-green-950/35 border border-green-500/35 text-green-300 px-4 py-2.5 rounded-xl text-xs mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleCreateQuestion} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                  Disciplina
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-2.5 py-2 text-xs text-white focus:border-brand-light focus:outline-none"
                >
                  {subjects.map(sub => {
                    const course = courses.find(c => c.id === sub.courseId);
                    return (
                      <option key={sub.id} value={sub.id}>
                        {course?.name.substring(0, 10)}... - {sub.name}
                      </option>
                    );
                  })}
                </select>
              </div>

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
                    required
                    placeholder={`Texto da alternativa ${String.fromCharCode(65 + idx)}...`}
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
                </div>
              ))}
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
              Adicionar Questão
            </button>
          </form>
        </div>

        {/* Right List: Questions Database */}
        <div className="lg:col-span-7 bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl flex flex-col h-[650px]">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
            <ListCollapse size={16} className="text-brand-light" />
            Questões na Base de Dados ({questions.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {questions.map(q => {
              const subject = subjects.find(s => s.id === q.subjectId);
              return (
                <div key={q.id} className="border border-brand-medium/40 bg-brand-dark/25 p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
