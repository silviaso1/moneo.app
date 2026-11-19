export default function Modal({ open, onClose, title, children }) {
  return (
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-end z-[99999] transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`bg-white w-full max-w-[500px] rounded-t-[32px] max-h-[90vh] flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Header Fixo do Modal */}
        <div className="flex justify-between items-center p-6 pb-2 shrink-0 border-b border-transparent">
          <h3 className="text-xl font-bold text-black">{title}</h3>
          <button onClick={onClose} className="bg-[#f0f0f0] w-9 h-9 rounded-full flex justify-center items-center text-black">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        
        {/* Conteúdo Rolável */}
        <div className="p-6 pt-2 overflow-y-auto no-scrollbar flex-1 pb-12">
          {children}
        </div>
      </div>
    </div>
  );
}