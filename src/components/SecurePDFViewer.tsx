import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, EyeOff, Shield } from 'lucide-react';

interface SecurePDFViewerProps {
  pdfUrl: string;
  title?: string;
}

export const SecurePDFViewer: React.FC<SecurePDFViewerProps> = ({ pdfUrl, title }) => {
  const { user } = useAuth();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setNumPages] = useState<number>(0);
  const renderTasksRef = useRef<any[]>([]);

  useEffect(() => {
    // 1. Bloqueios de Interface (Impede Clique Direito e atalhos de cópia/salvamento)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear Ctrl+S (Salvar), Ctrl+P (Imprimir), Ctrl+C (Copiar), Ctrl+U (Ver Fonte), F12 (Inspecionar)
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P' || e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'j' || e.key === 'J' || e.key === 'c' || e.key === 'C'))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    // Cancelar tarefas de renderização anteriores para evitar vazamento de memória e sobreposição
    renderTasksRef.current.forEach(task => {
      try {
        task.cancel();
      } catch (e) {}
    });
    renderTasksRef.current = [];

    const loadPDFJSAndRender = async () => {
      try {
        // Garantir que a biblioteca PDF.js esteja carregada dinamicamente via CDN
        if (!(window as any).pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.async = true;
            script.onload = () => {
              (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              resolve();
            };
            script.onerror = () => reject(new Error('Erro ao carregar a biblioteca de visualização de PDF.'));
            document.body.appendChild(script);
          });
        }

        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          throw new Error('Biblioteca PDF.js não inicializada.');
        }

        // Carregar documento PDF a partir da URL
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        if (!active) return;
        setNumPages(pdf.numPages);
        setLoading(false);

        // Renderizar cada página
        if (canvasContainerRef.current) {
          canvasContainerRef.current.innerHTML = ''; // Limpar renders anteriores

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            if (!active) break;

            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 }); // Ajustar zoom padrão para leitura confortável

            // Criar wrapper para a página para conter o Canvas e o overlay transparente
            const pageWrapper = document.createElement('div');
            pageWrapper.className = 'relative my-4 inline-block bg-white rounded-xl shadow-lg border border-brand-medium/20 overflow-hidden';
            pageWrapper.style.width = `${viewport.width}px`;
            pageWrapper.style.height = `${viewport.height}px`;

            // Criar Canvas
            const canvas = document.createElement('canvas');
            canvas.className = 'block';
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const context = canvas.getContext('2d');

            pageWrapper.appendChild(canvas);
            canvasContainerRef.current.appendChild(pageWrapper);

            if (context) {
              const renderContext = {
                canvasContext: context,
                viewport: viewport,
              };
              const renderTask = page.render(renderContext);
              renderTasksRef.current.push(renderTask);
              await renderTask.promise;

              // Adicionar Marca d'Água Dinâmica direto no Canvas após renderizar a página
              const nameText = user?.name || 'Estudante';
              const cpfText = user?.cpf ? `CPF: ${user.cpf}` : '';
              const phoneText = user?.phone ? `Tel: ${user.phone}` : '';
              const watermarkText = `${nameText} | ${cpfText} | ${phoneText}`.trim();

              context.save();
              context.globalAlpha = 0.08; // Muito sutil para não atrapalhar o estudo
              context.font = 'bold 14px sans-serif';
              context.fillStyle = '#0f172a'; // Cor de contraste
              context.translate(canvas.width / 2, canvas.height / 2);
              context.rotate(-45 * Math.PI / 180);

              // Desenhar repetido em grade cruzada por toda a página
              const stepX = 260;
              const stepY = 130;
              for (let x = -canvas.width; x < canvas.width; x += stepX) {
                for (let y = -canvas.height; y < canvas.height; y += stepY) {
                  context.fillText(watermarkText, x, y);
                }
              }
              context.restore();

              // Adicionar também um overlay transparente no HTML para bloquear a cópia visual e o arrastar de imagens
              const transparentOverlay = document.createElement('div');
              transparentOverlay.className = 'absolute inset-0 z-10 select-none bg-transparent';
              transparentOverlay.style.userSelect = 'none';
              transparentOverlay.addEventListener('contextmenu', e => e.preventDefault());
              pageWrapper.appendChild(transparentOverlay);
            }
          }
        }
      } catch (err: any) {
        console.error('Erro ao processar PDF:', err);
        if (active) {
          setError(err.message || 'Falha ao renderizar o documento PDF de forma protegida.');
          setLoading(false);
        }
      }
    };

    loadPDFJSAndRender();

    return () => {
      active = false;
      renderTasksRef.current.forEach(task => {
        try {
          task.cancel();
        } catch (e) {}
      });
    };
  }, [pdfUrl, user]);

  return (
    <div className="flex flex-col h-full bg-brand-dark/20 rounded-2xl overflow-hidden border border-brand-medium/40 shadow-xl select-none">
      {/* Cabeçalho de Proteção */}
      <div className="bg-brand-medium/20 border-b border-brand-medium/40 p-4 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-brand-light" />
          <h4 className="font-bold text-xs text-white uppercase tracking-wider">{title || 'Leitura de Documento'}</h4>
        </div>
        <span className="text-[9px] bg-red-950/45 text-red-300 border border-red-500/20 px-2.5 py-0.5 rounded-full font-bold">
          CONTEÚDO PROTEGIDO (ANTI-CÓPIA)
        </span>
      </div>

      {/* Área do Conteúdo Razoável */}
      <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-start bg-brand-dark/45 min-h-[500px] relative select-none">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-brand-dark/85 z-20">
            <Loader2 className="w-8 h-8 text-brand-light animate-spin" />
            <span className="text-xs text-gray-400">Carregando visualizador seguro...</span>
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-3 my-auto max-w-sm">
            <EyeOff className="w-12 h-12 text-red-400" />
            <h5 className="font-bold text-sm text-white">Visualização Não Disponível</h5>
            <p className="text-xs text-gray-450 leading-relaxed">{error}</p>
          </div>
        ) : (
          <div 
            ref={canvasContainerRef} 
            className="w-full flex flex-col items-center pointer-events-none select-none"
            style={{ userSelect: 'none' }}
          />
        )}
      </div>
    </div>
  );
};
