import { NAV, DEFAULT_NAV } from '../utils/config';

const ICONS = {
  dashboard: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
  statement: <><path d="M4 2v20l2-1.5L8 22l2-1.5L12 22l2-1.5L16 22l2-1.5L20 22V2l-2 1.5L16 2l-2 1.5L12 2 10 3.5 8 2 6 3.5z" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="13" y2="16" /></>,
  charts: <><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></>,
  settings: <><line x1="4" y1="6" x2="14" y2="6" /><line x1="18" y1="6" x2="20" y2="6" /><circle cx="16" cy="6" r="2" /><line x1="4" y1="12" x2="6" y2="12" /><line x1="10" y1="12" x2="20" y2="12" /><circle cx="8" cy="12" r="2" /><line x1="4" y1="18" x2="14" y2="18" /><line x1="18" y1="18" x2="20" y2="18" /><circle cx="16" cy="18" r="2" /></>,
  invoices: <><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></>,
  investments: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>,
};

export default function BottomNav({ tab, onTab, onAdd, items: ids = DEFAULT_NAV }) {
  const make = (id) => ({ id, label: NAV[id], icon: ICONS[id] });
  const items = ids.slice(0, 2).map(make);
  const itemsRight = ids.slice(2, 4).map(make);

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