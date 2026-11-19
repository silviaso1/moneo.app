import { formatCurrency } from '../utils/formatCurrency';

export default function AccountRow({ acc, hidden }) {
  if (!acc) return null;

  return (
    <div className="flex justify-between items-center py-3 border-b border-[#e0e0e0] last:border-b-0">
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm text-white shrink-0" 
          style={{ background: acc.color || '#000' }}
        >
          {acc.name ? acc.name.charAt(0).toUpperCase() : '?'}
        </div>
        <div>
          <div className="font-semibold text-sm text-black leading-tight">{acc.name}</div>
          <div className="text-xs text-[#8e8e93]">
            {acc.type || 'Conta Corrente'} {acc.desc ? `· ${acc.desc}` : ''}
          </div>
        </div>
      </div>
      <div className="font-bold text-sm text-black">
        {hidden ? '•••' : `R$ ${formatCurrency(acc.balance)}`}
      </div>
    </div>
  );
}