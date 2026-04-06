import { useState } from 'react';
import { exportToPDF } from '../utils/ExportUtils';
import { X, Sparkles, Copy, Check, Info, FileDown } from 'lucide-react';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: string | null;
  isLoading: boolean;
}

export function AIAnalysisModal({ isOpen, onClose, analysis, isLoading }: AIAnalysisModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Processamento simples de Markdown para exibição (Negrito e Tópicos)
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      let formattedLine = line;
      
      // Bold
      formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
      
      // Bullets
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return (
          <div key={i} className="flex gap-2 mb-2 text-[#A0A0B0] items-start">
            <span className="text-[#6C5CE7] mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-[#6C5CE7]" />
            <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[-*]\s*/, '') }} />
          </div>
        );
      }

      if (line.trim() === '') return <div key={i} className="h-2" />;

      return <p key={i} className="mb-2 text-[#A0A0B0]" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="relative bg-[#1A1825] border border-[#2D2B3A] rounded-[32px] w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col animate-in zoom-in-95 fade-in duration-300">
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-[#6C5CE7] to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#6C5CE720] blur-[80px] rounded-full"></div>

        {/* Header */}
        <div className="px-8 py-6 border-b border-[#2D2B3A] flex justify-between items-center bg-[#1A1825]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center text-white shadow-[0_8px_16px_rgba(108,92,231,0.2)]">
              <Sparkles size={20} className={isLoading ? 'animate-pulse' : ''} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white m-0 tracking-tight">Análise Estratégica</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#6C5CE7]">Consultor IA</span>
                <span className="w-1 h-1 rounded-full bg-[#2D2B3A]"></span>
                <span className="text-[10px] text-[#6B6B80] font-bold">GEMINI 1.5 PRO / LEAN & TOC</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-xl bg-[#222030] border border-[#2D2B3A] text-[#A0A0B0] hover:text-white hover:border-[#4D4B5A] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar-dark">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-[#6C5CE720] border-t-[#6C5CE7] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={16} className="text-[#6C5CE7] animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[#A0A0B0] font-bold text-sm animate-pulse">Processando indicadores de produção...</p>
                <p className="text-[11px] text-[#6B6B80] mt-1 font-medium italic">Cruzando métricas OEE e gargalos da Cadeia Integrada.</p>
              </div>
            </div>
          ) : analysis ? (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-[#222030] border border-[#2D2B3A] p-5 rounded-2xl mb-6 flex items-start gap-4">
                <div className="bg-[#FDCB6E20] p-2 rounded-lg shrink-0">
                  <Info size={18} className="text-[#FDCB6E]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#FDCB6E] uppercase mb-1">Atenção</p>
                  <p className="text-[11px] text-[#A0A0B0] leading-relaxed">
                    Esta análise é gerada automaticamente. Valide as recomendações com sua equipe técnica antes de qualquer mudança de processo.
                  </p>
                </div>
              </div>

              <div id="ai-analysis-content" className="text-sm leading-relaxed font-medium">
                {formatText(analysis)}
              </div>
              
              <div className="h-8" />
            </div>
          ) : (
            <div className="text-center py-20 text-[#6B6B80]">
              Erro ao processar a análise. Tente novamente em alguns instantes.
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && analysis && (
          <div className="px-8 py-5 border-t border-[#2D2B3A] bg-[#1A1825]/90 flex justify-end">
            <div className="flex gap-3">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#222030] border border-[#2D2B3A] text-sm font-bold text-white hover:bg-[#2A283A] transition-all"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-[#00B894]" />
                    <span className="text-[#00B894]">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="text-[#6C5CE7]" />
                    <span>Copiar Insights</span>
                  </>
                )}
              </button>

              <button 
                onClick={() => exportToPDF(analysis, `Breafing_Guerra_CEO_${new Date().toISOString().split('T')[0]}.pdf`)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6C5CE7] border border-[#7D6DF7] text-sm font-bold text-white hover:bg-[#5A4BCE] transition-all shadow-[0_8px_16px_rgba(108,92,231,0.2)]"
              >
                <FileDown size={16} />
                <span>Baixar PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar-dark::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-dark::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: #2D2B3A; border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: #3D3B4A; }
      `}</style>
    </div>
  );
}
