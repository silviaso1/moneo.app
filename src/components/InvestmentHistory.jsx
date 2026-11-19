import { formatCurrency } from '../utils/formatCurrency';

export default function InvestmentHistory({ items, onDelete, onEdit }) {
  if (items.length === 0) {
    return <p className="text-[#8e8e93] text-center py-5">Nenhum rendimento registrado neste mês.</p>;
  }
  return (
    <>
      {[...items].reverse().map((inv, i) => (
        <div key={inv.id || i} className="flex justify-between py-4 border-b border-[#e0e0e0] last:border-b-0">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="2" x2="12" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-black">{inv.desc || 'Rendimento'}</h4>
              <span className="text-xs text-[#8e8e93] block mt-0.5">Dia {inv.day} · {inv.bank}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="font-bold text-[15px] text-[#34c759] mr-2">+ R$ {formatCurrency(inv.value)}</div>
            <button onClick={() => onEdit(inv)} className="p-1.5 text-[#8e8e93] hover:bg-[#f0f0f0] hover:text-black rounded-md transition-colors" title="Editar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button onClick={() => onDelete(inv.id)} className="p-1.5 text-[#8e8e93] hover:bg-[#ffe5e5] hover:text-[#ff3b30] rounded-md transition-colors" title="Excluir">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            </button>
          </div>
        </div>
      ))}
    </>
  );
}