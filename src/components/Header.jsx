import { useState } from 'react';
import { MessageCircle, Users, FileDown } from 'lucide-react';

export default function Header({ showBack, onBack, familyMode, onFamily, onChat, onDownloadPDF }) {
  const [pdfMenuOpen, setPdfMenuOpen] = useState(false);

  return (
    <div className="flex justify-between items-center py-5 relative">
      {showBack ? (
        <button onClick={onBack} className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md border border-[#e0e0e0] flex justify-center items-center shadow-sm active:scale-95 transition-transform text-black">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      ) : (
        <div className="w-11 h-11" />
      )}

      {/* Fundo branco e desfoque para não ficar escuro sobre o conteúdo */}
      <div className="flex gap-2 bg-white/90 backdrop-blur-md rounded-[22px] px-3 py-1 border border-[#e0e0e0] shadow-sm relative z-50">
        {/* CHAT */}
        <button 
          onClick={onChat} 
          className="w-9 h-9 flex justify-center items-center text-black rounded-full active:bg-gray-100" 
          title="Conversar com o mascote"
        >
          <MessageCircle size={18} strokeWidth={2} />
        </button>

        {/* FAMÍLIA */}
        <button 
          onClick={onFamily} 
          className="w-9 h-9 flex justify-center items-center text-black rounded-full active:bg-gray-100 relative" 
          title="Acessar família"
        >
          <Users size={18} strokeWidth={2} />
          {familyMode && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--accent-to)] ring-2 ring-white" />
          )}
        </button>

        {/* ENVIAR PDF */}
        <div className="relative">
          <button 
            onClick={() => setPdfMenuOpen(v => !v)} 
            className="w-9 h-9 flex justify-center items-center text-black rounded-full active:bg-gray-100" 
            title="Relatórios em PDF"
          >
            <FileDown size={18} strokeWidth={2} />
          </button>

          {pdfMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setPdfMenuOpen(false)} />
              <div className="absolute right-0 top-11 z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 py-2 w-48 overflow-visible">
                <div className="absolute -top-2 right-4 w-4 h-4 bg-white/95 backdrop-blur-md rotate-45 border-l border-t border-white/40" />
                <button 
                  onClick={() => { setPdfMenuOpen(false); onDownloadPDF('month'); }} 
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-black/5 text-left text-sm font-semibold"
                >
                  <FileDown size={16} /> PDF do mês
                </button>
                <button 
                  onClick={() => { setPdfMenuOpen(false); onDownloadPDF('year'); }} 
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-black/5 text-left text-sm font-semibold"
                >
                  <FileDown size={16} /> PDF do ano
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}