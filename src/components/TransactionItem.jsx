import { useState } from 'react';

export default function TransactionItem({ tx }) {
  const [open, setOpen] = useState(false);
  const isExpense = tx.type === 'expense';

  return (
    <div className="py-4 border-b border-border last:border-b-0 cursor-pointer" onClick={() => setOpen(!open)}>
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-xl bg-[#f0f0f0] flex items-center justify-center">
            {isExpense ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 7 17 17 17" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="7" x2="17" y2="17" /><polyline points="17 7 17 17 7 17" /></svg>
            )}
          </div>
          <div>
            <h4 className="text-[15px] font-semibold">{tx.desc}</h4>
            <span className="text-xs text-muted block mt-0.5">{tx.date} · {tx.bank}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`font-bold text-[15px] text-right ${isExpense ? 'text-danger' : 'text-success'}`}>
            {isExpense ? '-' : '+'} R$ {tx.value.toFixed(2)}
          </div>
          <svg className={`transition-transform ${open ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
      {open && (
        <div className="pt-3 text-[13px] text-muted leading-relaxed">
          <strong>Categoria:</strong> {tx.category}<br />
          <strong>Método:</strong> {tx.method}<br />
          <strong>Conta:</strong> {tx.bank}
        </div>
      )}
    </div>
  );
}