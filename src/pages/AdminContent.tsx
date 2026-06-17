import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, BookOpen, FileText, CheckCircle2 } from 'lucide-react';

export const AdminContent: React.FC = () => {
  const { courses, subjects, summaries, addSummary } = useAuth();

  // State for new summary form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [isPremium, setIsPremium] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreateSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !subjectId) return;

    addSummary({
      title,
      description,
      subjectId,
      isPremium
    });

    setTitle('');
    setDescription('');
    setIsPremium(false);
    setSuccessMsg('Resumo cadastrado com sucesso!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Cursos e Resumos</h2>
        <p className="text-gray-400 text-xs mt-1">
          Gerencie a estrutura acadêmica e publique novos PDFs de resumo na plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle: Publish Summary Form */}
        <div className="lg:col-span-1 bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl h-fit">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
            <Plus size={16} className="text-brand-light" />
            Cadastrar Novo Resumo PDF
          </h3>

          {successMsg && (
            <div className="bg-green-950/35 border border-green-500/35 text-green-300 px-4 py-2.5 rounded-xl text-xs mb-4 flex items-center gap-2">
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
                placeholder="Ex: Resumo de Direito das Obrigações"
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
                Matéria/Disciplina
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-2.5 py-2 text-xs text-white focus:border-brand-light focus:outline-none"
              >
                {subjects.map(sub => {
                  const courseName = courses.find(c => c.id === sub.courseId)?.name || '';
                  return (
                    <option key={sub.id} value={sub.id}>
                      {courseName.substring(0, 10)}... - {sub.name} (Semestre {sub.semester})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Simulado Upload */}
            <div className="space-y-1.5">
              <span className="block text-xs font-semibold text-brand-light uppercase tracking-wider">Arquivo PDF</span>
              <div className="border-2 border-dashed border-brand-medium/60 rounded-xl p-4 text-center text-xs text-gray-500 bg-brand-dark/20">
                <FileText className="w-8 h-8 text-brand-light/40 mx-auto mb-2 animate-bounce" />
                <span className="text-[10px] text-gray-400 font-medium">Arquivo de Simulação Padrão Autogerado</span>
              </div>
            </div>

            {/* Premium Toggle */}
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
              className="w-full bg-brand-light hover:bg-white text-brand-dark py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-light/5"
            >
              Publicar Resumo
            </button>
          </form>
        </div>

        {/* Right: Published Summaries List */}
        <div className="lg:col-span-2 bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl flex flex-col h-[560px]">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-brand-light" />
            Biblioteca de Resumos Publicados ({summaries.length})
          </h3>

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
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{sum.description}</p>
                      <div className="text-[9px] text-brand-light font-medium pt-1">
                        {course?.name} &bull; {subject?.name} (Semestre {subject?.semester})
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
  );
};
