import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BrainCircuit, Trash2, FileText, CheckCircle2, CloudUpload, ShieldAlert } from 'lucide-react';

export const AdminAIKnowledge: React.FC = () => {
  const { aiKnowledgeFiles, addAiFile, removeAiFile } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [discipline, setDiscipline] = useState<string>('none');
  const [category, setCategory] = useState<string>('none');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const discVal = discipline === 'none' ? null : discipline;
      const catVal = category === 'none' ? null : category;
      
      await addAiFile(selectedFile.name, discVal, catVal, selectedFile);
      
      setSuccessMsg(`Arquivo "${selectedFile.name}" indexado com sucesso na IA!`);
      setSelectedFile(null);
      setDiscipline('none');
      setCategory('none');
      
      // Limpar input de arquivo
      const fileInput = document.getElementById('ai-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Falha ao enviar arquivo para a IA.');
    } finally {
      setIsUploading(false);
    }
  };

  const getDisciplineLabel = (disc?: string | null) => {
    switch (disc) {
      case 'civil': return 'Civil';
      case 'penal': return 'Penal';
      case 'trabalhista': return 'Trabalhista';
      default: return 'Geral';
    }
  };

  const getCategoryLabel = (cat?: string | null) => {
    switch (cat) {
      case 'template_estrutural': return 'Template';
      case 'checklist': return 'Checklist';
      case 'caso_pratico': return 'Caso';
      default: return 'Geral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Treinamento do Mentor de IA</h2>
        <p className="text-gray-400 text-xs mt-1">
          Alimente a Inteligência Artificial enviando arquivos em PDF. Para o Mentor Jurídico IA, defina a disciplina prática e a categoria do material (templates, checklists ou casos).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upload File */}
        <div className="lg:col-span-5 bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl h-fit">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
            <CloudUpload size={16} className="text-brand-light" />
            Alimentar Inteligência Artificial
          </h3>

          {successMsg && (
            <div className="bg-green-950/35 border border-green-500/35 text-green-300 px-4 py-2.5 rounded-xl text-xs mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-950/35 border border-red-500/35 text-red-300 px-4 py-2.5 rounded-xl text-xs mb-4 flex items-center gap-2">
              <ShieldAlert size={16} className="text-red-450" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                Arquivo PDF
              </label>
              <input
                type="file"
                id="ai-file-input"
                required
                accept=".pdf"
                disabled={isUploading}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-light focus:outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-brand-medium file:text-brand-light file:cursor-pointer disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                Disciplina (Filtro do Mentor)
              </label>
              <select
                value={discipline}
                disabled={isUploading}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-2.5 py-2.5 text-xs text-white focus:border-brand-light focus:outline-none disabled:opacity-50"
              >
                <option value="none">Geral / IA Acadêmica Global</option>
                <option value="civil">Prática Civil</option>
                <option value="penal">Prática Penal</option>
                <option value="trabalhista">Prática Trabalhista</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                Categoria do Material
              </label>
              <select
                value={category}
                disabled={isUploading}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-2.5 py-2.5 text-xs text-white focus:border-brand-light focus:outline-none disabled:opacity-50"
              >
                <option value="none">Geral / Documento Livre</option>
                <option value="template_estrutural">Template Estrutural</option>
                <option value="checklist">Checklist</option>
                <option value="caso_pratico">Caso Prático</option>
              </select>
            </div>

            <div className="border border-brand-medium/55 bg-brand-dark/20 rounded-xl p-3.5 text-center text-xs text-gray-400 leading-relaxed">
              <BrainCircuit className="w-7 h-7 text-brand-light/55 mx-auto mb-1.5" />
              <p className="text-[10px]">
                O upload envia o arquivo para o storage privado. Em seguida, a Edge Function divide o texto em fragmentos (chunks) e gera os embeddings vetoriais RAG automaticamente.
              </p>
            </div>

            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="w-full bg-brand-light hover:bg-white text-brand-dark py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-55 shadow-md shadow-brand-light/5 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin"></span>
                  Enviando e Indexando PDF...
                </>
              ) : (
                'Indexar Documento na IA'
              )}
            </button>
          </form>
        </div>

        {/* Right List: Ingested Knowledge Base */}
        <div className="lg:col-span-7 bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl flex flex-col h-[550px]">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
            <FileText size={16} className="text-brand-light" />
            Documentos Ativos na IA ({aiKnowledgeFiles.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {aiKnowledgeFiles.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-xs">
                Nenhum documento indexado na base do consultor de IA.
              </div>
            ) : (
              aiKnowledgeFiles.map(file => (
                <div key={file.id} className="border border-brand-medium/40 bg-brand-dark/30 p-3.5 rounded-xl flex items-center justify-between gap-4 hover:border-brand-light/25 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-medium/40 border border-brand-medium flex items-center justify-center text-brand-light shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-white leading-tight truncate" title={file.fileName}>{file.fileName}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[9px] text-gray-400">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </span>
                        {file.discipline && (
                          <span className="text-[8px] bg-brand-medium px-2 py-0.5 rounded text-brand-light font-semibold uppercase">
                            {getDisciplineLabel(file.discipline)}
                          </span>
                        )}
                        {file.category && (
                          <span className="text-[8px] bg-yellow-600/20 border border-yellow-500/20 px-2 py-0.5 rounded text-yellow-400 font-semibold uppercase">
                            {getCategoryLabel(file.category)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeAiFile(file.id)}
                    className="text-gray-450 hover:text-red-400 p-2 rounded-lg hover:bg-brand-medium/30 transition-all shrink-0 cursor-pointer"
                    title="Excluir da IA"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
