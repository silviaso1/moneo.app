const actions = [
  { id: 'expense', label: 'Gasto', icon: <line x1="5" y1="12" x2="19" y2="12" /> },
  { id: 'income', label: 'Receita', icon: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></> },
  { id: 'investments', label: 'Juros', icon: <><line x1="12" y1="2" x2="12" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
  { id: 'settings', label: 'Limites', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
];

export default function QuickActions({ onOpenModal, onTab }) {
  const handle = (id) => {
    if (id === 'expense') onOpenModal('modal-expense');
    else if (id === 'income') onOpenModal('modal-income');
    else onTab(id);
  };
  return (
    <div className="flex justify-between mt-2.5 px-2.5 gap-3">
      {actions.map((a) => (
        <button key={a.id} onClick={() => handle(a.id)} className="flex flex-col items-center gap-2 flex-1">
          <div className="w-14 h-14 rounded-full bg-white border border-[#e0e0e0] flex justify-center items-center active:scale-90 active:bg-gray-50 transition text-black">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{a.icon}</svg>
          </div>
          <span className="text-[13px] font-semibold text-black">{a.label}</span>
        </button>
      ))}
    </div>
  );
}