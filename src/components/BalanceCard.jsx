import AccountRow from './AccountRow';
import { formatCurrency } from '../utils/formatCurrency';

export default function BalanceCard({ accounts, totalBalance, hidden, showAll, onToggleVisibility, onToggleShowAll }) {
  const shown = showAll ? accounts : accounts.slice(0, 3);
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#e0e0e0]">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-[#8e8e93]">Saldo em todas as contas</span>
        <button onClick={onToggleVisibility} className="text-[#8e8e93]">
          {hidden ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          )}
        </button>
      </div>
      <div className="text-[36px] font-extrabold tracking-tight flex items-baseline gap-1 text-black">
        <span className="text-lg font-semibold text-[#8e8e93]">R$</span>
        <span className={hidden ? 'tracking-widest' : ''}>{hidden ? '••••••' : formatCurrency(totalBalance)}</span>
      </div>
      <div className="mt-4">
        {shown.map((acc) => <AccountRow key={acc.id} acc={acc} hidden={hidden} />)}
      </div>
      {accounts.length > 3 && (
        <button onClick={onToggleShowAll} className="w-full text-center text-[13px] font-semibold text-[#8e8e93] mt-2 py-2 hover:text-black">
          {showAll ? 'Ver menos' : 'Ver mais contas'}
        </button>
      )}
    </div>
  );
}