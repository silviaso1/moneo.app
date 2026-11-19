export default function BottomNav({ tab, onTab, onAdd }) {
  const items = [
    { id: 'dashboard', label: 'Início', icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></> },
    { id: 'statement', label: 'Extrato', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></> },
  ];
  const itemsRight = [
    { id: 'charts', label: 'Gráficos', icon: <><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></> },
    { id: 'settings', label: 'Ajustes', icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full z-[9999] pointer-events-none flex justify-center">
      {/* Ajustado pt-3 pb-2 para a navbar ficar mais baixa e colada na borda */}
      <nav className="w-full max-w-[1100px] bg-white flex justify-between items-center pt-3 pb-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-[32px] px-2 pointer-events-auto relative">
        
        {items.map((item) => (
          <button 
            key={item.id}
            type="button"
            onClick={() => onTab(item.id)} 
            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-semibold flex-1 h-full py-1 cursor-pointer pointer-events-auto ${tab === item.id ? 'text-black' : 'text-muted'}`}
          >
            <svg className="w-6 h-6 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
            <span className="pointer-events-none">{item.label}</span>
          </button>
        ))}
        
        {/* FAB (Botão +) */}
        <div className="relative flex justify-center w-16 h-16 shrink-0 pointer-events-none">
          <button 
            type="button"
            onClick={onAdd} 
            className="absolute -top-9 w-16 h-16 bg-black rounded-full flex justify-center items-center border-4 border-white shadow-xl active:scale-90 transition-transform pointer-events-auto cursor-pointer"
          >
            <svg className="pointer-events-none" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {itemsRight.map((item) => (
          <button 
            key={item.id}
            type="button"
            onClick={() => onTab(item.id)} 
            className={`flex flex-col items-center justify-center gap-1 text-[11px] font-semibold flex-1 h-full py-1 cursor-pointer pointer-events-auto ${tab === item.id ? 'text-black' : 'text-muted'}`}
          >
            <svg className="w-6 h-6 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
            <span className="pointer-events-none">{item.label}</span>
          </button>
        ))}

      </nav>
    </div>
  );
}