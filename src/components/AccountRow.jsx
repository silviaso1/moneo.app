import { brazilianBanks, getBankLogoUrl } from '../utils/banks';
import { formatCurrency } from '../utils/formatCurrency';

export default function AccountRow({ acc, hidden }) {
  const bank = brazilianBanks.find(b => b.name === acc.name);
  const logoUrl = bank ? getBankLogoUrl(bank.ispb) : null;

  return (
    <div className="flex items-center justify-between py-3 border-b border-[#f0f0f0] last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={acc.name} 
              className="w-6 h-6 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <span 
            className={`w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold ${logoUrl ? 'hidden' : 'flex'}`}
            style={{ backgroundColor: bank?.color || acc.color || '#000' }}
          >
            {acc.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-[15px] font-semibold text-black">{acc.name}</p>
          <p className="text-xs text-[#8e8e93]">{acc.type || 'Conta'}</p>
        </div>
      </div>
      <div className={`text-[15px] font-bold ${hidden ? 'tracking-widest' : ''}`}>
        {hidden ? '••••' : formatCurrency(acc.balance)}
      </div>
    </div>
  );
}