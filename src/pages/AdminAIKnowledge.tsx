import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BrainCircuit, Trash2, FileText, CheckCircle2, CloudUpload } from 'lucide-react';

export const AdminAIKnowledge: React.FC = () => {
  const { aiKnowledgeFiles, addAiFile, removeAiFile } = useAuth();
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [successMsg, setSuccessMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;

    setIsUploading(true);

    // Simulate ingestion delay
    setTimeout(() => {
      // Add extension if not typed
      let formattedName = fileName.trim();
      if (!formattedName.endsWith('.pdf')) {
        formattedName += '.pdf';
      }

      addAiFile(formattedName, fileSize);
      setFileName('');
      setIsUploading(false);
      setSuccessMsg(`Arquivo "${formattedName}" indexado com sucesso na IA!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Treinamento do Consultor de IA</h2>
        <p className="text-gray-400 text-xs mt-1">
          Alimente a Inteligência Artificial enviando arquivos em PDF (Leis, Regramentos, Manuais). O consultor responderá os alunos utilizando exclusivamente esta base de dados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Simulated Upload File */}
        <div className="lg:col-span-5 bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl h-fit">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
            <CloudUpload size={16} className="text-brand-light animate-bounce" />
            Alimentar Inteligência Artificial
          </h3>

          {successMsg && (
            <div className="bg-green-950/35 border border-green-500/35 text-green-300 px-4 py-2.5 rounded-xl text-xs mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSimulateUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                Nome do Arquivo Fictício
              </label>
              <input
                type="text"
                required
                disabled={isUploading}
                placeholder="Ex: Regulamento_Geral_da_OAB.pdf"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-brand-light focus:outline-none placeholder:text-gray-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-light uppercase tracking-wider mb-1.5">
                Tamanho Estimado (Simulado)
              </label>
              <select
                value={fileSize}
                disabled={isUploading}
                onChange={(e) => setFileSize(e.target.value)}
                className="w-full bg-brand-dark border border-brand-medium/60 rounded-xl px-2.5 py-2 text-xs text-white focus:border-brand-light focus:outline-none disabled:opacity-50"
              >
                <option value="850 KB">850 KB</option>
                <option value="1.5 MB">1.5 MB</option>
                <option value="3.2 MB">3.2 MB</option>
                <option value="5.7 MB">5.7 MB</option>
              </select>
            </div>

            <div className="border border-brand-medium/55 bg-brand-dark/20 rounded-xl p-3.5 text-center text-xs text-gray-400 leading-relaxed">
              <BrainCircuit className="w-7 h-7 text-brand-light/55 mx-auto mb-1.5" />
              <p className="text-[10px]">
                Ao indexar o arquivo, o sistema realiza o fatiamento (chunking) do PDF e armazena os vetores semânticos no banco de dados.
              </p>
            </div>

            <button
              type="submit"
              disabled={isUploading || !fileName}
              className="w-full bg-brand-light hover:bg-white text-brand-dark py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-55 shadow-md shadow-brand-light/5 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-brand-dark border-t-transparent rounded-full animate-spin"></span>
                  Processando e Indexando PDF...
                </>
              ) : (
                'Indexar Documento na IA'
              )}
            </button>
          </form>
        </div>

        {/* Right List: Ingested Knowledge Base */}
        <div className="lg:col-span-7 bg-brand-medium/10 border border-brand-medium/40 p-6 rounded-2xl shadow-xl flex flex-col h-[520px]">
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
                    <div className="w-8 h-8 rounded-lg bg-brand-medium/40 border border-brand-medium flex items-center justify-center text-brand-light">
                      <FileText size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white leading-tight">{file.fileName}</h4>
                      <span className="text-[9px] text-gray-400 block mt-0.5">
                        Tamanho: {file.fileSize} &bull; Enviado em: {new Date(file.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeAiFile(file.id)}
                    className="text-gray-450 hover:text-red-400 p-2 rounded-lg hover:bg-brand-medium/30 transition-all"
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
